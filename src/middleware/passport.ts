import bcrypt from "bcrypt";
import { Request } from "express-serve-static-core";
import { PassportStatic } from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions as JwtStrategyOptions, VerifiedCallback } from "passport-jwt";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";

import { config, ConfigKey } from "../infastructure/config";
import { User } from "../models/database/user";

const errors = {
  GENERIC: "The username or password was incorrect.",
  NOT_VERIFIED: "The user's email address has not been verified",
  IS_LOCKED: `The user has been locked out for ${config.getString(ConfigKey.UserLockoutMinutes)} minutes`,
};

export interface IJwtPayload {
  aud: string;
  claims: string[];
  email: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
}

export const addLocalStrategy = (passport: PassportStatic) => {
  const maxLoginAttempts = config.getNumber(ConfigKey.UserPassMaxAttempts);
  const lockoutMilliseonds = config.getNumber(ConfigKey.UserLockoutMinutes) * 60 * 1000;

  const options: IStrategyOptionsWithRequest = {
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true,
  };

  passport.use(new LocalStrategy(options, async (request, email, password, done) => {
    try {
      const user = await User.findOne({email}).exec();
      if (!user) {
        return done(errors.GENERIC);
      }

      if (!user.isEmailVerified) {
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

      const passwordsMatch = await bcrypt.compare(password, user.password);

      if (passwordsMatch) {
        user.authenticationAttempts = undefined;
        user.authenticationDates.push(new Date());
        await user.save();

        return done(null, user);
      } else {
        user.authenticationAttempts = user.authenticationAttempts
          ? user.authenticationAttempts + 1 : 1;

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
  }));
};

export const addJwtStrategy = (passport: PassportStatic) => {
  const options: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
    audience: config.getString(ConfigKey.JwtAudience),
    issuer: config.getString(ConfigKey.JwtIssuer),
    algorithms: [config.getString(ConfigKey.JwtSigningAlgorithm)],
    passReqToCallback: true,
  };

  passport.use(new JwtStrategy(options, (req: Request, jwtPayload: IJwtPayload, done: VerifiedCallback) => {
    if (jwtPayload.exp && Date.now() / 1000 > jwtPayload.exp) {
      return done("JWT Expired");
    }

    req.user = jwtPayload;
    return done(null, jwtPayload);
  }));
};
