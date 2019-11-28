import { connectSingletonDatabase } from "../infastructure/database";
import { logger } from "../infastructure/logger";
import { UserConverter } from "../models/converters/userConverter";
import { IUser, User } from "../models/database/user";
import { IUserModel } from "../models/userModel";

const PROGRAM_DESCRIPTOR = "node-user-service addUser.ts";

connectSingletonDatabase();

if (process.argv.length < 4) {
  logger.error("Usage: npm run addUser [email] [password] [...claims]");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];
const claims = process.argv.slice(4);

const userData: IUserModel = {
  email,
  password,
  claims,
  isEmailVerified: true,
  isLocked: false,
};

const saveUser = (toSave: IUser) => {
  const user = new User(toSave);
  user.save()
    .then(() => { process.exit(0); })
    .catch((error) => {
      logger.error(error.stack);
      process.exit(1);
    });
};

const converter = new UserConverter();
const userModel = converter.convertToBackend(
  userData, undefined, PROGRAM_DESCRIPTOR);
saveUser(userModel);
