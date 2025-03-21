import { createLogger } from '@ojaaouani/logger/index';
import { createWorker, types } from 'mediasoup';
import { configuration } from '../../configuration/index.js';

export const workersLogger = createLogger({ serviceName: '@mediasoup_workers'});
export const workers: Array<types.Worker> = []

export async function startWorkers() {
    try {
        const numberOfWorkers = configuration.worker.numWorkers;
        workersLogger.info(`starting ${numberOfWorkers} workers`);
        
        for (let i = 0; i < numberOfWorkers; i++) {
            const worker = await createWorker({
                rtcMaxPort: configuration.worker.rtcMaxPort,
                rtcMinPort: configuration.worker.rtcMinPort
            });

            workersLogger.warn(`worker start finished with pid -> ${worker.pid}`)

            worker.once('died', () => {
                workersLogger.fatal(`worker::died pid -> ${worker.pid}`);
                setTimeout(() => process.exit(1), 2000);
            })

            workers.push(worker)
        }
    } catch(error) {
        workersLogger.fatal(`workers start failed`, error)
        process.exit(1)
    }
}