import { createLogger, Logger } from "@ojaaouani/logger/index";
import express from "express";
import { configuration } from "./configuration/index.js";
import { WorkerManager } from "./services/workers/index.js";
import { RoomService } from "./services/rooms/index.js";
import { Server } from "socket.io";
import http from "node:http";

import { v4 } from "uuid";
import {
  CHANNEL_PEER_JOIN,
  CHANNEL_PEER_LEAVE,
  CHANNEL_PRODUCER_ADD,
  CHANNEL_PRODUCER_REMOVE,
  CHANNEL_ROOM_CLOSE,
  CHANNEL_ROOM_CREATE,
  redisSub,
} from "./utility/redis/index.js";

class Application extends WorkerManager {
  private __application: express.Application;
  private __appServer: http.Server | null = null;
  private __appLogger: Logger = createLogger({ serviceName: "@application" });
  private __roomsService: RoomService | null = null;
  private __appIO: Server | null = null;
  private __nodeId: string = v4();

  constructor() {
    super();
    this.__application = express();
    this.__appServer = http.createServer(this.__application);
  }

  public async run() {
    const workers = await this.startWorkers();
    this.__appLogger.info(
      `${workers.length} workers successfully created on nodeId -> ${this.__nodeId}`
    );
    this.__roomsService = new RoomService(this.__nodeId, workers);

    //#events loop
    await this.subscribe();
    await this.loop();
  }
  public nodeId() {
    return this.__nodeId;
  }

  public async roomService(): Promise<RoomService | null> {
    return this.__roomsService;
  }

  public async listen() {
    this.__appIO = await this.startEvents();
    this.__appServer!.listen(configuration.webServer.port, () => {
      this.__appLogger.info(
        `Application server started at : ${configuration.webServer.port} on nodeId -> ${this.__nodeId}`
      );
    });
  }

  private async startEvents(): Promise<Server> {
    const ioServer = new Server(this.__appServer!, {
      transports: ["websocket"],
      cors: {
        origin: "*",
      },
    });
    return ioServer;
  }

  private async subscribe() {
    await redisSub.subscribe(
      CHANNEL_ROOM_CREATE,
      CHANNEL_ROOM_CLOSE,
      CHANNEL_PEER_JOIN,
      CHANNEL_PEER_LEAVE,
      CHANNEL_PRODUCER_ADD,
      CHANNEL_PRODUCER_REMOVE
    );
  }

  private async loop() {
    this.__appIO!.on("connection", async (socket) => {
      this.__appLogger.info(
        `new socket connection -> ${socket.id} on nodeId -> ${this.__nodeId}`
      );
    });
  }
}

export default Application;
