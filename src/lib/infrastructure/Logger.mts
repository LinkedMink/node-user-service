import path from "node:path";
import { fileURLToPath } from "node:url";
import { MESSAGE } from "triple-beam";
import type { ConditionalExcept, OmitIndexSignature } from "type-fest";
import {
  LeveledLogMethod,
  LoggerOptions,
  config as WinstonConfig,
  Logger as WinstonLogger,
  format,
  loggers,
  transports,
} from "winston";
import TransportStream from "winston-transport";
import { config } from "./Config.mjs";
import { ConfigKey } from "./ConfigKey.mjs";
import { isError, isString } from "./TypeCheck.mjs";

const { verbose: _1, silly: _2, ...LEVELS } = WinstonConfig.npm.levels;

// TODO SetReturnType<LeveledLogMethod, AppLogger> signature not working
export type AppLogger = ConditionalExcept<WinstonLogger, LeveledLogMethod> & {
  [K in keyof OmitIndexSignature<typeof LEVELS>]: LeveledLogMethod;
};

/**
 * Expose the logger options, so that output can be customized
 */
export class Logger {
  static GlobalLabel = "AppGlobal";

  static get optionsFunc(): (label: string) => LoggerOptions {
    return Logger.optionsFuncVal;
  }

  /**
   * Change the options before constructing a logger. A logger will use the options
   * set at the time the first get() is called for a specific label
   */
  static set optionsFunc(options: (label: string) => LoggerOptions) {
    Logger.optionsFuncVal = options;
  }

  /**
   * Wrap the Winston logger container, so we can get the same logger for each module.
   * @param label The label of the module we're logging
   * @return An instance of the logger
   */
  static get(label: string = Logger.GlobalLabel): AppLogger {
    if (!loggers.has(label)) {
      loggers.add(label, Logger.optionsFuncVal(label));
    }

    return loggers.get(label);
  }

  static fromModuleUrl(moduleUrl: string): AppLogger {
    const moduleFilename = path.basename(fileURLToPath(moduleUrl));
    const moduleName = moduleFilename.substring(
      0,
      moduleFilename.length - path.extname(moduleFilename).length
    );
    return Logger.get(moduleName);
  }

  static format(error: unknown): string {
    if (isError(error)) {
      return error.stack as string;
    } else if (isString(error)) {
      return error;
    }

    const stack = new Error().stack;
    return `Unspecified Unhandled Error: ${error as string} - ${stack}`;
  }

  private static optionsFuncVal: (label: string) => LoggerOptions;
}

/**
 * Should execute this as the first operation, so that any instances will be constructed with the specified options
 */
export const initializeLogger = (): AppLogger => {
  const getLoggerOptions = (label: string): LoggerOptions => {
    const combined = format.combine(
      format.errors({ stack: true }),
      format.label({ label, message: true }),
      format.cli({ levels: LEVELS }),
      format.timestamp(),
      format.printf(
        info =>
          `\x1b[1m${info.timestamp as string}\x1b[0m ${info[MESSAGE] as string}${info.stack ? "\n" + info.stack : ""}`
      )
    );

    const outputs: TransportStream[] = [];
    if (!config.isEnvironmentUnitTest) {
      outputs.push(
        new transports.Console({
          format: combined,
        })
      );
    }

    if (!config.isEnvironmentContainerized) {
      outputs.push(
        new transports.File({
          filename: config.getString(ConfigKey.LogFile),
          format: combined,
        })
      );
    }

    return {
      level: config.getString(ConfigKey.LogLevel),
      levels: LEVELS,
      transports: outputs,
    } as LoggerOptions;
  };

  Logger.optionsFunc = getLoggerOptions;

  const logger = Logger.get();
  process.on("uncaughtException", (error: unknown) => {
    logger.error(`uncaughtException: ${Logger.format(error)}`);
  });

  process.on("unhandledRejection", (error: unknown) => {
    logger.error(`unhandledRejection: ${Logger.format(error)}`);
  });

  logger.debug("Logger Initialized");

  return logger;
};
