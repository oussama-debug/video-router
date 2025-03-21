import { createLogger, Logger } from '@ojaaouani/logger/index';
import express from 'express';
import { configuration } from './configuration/index.js';
import { startWorkers } from './mediasoup/workers/index.js';

class Application {
    private __application: express.Application;
    private __logger: Logger = createLogger({ serviceName: '@application'});

    constructor() {
        this.__application = express();
    }

    public async startMediasoup() {
        await startWorkers();
    }

    public listen() {
        this.__application.listen(configuration.webServer.port, () => {
            this.__logger.info(`Application server started at : ${3000}`)
        })
    }
}

export default Application;