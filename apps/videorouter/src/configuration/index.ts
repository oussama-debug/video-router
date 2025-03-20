import { createLogger } from "@ojaaouani/logger/index";
import { loadConfiguration } from "@ojaaouani/configuration/index";
import { join, normalize } from "node:path";

export const configurationLogger = createLogger({
  serviceName: "@configuration",
});

export const configuration = loadConfiguration(
  normalize(join(import.meta.dirname, "../../../../router.config.toml"))
);
