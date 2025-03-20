import { cpus, networkInterfaces } from "node:os";
import { MediasoupConfiguration } from "./types.js";
import { existsSync, readFileSync } from "node:fs";
import toml from "toml";

export const defaultConfiguration: MediasoupConfiguration = {
  worker: {
    rtcMinPort: 10000,
    rtcMaxPort: 59999,
    logLevel: "warn",
    logTags: [
      "info",
      "ice",
      "dtls",
      "rtp",
      "srtp",
      "rtcp",
      "rtx",
      "bwe",
      "score",
      "simulcast",
      "svc",
    ],
    workerSettings: {},
    numWorkers: Math.min(4, cpus().length),
  },
  router: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "4d0032",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
    ],
    routerOptions: {},
  },
  webRtcTransport: {
    listenIps: [
      {
        ip: "0.0.0.0",
        announcedIp: undefined,
      },
    ],
    initialAvailableOutgoingBitrate: 1000000,
    minimumAvailableOutgoingBitrate: 600000,
    maximumAvailableOutgoingBitrate: 10000000,
  },
  webServer: {
    port: 3000,
    host: "0.0.0.0",
  },
};

/**
 * Determines the public IP address for WebRTC announcements
 * @returns string - the public IP for WebRTC announcements
 */

export function getPublicIP(): string {
  const interfaces = networkInterfaces();
  const addrs: string[] = [];

  Object.keys(interfaces).forEach((interfaceName) => {
    const intrface = interfaces[interfaceName];
    if (!intrface) return;

    intrface.forEach((details) => {
      if (details.family === "IPv4" && !details.internal)
        addrs.push(details.address);
    });
  });

  return addrs.length > 0 ? addrs[0] : "127.0.0.1";
}

/**
 * Load configuration from file ( TOML file )
 * @param configPath? - optional configuration path or by default config.toml
 * @returns MediasoupConfiguration - Mediasoup videorouter configuration
 */

export function loadConfiguration(path?: string): MediasoupConfiguration {
  const finalConfigurationPath = path || "../../router.config.toml";
  let config = defaultConfiguration;

  if (existsSync(finalConfigurationPath)) {
    try {
      const content = readFileSync(finalConfigurationPath, "utf-8");
      config = toml.parse(content);
    } catch (error) {}
  }

  //#set the publicIp explicitly
  if (
    config.webRtcTransport.listenIps[0] &&
    !config.webRtcTransport.listenIps[0].announcedIp
  ) {
    config.webRtcTransport.listenIps[0].announcedIp = getPublicIP();
  }

  return config as MediasoupConfiguration;
}
