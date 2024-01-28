import { Request } from "express";
import { Algorithm } from "jsonwebtoken";
import { PassportStatic } from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest as JwtStrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { config } from "../../infrastructure/Config.mjs";
import { ConfigKey } from "../../infrastructure/ConfigKey.mjs";
import { JwtPayload } from "../../models/responses/JwtPayload.mjs";

export const PASSPORT_JWT_STRATEGY = "jwt";

export interface UserSession extends Omit<JwtPayload, "claims"> {
  claims: Set<string>;
  record?: Record<string, unknown>;
}

export const addJwtStrategy = (passport: PassportStatic): void => {
  const options: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
    audience: config.getString(ConfigKey.JwtAudience),
    issuer: config.getString(ConfigKey.JwtIssuer),
    algorithms: [config.getString(ConfigKey.JwtSigningAlgorithm) as Algorithm],
    passReqToCallback: true,
  };

  passport.use(
    PASSPORT_JWT_STRATEGY,
    new JwtStrategy(options, (req: Request, jwtPayload: JwtPayload, done: VerifiedCallback) => {
      if (jwtPayload.exp && Date.now() / 1000 > jwtPayload.exp) {
        return done("JWT Expired");
      }

      const userSession: UserSession = {
        ...jwtPayload,
        claims: new Set(jwtPayload.claims),
      };

      req.user = userSession;
      return done(null, jwtPayload);
    })
  );
};
