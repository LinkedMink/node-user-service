#!/usr/bin/env node

import fs from "node:fs";
import { ExitCode } from "../lib/infrastructure/Exit.mjs";
import { initializeLogger, Logger } from "../lib/infrastructure/Logger.mjs";
import { generateOpenApiDoc, OPENAPI_DOCUMENT_PATH } from "../lib/infrastructure/OpenApi.mjs";

initializeLogger();
const logger = Logger.get();

const main = async (): Promise<ExitCode> => {
  logger.info("Generate OpenAPI Doc - Start");

  const swaggerDoc = generateOpenApiDoc();
  if (!swaggerDoc) {
    logger.info("Failed to generate OpenAPI Doc");
    return ExitCode.UnspecifiedError;
  }

  const docData = JSON.stringify(swaggerDoc);
  await fs.promises.writeFile(OPENAPI_DOCUMENT_PATH, docData);

  logger.info(`Success! OpenAPI Doc Written: ${OPENAPI_DOCUMENT_PATH}`);

  return ExitCode.Success;
};

void main().then(c => process.exit(c));
