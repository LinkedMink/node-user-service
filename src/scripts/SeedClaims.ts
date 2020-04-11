import fs from "fs";

import { connectSingletonDatabase } from "../infastructure/Database";
import { Logger } from "../infastructure/Logger";
import { ClaimConverter } from "../models/converters/ClaimConverter";
import { Claim, IClaim } from "../models/database/Claim";
import { IClaimModel } from "../models/IClaimModel";

const PROGRAM_DESCRIPTOR = "node-user-service seedClaims.ts";

const logger = Logger.get();

const loadJson = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf8");
  const properties = JSON.parse(data);

  return properties;
};

const claims = loadJson("./src/scripts/claims.json");

connectSingletonDatabase();

let hasProcessed = 0;

const saveClaim = (toSave: IClaim) => {
  const user = new Claim(toSave);
  user.save()
    .then(() => {
      hasProcessed++;
      if (hasProcessed >= claims.length) {
        process.exit(0);
      }
    })
    .catch((error) => {
      logger.error(error.stack);
      hasProcessed++;
      if (hasProcessed >= claims.length) {
        process.exit(0);
      }
    });
};

const converter = new ClaimConverter();
claims.forEach((claim: IClaimModel) => {
  const entity = converter.convertToBackend(claim, undefined, PROGRAM_DESCRIPTOR);
  saveClaim(entity);
});
