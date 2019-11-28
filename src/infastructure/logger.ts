import winston from "winston";

import { ConfigKey, Environment, getConfigValue } from "./config";

export const logger = winston.createLogger({
  level: getConfigValue(ConfigKey.LogLevel),
  format: winston.format.json(),
  // defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: getConfigValue(ConfigKey.LogFile) }),
  ],
});

if (process.env.NODE_ENV !== Environment.Test) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

process.on("unhandledRejection", (reason, p) => {
  let errorMessage = `Unhandled Rejection at: Promise: ${p}`;

  const error = reason as Error;
  if (error.message) {
    errorMessage += `message: ${error.message}`;
  }

  if (error.stack) {
    errorMessage += `stack: ${error.stack}`;
  }

  logger.warn(errorMessage);
});
