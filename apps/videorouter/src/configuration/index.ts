import { createLogger } from "@ojaaouani/logger/index";
import { loadConfiguration } from "@ojaaouani/configuration/index";
import { dirname, normalize, join } from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

export const configurationLogger = createLogger({
  serviceName: "@configuration",
});

export const configuration = loadConfiguration(
  normalize(join(__dirname, "../../../../router.config.toml"))
);
