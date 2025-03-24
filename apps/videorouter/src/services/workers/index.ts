import { createLogger, Logger } from "@ojaaouani/logger/index";
import { createWorker, types } from "mediasoup";
import { configuration } from "../../configuration/index.js";

export class WorkerManager {
  protected _workers: Array<types.Worker> = [];
  protected _nextWorkerId: number = 0;
  protected _logger: Logger = createLogger({
    serviceName: "@mediasoup_workers",
  });

  public async startWorkers(): Promise<Array<types.Worker>> {
    const numberOfWorkers = configuration.worker.numWorkers;
    this._logger.info(`starting ${numberOfWorkers} workers`);

    try {
      for (let i = 0; i < numberOfWorkers; i++) {
        const worker = await createWorker({
          rtcMaxPort: configuration.worker.rtcMaxPort,
          rtcMinPort: configuration.worker.rtcMinPort,
        });

        this._logger.warn(`worker start finished with pid -> ${worker.pid}`);

        worker.once("died", () => {
          this._logger.fatal(`worker::died pid -> ${worker.pid}`);
          setTimeout(() => process.exit(1), 2000);
        });

        this._workers.push(worker);
      }

      return this._workers;
    } catch (error) {
      this._logger.fatal(`workers start failed`, error);
      process.exit(1);
    }
  }

  public getWorkers(): Array<types.Worker> {
    return this._workers;
  }
}
