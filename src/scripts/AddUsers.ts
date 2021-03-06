#!/usr/bin/env node

import fs from "fs";
import yaml from "yaml";

import { connectSingletonDatabase } from "../infastructure/Database";
import { initializeLogger, Logger } from "../infastructure/Logger";
import { userMapper } from "../models/mappers/UserMapper";
import { User, IUser } from "../models/database/User";
import { IPublicKeyIdentityModel, IUserModel } from "../models/responses/IUserModel";
import { IdentityType } from "../models/database/Identity";

interface IUserYaml {
  Users: IUserModel[];
}

initializeLogger();
const logger = Logger.get();

const saveUser = (user: IUser) =>
  new Promise((resolve, reject) => {
    new User(user).save((error, doc) => {
      if (error) {
        logger.error({ message: error });
        logger.warn(`Failed to Save: ${user.username}`);
        return resolve(null);
      }

      logger.info(`Saved: ${user.username}`);
      resolve(doc);
    });
  });

const main = async () => {
  if (process.argv.length !== 3) {
    logger.error("Usage: node AddUsers.js [yaml File]");
    process.exit(1);
  }
  const yamlFile = process.argv[2];
  logger.info(`Reading File: ${yamlFile}`);

  const connect = connectSingletonDatabase();
  const read = fs.promises.readFile(yamlFile).then(d => yaml.parse(d.toString()) as IUserYaml);

  const waited = await Promise.all([connect, read]);
  const yamlData = waited[1];
  logger.info("Read Valid File");

  const saveModelPromises = yamlData.Users.map(async u => {
    u.isLocked = false;

    const keyId = u.identities.find(i => i.type === IdentityType.PublicKey) as IPublicKeyIdentityModel;
    // Assume the key is a file if it doesn't end with the base64 terminator
    if (keyId && !keyId.publicKey.endsWith('=')) {
      keyId.publicKey = (await fs.promises.readFile(keyId.publicKey)).toString('base64')
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
