import mongoose from "mongoose";

import { ConfigKey, getConfigValue } from "../infastructure/config";
import { logger } from "./logger";

export const connectSingletonDatabase = () => {
  const connectionString = getConfigValue(ConfigKey.MongoDbConnectionString);
  mongoose.connect(connectionString, { useNewUrlParser: true }, (error) => {
    logger.error(error);
    logger.info("Intialize MongoDB connection required: exiting");
    process.exit(1);
  });

  mongoose.connection.on("error", (error) => {
    logger.error(error);
    // TODO handle disconnect
  });
};
