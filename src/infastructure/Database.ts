import mongoose from "mongoose";

import { config, ConfigKey } from "./Config";
import { logger } from "./Logger";

const RECONNECT_TRIES = 60;
const RECONNECT_INTERVAL = 1000;

const connectionString = config.getString(ConfigKey.MongoDbConnectionString);

mongoose.connection.on("connecting", () => {
  logger.info(`MongoDB connecting: ${connectionString}`);
});

mongoose.connection.on("connected", () => {
  logger.info(`MongoDB connected: ${connectionString}`);
});

mongoose.connection.on("disconnected", () => {
  logger.info(`MongoDB disconnected: ${connectionString}`);
});

mongoose.connection.on("reconnected", () => {
  logger.info(`MongoDB reconnected: ${connectionString}`);
});

mongoose.connection.on("reconnectFailed", () => {
  logger.error(`MongoDB failed to reconnect: ${connectionString}`);
  // TODO email admin?

  process.exit(1);
});

mongoose.connection.on("error", (error) => {
  logger.error(`MongoDB Error: ${error}`);
  // TODO handle error
});

export const connectSingletonDatabase = () => {
  return mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      reconnectTries: RECONNECT_TRIES,
      reconnectInterval: RECONNECT_INTERVAL,
    })
    .catch((error) => {
      logger.error(error);
      logger.warn(`MongoDB initial connect failed: ${connectionString}`);
      process.exit(1);
    });
};
