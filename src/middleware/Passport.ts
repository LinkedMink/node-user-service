import bcrypt from "bcrypt";
import { Request } from "express";
import { PassportStatic } from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions as JwtStrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";

import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { User } from "../models/database/User";

export const PASSPORT_JWT_STRATEGY = "jwt";
export const PASSPORT_LOCAL_STRATEGY = "local";

const errors = {
  GENERIC: "The username or password was incorrect.",
  NOT_VERIFIED: "The user's email address has not been verified",
  IS_LOCKED: `The user has been locked out for ${config.getString(
    ConfigKey.UserLockoutMinutes
  )} minutes`,
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

export interface IUserSession extends Omit<IJwtPayload, "claims"> {
  claims: Set<string>;
  record?: Record<string, unknown>;
}

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
    new LocalStrategy(options, async (request, email, password, done) => {
      try {
        const user = await User.findOne({ email }).exec();
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

export const addJwtStrategy = (passport: PassportStatic): void => {
  const options: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
    audience: config.getString(ConfigKey.JwtAudience),
    issuer: config.getString(ConfigKey.JwtIssuer),
    algorithms: [config.getString(ConfigKey.JwtSigningAlgorithm)],
    passReqToCallback: true,
  };

  passport.use(
    PASSPORT_JWT_STRATEGY,
    new JwtStrategy(options, (req: Request, jwtPayload: IJwtPayload, done: VerifiedCallback) => {
      if (jwtPayload.exp && Date.now() / 1000 > jwtPayload.exp) {
        return done("JWT Expired");
      }

      const userSession: IUserSession = {
        ...jwtPayload,
        claims: new Set(jwtPayload.claims),
      };

      req.user = userSession;
      return done(null, userSession);
    })
  );
};
