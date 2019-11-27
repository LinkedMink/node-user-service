import bcrypt from "bcrypt";
import { Request } from "express-serve-static-core";
import { PassportStatic } from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions as JwtStrategyOptions, VerifiedCallback } from "passport-jwt";
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from "passport-local";

import { ConfigKey, getConfigValue, jwtSecretKey } from "../infastructure/config";
import { User } from "../models/database/user";

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
    secretOrKey: jwtSecretKey,
    audience: getConfigValue(ConfigKey.JwtAudience),
    issuer: getConfigValue(ConfigKey.JwtIssuer),
    algorithms: [getConfigValue(ConfigKey.JwtSigningAlgorithm)],
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
