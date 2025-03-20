import { LoggerOptions, LogLevel } from "./types.js";
import chalk, { type ChalkInstance } from "chalk";
import dayjs from "dayjs";
import { inspect } from "node:util";

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export const LOG_COLORS: Record<LogLevel, ChalkInstance> = {
  debug: chalk.cyan,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.magenta,
};

export const LOG_ICONS: Record<LogLevel, string> = {
  debug: "🔍",
  info: "✅",
  warn: "⚠️",
  error: "❌",
  fatal: "💀",
};

export class Logger {
  //#logger options are set to be required
  private __options: Required<LoggerOptions>;

  constructor(options: LoggerOptions = {}) {
    this.__options = {
      serviceName: options.serviceName || "videorouter",
      minLevel: options.minLevel || "debug",
      timestamp: options.timestamp !== false,
      colorize: options.colorize !== false,
      showIcons: options.showIcons !== false,
      format: options.format || "text",
    };
  }

  /**
   * A function to format the message to show the severity
   * @param level
   * @param message
   * @param meta
   */
  private format(
    level: LogLevel,
    message: string,
    meta?: any
  ): string | object {
    //#set an empty prefix and concat the message to it
    let prefix = "";
    let finalFormat = "";

    if (this.__options.format === "json")
      return {
        timestamp: this.__options.timestamp ? this.timestamp() : undefined,
        level,
        service: this.__options.serviceName,
        message,
        ...meta,
      };

    //#set the timestamp if defined
    if (this.__options.timestamp)
      prefix += this.__options.colorize
        ? chalk.gray(`[${this.timestamp()}]`)
        : `[${this.timestamp()}]`;

    //#set the icon level if defined
    if (this.__options.showIcons) prefix += ` ${LOG_ICONS[level]}`;

    //#set the level
    prefix += ` ${
      this.__options.colorize
        ? LOG_COLORS[level](`[${level.toUpperCase()}]`)
        : `[${level.toUpperCase()}]`
    }`;

    //#set the service
    prefix += ` ${
      this.__options.colorize
        ? chalk.blue(`[${this.__options.serviceName}]`)
        : `[${this.__options.serviceName}]`
    }`;

    finalFormat = `${prefix} ${message}`;

    if (meta) {
      const metaStr = inspect(meta, {
        colors: this.__options.colorize,
        depth: 5,
      });
      finalFormat += `\n${metaStr}`;
    }

    return finalFormat;
  }

  /**
   * A function to log the message according the severity level
   * @param level - the log level for the message
   * @param message - the content of the message can be an Error
   * @param meta - extra metadata
   */
  private log(level: LogLevel, message: string | Error, meta?: any): void {
    const msg =
      message instanceof Error ? message.stack || message.message : message;
    const finalFormat = this.format(level, msg, meta);
    const output =
      typeof finalFormat === "object"
        ? JSON.stringify(finalFormat)
        : finalFormat;

    switch (level) {
      case "error":
        console.error(output);
      case "fatal":
        console.error(output);
      default:
        console.log(output);
    }
  }

  /**
   * Returns current timestamp with @dayjs
   * @returns string - the formatted timestam
   */
  private timestamp(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
  }

  /**
   * Logs debug level
   * @param message - the message ( string )
   * @param meta - the metadata
   */
  debug(message: string | Error, meta?: any): void {
    this.log("debug", message, meta);
  }

  /**
   * Logs info level
   * @param message - the message ( string )
   * @param meta - the metadata
   */

  info(message: string | Error, meta?: any): void {
    this.log("info", message, meta);
  }

  /**
   * Logs warning level
   * @param message - the message ( string )
   * @param meta - the metadata
   */
  warn(message: string | Error, meta?: any): void {
    this.log("warn", message, meta);
  }

  /**
   * Logs error level
   * @param message - the message ( string )
   * @param meta - the metadata
   */
  error(message: string | Error, meta?: any): void {
    this.log("error", message, meta);
  }

  /**
   * Logs fatal level
   * @param message - the message ( string )
   * @param meta - the metadata
   */
  fatal(message: string | Error, meta?: any): void {
    this.log("fatal", message, meta);
  }
}

export const defaultLogger = new Logger();

//#Factory function to create a new logger
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}
