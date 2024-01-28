#!/usr/bin/env node

import fs from "node:fs";
import yaml from "yaml";
import { connectSingletonDatabase } from "../lib/infrastructure/Database.mjs";
import { initializeLogger, Logger } from "../lib/infrastructure/Logger.mjs";
import { IdentityType } from "../lib/models/database/Identity.mjs";
import { User, UserModel } from "../lib/models/database/User.mjs";
import { userMapper } from "../lib/models/mappers/UserMapper.mjs";
import {
  PublicKeyIdentityViewModel,
  UserViewModel,
} from "../lib/models/responses/UserViewModel.mjs";

interface UserYaml {
  Users: UserViewModel[];
}

initializeLogger();
const logger = Logger.get();

const saveUser = (user: User) => {
  const model = new UserModel(user);
  try {
    const savedDoc = model.save();
    logger.info(`Saved: ${user.username}`);
    return savedDoc;
  } catch (error) {
    logger.error({ message: error });
    logger.warn(`Failed to Save: ${user.username}`);
    return null;
  }
};

const main = async () => {
  if (process.argv.length !== 3) {
    logger.error("Usage: node AddUsers.js [yaml File]");
    process.exit(1);
  }
  const yamlFile = process.argv[2];
  logger.info(`Reading File: ${yamlFile}`);

  const connect = connectSingletonDatabase();
  const read = fs.promises.readFile(yamlFile).then(d => yaml.parse(d.toString()) as UserYaml);

  const waited = await Promise.all([connect, read]);
  const yamlData = waited[1];
  logger.info("Read Valid File");

  const saveModelPromises = yamlData.Users.map(async u => {
    u.isLocked = false;

    const keyId = u.identities.find(
      i => i.type === IdentityType.PublicKey
    ) as PublicKeyIdentityViewModel;
    // Assume the key is a file if it doesn't end with the base64 terminator
    if (keyId && !keyId.publicKey.endsWith("=")) {
      keyId.publicKey = (await fs.promises.readFile(keyId.publicKey)).toString("base64");
    }

    return userMapper.convertToBackend(u);
  });
  const saveModels = await Promise.all(saveModelPromises);

  const savedData = await Promise.all(saveModels.map(saveUser));
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
