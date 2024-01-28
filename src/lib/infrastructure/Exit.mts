import { Logger } from "./Logger.mjs";

export enum ExitCode {
  Success = 0,
  UnspecifiedError = 1,
  UncaughtException = 2,
}

export type ExitFunc = (exitCode?: ExitCode) => void;

const signalNumber: Record<string, number> = {
  SIGINT: 2,
  SIGTERM: 15,
};

const getSignalExitCode = (signal: NodeJS.Signals) =>
  signalNumber[signal] ? 128 + signalNumber[signal] : ExitCode.UnspecifiedError;

export const executeOnExit = (handler: ExitFunc): void => {
  const logger = Logger.fromModuleUrl(import.meta.url);

  let hasRanExitHandler = false;
  process.on("exit", code => {
    if (!hasRanExitHandler) {
      logger.debug(`Executing on exit start: Code=${code}`);

      try {
        handler(code);
      } catch (e) {
        logger.error(`Exit Handler Error: ${Logger.format(e)}`);
      } finally {
        hasRanExitHandler = true;
      }

      logger.info(`Exit Code: ${code}`);
    } else {
      logger.debug(`Already ran exit handler, skipping`);
    }
  });

  process.on("unhandledRejection", (_error: unknown) => {
    logger.debug("Running exit cleanup on unhandledRejection");
    process.exit(ExitCode.UncaughtException);
  });

  process.on("uncaughtException", (_error: unknown) => {
    logger.debug("Running exit cleanup on uncaughtException");
    process.exit(ExitCode.UncaughtException);
  });

  const handleSignal = (signal: NodeJS.Signals) => {
    logger.verbose(`Received OS Signal=${signal}, running exit cleanup`);
    process.exit(getSignalExitCode(signal));
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);
};
