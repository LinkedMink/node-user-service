import winston from "winston";

import { ConfigKey, getConfigValue, isEnvironmentLocal } from "./config";

export const logger = winston.createLogger({
  level: getConfigValue(ConfigKey.LogLevel),
  format: winston.format.json(),
  // defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: getConfigValue(ConfigKey.LogFile) }),
  ],
});

if (isEnvironmentLocal) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
