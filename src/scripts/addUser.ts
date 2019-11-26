import { connectSingletonDatabase } from "../infastructure/database";
import { logger } from "../infastructure/logger";
import { UserConverter } from "../models/converters/userConverter";
import { IUser, User } from "../models/database/user";

const ADD_USER_PROGRAM_DESCRIPTOR = "node-user-service addUser.ts";

connectSingletonDatabase();

if (process.argv.length < 4) {
  logger.error("Usage: npm run addUser [email] [password] [...claims]");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];
const claims = process.argv.slice(4);

const userData = {
  email,
  password,
  claims,
};

const saveUser = (toSave: IUser) => {
  const user = new User(toSave);
  user.createdBy = ADD_USER_PROGRAM_DESCRIPTOR;
  user.modifiedBy = ADD_USER_PROGRAM_DESCRIPTOR;
  user.save()
    .then(() => { process.exit(0); })
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
};

const converter = new UserConverter();
converter
  .convertToBackend(userData)
  .then(saveUser)
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
