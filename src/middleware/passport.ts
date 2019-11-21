import bcrypt from "bcrypt";
import { PassportStatic } from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions as JwtStrategyOptions } from "passport-jwt";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";

import { ConfigKey, getConfigValue } from "../infastructure/config";
import { User } from "../models/database/user";

export const addLocalStrategy = (passport: PassportStatic) => {
  const options: IStrategyOptionsWithRequest = {
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true,
  };

  passport.use(new LocalStrategy(options, async (request, email, password, done) => {
    try {
      const userDocument = await User.findOne({email}).exec();
      if (!userDocument) {
        return done("Incorrect Username / Password");
      }

      const passwordsMatch = await bcrypt.compare(password, userDocument.password);

      if (passwordsMatch) {
        return done(null, userDocument);
      } else {
        return done("Incorrect Username / Password");
      }
    } catch (error) {
      done(error);
    }
  }));
};

export const addJwtStrategy = (passport: PassportStatic) => {
  const options: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getConfigValue(ConfigKey.JwtSecretKey),
    audience: getConfigValue(ConfigKey.JwtAudience),
    issuer: getConfigValue(ConfigKey.JwtIssuer),
  };

  passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    if (jwtPayload.exp && Date.now() > jwtPayload.exp) {
      return done("jwt expired");
    }

    return done(null, jwtPayload);
  }));
};
