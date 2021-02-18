#!/usr/bin/env node

import fs from "fs";
import yaml from "yaml";

import { connectSingletonDatabase } from "../infastructure/Database";
import { initializeLogger, Logger } from "../infastructure/Logger";
import { claimMapper } from "../models/mappers/ClaimMapper";
import { Claim, IClaim } from "../models/database/Claim";
import { IClaimModel } from "../models/responses/IClaimModel";

interface IClaimYaml {
  Claims: IClaimModel[];
}

initializeLogger();
const logger = Logger.get();

const saveClaim = (claim: IClaim) =>
  new Promise((resolve, reject) => {
    new Claim(claim).save((error, doc) => {
      if (error) {
        logger.error({ message: error });
        logger.warn(`Failed to Save: ${claim.name}`);
        return resolve(null);
      }

      logger.info(`Saved: ${claim.name}`);
      resolve(doc);
    });
  });

const main = async () => {
  if (process.argv.length !== 3) {
    logger.error("Usage: node AddClaims.js [yaml File]");
    process.exit(1);
  }
  const yamlFile = process.argv[2];
  logger.info(`Reading File: ${yamlFile}`);

  const connect = connectSingletonDatabase();
  const read = fs.promises.readFile(yamlFile).then(d => yaml.parse(d.toString()) as IClaimYaml);

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
