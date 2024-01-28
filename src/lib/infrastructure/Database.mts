import mongoose from "mongoose";
import { config } from "./Config.mjs";
import { ConfigKey } from "./ConfigKey.mjs";
import { Logger } from "./Logger.mjs";

let singletonMongoose: typeof mongoose | undefined;

export const connectSingletonDatabase = async (): Promise<typeof mongoose> => {
  if (singletonMongoose) {
    return singletonMongoose;
  }

  const logger = Logger.fromModuleUrl(import.meta.url);

  const connectionString = config.getString(ConfigKey.MongoDbConnectionString);
  const maskedConnectionString = connectionString.replace(
    /mongodb:\/\/.*@/,
    "mongodb://**********:**********@"
  );

  mongoose.connection.on("connecting", () => {
    logger.info(`MongoDB connecting: ${maskedConnectionString}`);
  });

  mongoose.connection.on("connected", () => {
    logger.info(`MongoDB connected: ${maskedConnectionString}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info(`MongoDB disconnected: ${maskedConnectionString}`);
  });

  mongoose.connection.on("reconnected", () => {
    logger.info(`MongoDB reconnected: ${maskedConnectionString}`);
  });

  mongoose.connection.on("reconnectFailed", () => {
    logger.error(`MongoDB failed to reconnect: ${maskedConnectionString}`);
    // TODO email admin?

    throw new Error("Failed to reconnected after multiple attempts");
  });

  mongoose.connection.on("error", error => {
    logger.error({ message: error as Error });
    // TODO handle error
  });

  try {
    singletonMongoose = await mongoose.connect(connectionString, {
      autoCreate: true,
      autoIndex: true,
    });
    return singletonMongoose;
  } catch (error) {
    logger.error(`MongoDB initial connect failed: ${maskedConnectionString}`);
    throw error;
  }
};

export const disconnectSingletonDatabase = (): Promise<void> => {
  if (!singletonMongoose) {
    throw new Error("Mongoose singleton has not connected yet");
  }

  return singletonMongoose.disconnect();
};
