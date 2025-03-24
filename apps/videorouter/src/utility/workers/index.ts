import { createLogger } from "@ojaaouani/logger/index";
import { createWorker, types } from "mediasoup";
import { configuration } from "../../configuration/index.js";

export const workersLogger = createLogger({
  serviceName: "@mediasoup_workers",
});

export async function startWorkers(): Promise<Array<types.Worker>> {
  const workers: Array<types.Worker> = [];
  const numberOfWorkers = configuration.worker.numWorkers;
  workersLogger.info(`starting ${numberOfWorkers} workers`);

  try {
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = await createWorker({
        rtcMaxPort: configuration.worker.rtcMaxPort,
        rtcMinPort: configuration.worker.rtcMinPort,
      });

      workersLogger.warn(`worker start finished with pid -> ${worker.pid}`);

      worker.once("died", () => {
        workersLogger.fatal(`worker::died pid -> ${worker.pid}`);
        setTimeout(() => process.exit(1), 2000);
      });

      workers.push(worker);
    }

    return workers;
  } catch (error) {
    workersLogger.fatal(`workers start failed`, error);
    process.exit(1);
  }
}

export function getNextWorkerId(
  workers: Array<types.Worker>,
  nextWorkerId: number
): types.Worker {
  const worker = workers[nextWorkerId];
  nextWorkerId = (nextWorkerId + 1) % workers.length;
  return worker;
}
