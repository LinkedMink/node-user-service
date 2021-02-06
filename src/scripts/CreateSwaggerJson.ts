#!/usr/bin/env node

import fs from "fs";

import { initializeLogger, Logger } from "../infastructure/Logger";

initializeLogger();
const logger = Logger.get();

const main = async () => {
  let docFilePath = process.argv.length > 2 ? process.argv[2] : "";

  const swaggerDoc = await import("../infastructure/Swagger")
    .then(m => {
      if (!docFilePath) {
        docFilePath = m.DEFAULT_SWAGGER_DOC_FILE;
      }

      logger.info("Generate Swagger Doc - Start");
      return m.generateSwaggerDoc();
    })
    .catch(e => {
      Logger.get().info("Generate Swagger Doc - End - Swagger Disabled");
      Logger.get().verbose(e);
      process.exit(0);
    });

  logger.info("Generate Swagger Doc - End");

  const docData = JSON.stringify(swaggerDoc, undefined, 2);
  fs.writeFileSync(docFilePath, docData);

  logger.info(`Swagger Doc Written: ${docFilePath}`);
};

void main()
  .then(() => process.exit(0))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  });
