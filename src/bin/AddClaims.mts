#!/usr/bin/env node

import fs from "node:fs";
import yaml from "yaml";
import { connectSingletonDatabase } from "../lib/infrastructure/Database.mjs";
import { initializeLogger, Logger } from "../lib/infrastructure/Logger.mjs";
import { Claim, ClaimModel } from "../lib/models/database/Claim.mjs";
import { claimMapper } from "../lib/models/mappers/ClaimMapper.mjs";
import { ClaimViewModel } from "../lib/models/responses/ClaimViewModel.mjs";

interface ClaimYaml {
  Claims: ClaimViewModel[];
}

initializeLogger();
const logger = Logger.get();

const saveClaim = (claim: Claim) => {
  const model = new ClaimModel(claim);
  try {
    const savedDoc = model.save();
    logger.info(`Saved: ${claim.name}`);
    return savedDoc;
  } catch (error) {
    logger.error({ message: error });
    logger.warn(`Failed to Save: ${claim.name}`);
    return null;
  }
};

const main = async () => {
  if (process.argv.length !== 3) {
    logger.error("Usage: node AddClaims.js [yaml File]");
    process.exit(1);
  }
  const yamlFile = process.argv[2];
  logger.info(`Reading File: ${yamlFile}`);

  const connect = connectSingletonDatabase();
  const read = fs.promises.readFile(yamlFile).then(d => yaml.parse(d.toString()) as ClaimYaml);

  const waited = await Promise.all([connect, read]);
  const yamlData = waited[1];
  logger.info("Read Valid File");

  const saveModels = yamlData.Claims.map(c => claimMapper.convertToBackend(c));
  const savedData = await Promise.all(saveModels.map(saveClaim));
  const savedTotal = savedData.filter(d => d !== null).length;
  if (savedTotal === savedData.length) {
    logger.info(`Success! Saved ${savedTotal} records`);
  } else {
    logger.warn(`Some records failed to save: ${savedTotal}/${savedData.length} Saved`);
  }
};

main()
  .then(() => process.exit(0))
  .catch(e => {
    logger.error({ message: e as Error });
    process.exit(1);
  });
