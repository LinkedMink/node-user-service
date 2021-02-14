import bcrypt from "bcrypt";
import { PassportStatic } from "passport";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";

import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { IdentityType, IEmailPasswordIdentity } from "../models/database/Identity";
import { User } from "../models/database/User";

export const PASSPORT_LOCAL_STRATEGY = "local";

const errors = {
  GENERIC: "The username or password was incorrect.",
  NOT_VERIFIED: "The user's email address has not been verified",
  IS_LOCKED: `The user has been locked out for ${config.getString(
    ConfigKey.UserLockoutMinutes
  )} minutes`,
};

export const addLocalStrategy = (passport: PassportStatic): void => {
  const maxLoginAttempts = config.getNumber(ConfigKey.UserPassMaxAttempts);
  const lockoutMilliseonds = config.getNumber(ConfigKey.UserLockoutMinutes) * 60 * 1000;

  const options: IStrategyOptionsWithRequest = {
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true,
  };

  passport.use(
    PASSPORT_LOCAL_STRATEGY,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    new LocalStrategy(options, async (req, email, password, done) => {
      try {
        const user = await User.findOne({ username: email }).exec();
        if (!user) {
          return done(errors.GENERIC);
        }

        const emailIdentity = user.identities.find(
          i => i.type === IdentityType.EmailPassword
        ) as IEmailPasswordIdentity;
        if (!emailIdentity) {
          return done(errors.GENERIC);
        }

        if (!emailIdentity.isEmailVerified) {
          return done(errors.NOT_VERIFIED);
        }

        if (user.isLocked) {
          if (user.isLockedDate && Date.now() - user.isLockedDate.getTime() > lockoutMilliseonds) {
            user.isLocked = false;
            user.isLockedDate = undefined;
            user.authenticationAttempts = undefined;
          } else {
            return done(errors.IS_LOCKED);
          }
        }

        const passwordsMatch = await bcrypt.compare(password, emailIdentity.password);

        if (passwordsMatch) {
          user.authenticationAttempts = undefined;
          user.authenticationDates.push(new Date());
          await user.save();

          return done(null, user);
        } else {
          user.authenticationAttempts = user.authenticationAttempts
            ? user.authenticationAttempts + 1
            : 1;

          if (user.authenticationAttempts > maxLoginAttempts) {
            user.isLocked = true;
            user.isLockedDate = new Date();
            await user.save();
            return done(errors.IS_LOCKED);
          }

          await user.save();
          return done(errors.GENERIC);
        }
      } catch (error) {
        done(error);
      }
    })
  );
};
