import { types } from "mediasoup";
import { type Socket } from "socket.io";
import { createLogger, Logger } from "@ojaaouani/logger/index";
import {
  CHANNEL_ROOM_CLOSE,
  CHANNEL_ROOM_CREATE,
  REDIS_CHANNEL_PREFIX,
  redisClient,
  redisPublisher,
} from "../../utility/redis/index.js";

import { configuration } from "../../configuration/index.js";

export interface Peer {
  id: string;
  roomId: string;
  socket: Socket;
  displayName: string;
  device: {
    name: string;
    version: string;
  };
  transports: Map<string, types.WebRtcTransport>;
  producers: Map<string, types.Producer>;
  consumers: Map<string, types.Consumer>;
  dataProducers: Map<string, types.DataProducer>;
  dataConsumers: Map<string, types.DataConsumer>;
}

export interface Room {
  id: string;
  router: types.Router;
  peers: Map<string, Peer>;
  createdAt: number;
}

export class RoomService {
  private __rooms: Map<string, Room> = new Map<string, Room>();
  // private __peers: Map<string, Peer> = new Map<string, Peer>();
  private __workers: Array<types.Worker> = [];
  private __logger: Logger = createLogger({ serviceName: "@mediasoup_rooms" });
  private __nodeId: string = "";
  private __nextWorkerId: number = 0;

  constructor(nodeId: string, workers: Array<types.Worker>) {
    this.__nodeId = nodeId;
    this.__workers = workers;
  }

  public getNextWorkerId(): types.Worker {
    const worker = this.__workers[this.__nextWorkerId];
    this.__nextWorkerId = (this.__nextWorkerId + 1) % this.__workers.length;
    return worker;
  }

  public async findOrCreate(roomId: string): Promise<Room> {
    let findRoom = this.__rooms.get(roomId);
    if (findRoom) return findRoom;

    //#get room in redis first
    const data = await redisClient.hgetall(
      `${REDIS_CHANNEL_PREFIX}room:${roomId}`
    );
    if (data && Object.keys(data).length > 0)
      this.__logger.info(
        `Room with id -> ${roomId} was found in redis, creating it locally`
      );

    const worker = this.getNextWorkerId();
    const router = await worker.createRouter({
      mediaCodecs: configuration.router.mediaCodecs,
    });

    this.__logger.info(
      `Creating room with id -> ${roomId} on nodeId -> ${this.__nodeId} and workerId -> ${this.__nextWorkerId}`
    );

    findRoom = {
      id: roomId,
      router: router,
      peers: new Map<string, Peer>(),
      createdAt: Date.now(),
    };

    //#create the room
    this.__rooms.set(roomId, findRoom);

    await redisClient.hset(
      `${REDIS_CHANNEL_PREFIX}room:${roomId}`,
      "nodeId",
      this.__nodeId,
      "createdAt",
      Date.now().toString()
    );

    //#publish the room creation event
    await redisPublisher.publish(
      CHANNEL_ROOM_CREATE,
      JSON.stringify({
        roomId,
        nodeId: this.__nodeId,
      })
    );

    return findRoom;
  }

  public async closeRoom(roomId: string) {
    this.__logger.info(
      `Closing with id -> ${roomId} on nodeId -> ${this.__nodeId} and workerId -> ${this.__nextWorkerId}`
    );

    const findRoom = this.__rooms.get(roomId);
    if (!findRoom) return findRoom;

    //#Close all peers
    for (const peer of findRoom.peers.values()) {
      this.closePeer(peer);
    }

    this.__rooms.delete(roomId);

    await redisClient.del(`${REDIS_CHANNEL_PREFIX}room:${roomId}`);

    await redisPublisher.publish(
      CHANNEL_ROOM_CLOSE,
      JSON.stringify({
        roomId,
        nodeId: this.__nodeId,
      })
    );
  }

  public async closePeer(peer: Peer) {
    const findRoom = this.__rooms.get(peer.roomId);
    if (!findRoom) return;

    this.__logger.info(
      `Closing peer ${peer.id} in room ${peer.roomId} on nodeId -> ${this.__nodeId} and workerId -> ${this.__nextWorkerId}`
    );

    //#close all consumers
    for (const consumer of peer.consumers.values()) consumer.close();
    peer.consumers.clear();

    //#close all producers
    for (const producer of peer.producers.values()) producer.close();
    peer.producers.clear();

    //#close all data consumers
    for (const dataConsumer of peer.dataConsumers.values())
      dataConsumer.close();
    peer.dataConsumers.clear();

    //#close all data producers
    for (const dataProducer of peer.dataProducers.values())
      dataProducer.close();
    peer.dataProducers.clear();

    //#close all transports
    for (const transport of peer.transports.values()) transport.close();
    peer.transports.clear();

    //#remove from room
    findRoom.peers.delete(peer.id);

    //#If the room is now empty, mark it for potential cleanup
    //#30s
    if (findRoom.peers.size === 0) {
      setTimeout(() => {
        const currentRoom = this.__rooms.get(peer.roomId);
        if (currentRoom && currentRoom.peers.size === 0) {
          this.closeRoom(peer.roomId);
        }
      }, 30000);
    }
  }
}
