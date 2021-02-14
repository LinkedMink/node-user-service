import { Request } from "express";
import { PassportStatic } from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions as JwtStrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { IJwtPayload } from "../models/responses/IJwtPayload";

export const PASSPORT_JWT_STRATEGY = "jwt";

export interface IUserSession extends Omit<IJwtPayload, "claims"> {
  claims: Set<string>;
  record?: Record<string, unknown>;
}

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
      return done(null, jwtPayload);
    })
  );
};
