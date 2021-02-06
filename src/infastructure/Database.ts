import mongoose from "mongoose";
import path from "path";

import { config } from "./Config";
import { ConfigKey } from "./ConfigKey";
import { Logger } from "./Logger";

export const connectSingletonDatabase = (): Promise<typeof mongoose> => {
  const logger = Logger.get(path.basename(__filename));
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

  mongoose.connection.on("error", error => {
    logger.error(error);
    // TODO handle error
  });

  return mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .catch(error => {
      logger.error(error);
      logger.warn(`MongoDB initial connect failed: ${connectionString}`);
      process.exit(1);
    });
};
