import bcrypt from "bcrypt";
import { PassportStatic } from "passport";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";
import { config } from "../../infrastructure/Config.mjs";
import { ConfigKey } from "../../infrastructure/ConfigKey.mjs";
import { Logger } from "../../infrastructure/Logger.mjs";
import { EmailPasswordIdentity, IdentityType } from "../../models/database/Identity.mjs";
import { UserModel } from "../../models/database/User.mjs";

export const PASSPORT_LOCAL_STRATEGY = "local";

const errors = {
  GENERIC: "The username or password was incorrect.",
  NOT_VERIFIED: "The user's email address has not been verified",
  IS_LOCKED: `The user has been locked out for ${config.getString(
    ConfigKey.UserLockoutMinutes
  )} minutes`,
};

export const addLocalStrategy = (passport: PassportStatic): void => {
  const logger = Logger.fromModuleUrl(import.meta.url);

  const maxLoginAttempts = config.getNumber(ConfigKey.UserPassMaxAttempts);
  const lockoutMilliseconds = config.getNumber(ConfigKey.UserLockoutMinutes) * 60 * 1000;

  const options: IStrategyOptionsWithRequest = {
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true,
  };

  passport.use(
    PASSPORT_LOCAL_STRATEGY,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    new LocalStrategy(options, async (_req, username, password, done) => {
      try {
        const user = await UserModel.findOne({ username }).exec();
        if (!user) {
          logger.debug(`Login attempted for missing user: ${username}`);
          return done(errors.GENERIC);
        }

        const emailIdentity = user.identities.find(
          i => i.type === IdentityType.EmailPassword
        ) as EmailPasswordIdentity;
        if (!emailIdentity) {
          logger.warn(`No EmailPassword identity found for user: ${username},${user.id as string}`);
          return done(errors.GENERIC);
        }

        if (!emailIdentity.isEmailVerified) {
          logger.debug(`Login attempted for non-verified user: ${username},${user.id as string}`);
          return done(errors.NOT_VERIFIED);
        }

        if (user.isLocked) {
          if (
            !user.isLockedDate ||
            Date.now() - user.isLockedDate.getTime() < lockoutMilliseconds
          ) {
            logger.debug(`Login attempted for locked user: ${username},${user.id as string}`);
            return done(errors.IS_LOCKED);
          }

          logger.debug(`Lockout period ended for locked user: ${username},${user.id as string}`);
          user.isLocked = false;
          user.isLockedDate = undefined;
          user.authenticationAttempts = undefined;
        }

        const passwordsMatch = await bcrypt.compare(password, emailIdentity.password);
        if (passwordsMatch) {
          logger.debug(`Login succeeded for user: ${username},${user.id as string}`, { username });

          user.authenticationAttempts = undefined;
          user.authenticationDates.push(new Date());
          await user.save();

          return done(null, user);
        }

        user.authenticationAttempts = user.authenticationAttempts
          ? user.authenticationAttempts + 1
          : 1;
        if (user.authenticationAttempts > maxLoginAttempts) {
          logger.warn("User locked after passing max login attempts", {
            userId: user.id as string,
            username: user.username,
          });

          user.isLocked = true;
          user.isLockedDate = new Date();
          await user.save();

          return done(errors.IS_LOCKED);
        }

        await user.save();
        return done(errors.GENERIC);
      } catch (error) {
        logger.error(error);
        done(errors.GENERIC);
      }
    })
  );
};
