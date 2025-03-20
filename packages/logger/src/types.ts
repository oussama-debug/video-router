export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LoggerOptions {
  serviceName?: string;
  minLevel?: LogLevel;
  timestamp?: boolean;
  colorize?: boolean;
  showIcons?: boolean;
  format?: "json" | "text";
}
