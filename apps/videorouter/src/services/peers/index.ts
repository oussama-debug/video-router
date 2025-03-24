import { types } from "mediasoup";
import { type Socket } from "socket.io";

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
