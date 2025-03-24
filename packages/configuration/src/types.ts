import { types } from "mediasoup";

export interface MediasoupConfiguration {
  //#worker settings
  worker: {
    rtcMinPort: number;
    rtcMaxPort: number;
    logLevel: "debug" | "warn" | "error" | "none";
    logTags: string[];
    workerSettings: types.WorkerSettings;
    numWorkers: number;
  };
  //#router settings
  router: {
    mediaCodecs: types.RtpCodecCapability[];
    routerOptions: types.RouterOptions;
  };
  //#webrtc settings
  webRtcTransport: {
    listenIps: {
      ip: string;
      announcedIp?: string;
    }[];
    initialAvailableOutgoingBitrate: number;
    minimumAvailableOutgoingBitrate: number;
    maximumAvailableOutgoingBitrate: number;
    options?: types.WebRtcTransportOptions;
  };
  //#server settings
  webServer: {
    port: number;
    host: string;
    ssl?: {
      cert: string;
      key: string;
    };
  };
  //#redis settings
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    prefix: string;
  };
}
