import fs from "fs";

import { connectSingletonDatabase } from "../infastructure/database";
import { logger } from "../infastructure/logger";
import { IClaimModel } from "../models/claimModel";
import { ClaimConverter } from "../models/converters/claimConverter";
import { Claim, IClaim } from "../models/database/claim";

const PROGRAM_DESCRIPTOR = "node-user-service seedClaims.ts";

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
