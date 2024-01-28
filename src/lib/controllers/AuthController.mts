import { NextFunction, Request, RequestHandler, Response } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import { Types as DbTypes } from "mongoose";
import passport from "passport";
import { createMessageObj } from "../functions/Response.mjs";
import { config } from "../infrastructure/Config.mjs";
import { ConfigKey } from "../infrastructure/ConfigKey.mjs";
import { PASSPORT_LOCAL_STRATEGY } from "../middleware/passport/PassportLocal.mjs";
import {
  AnyIdentity,
  EmailPasswordIdentity,
  IdentityType,
  PublicKeyIdentity,
} from "../models/database/Identity.mjs";
import { User } from "../models/database/User.mjs";
import { BearerToken } from "../models/responses/BearerToken.mjs";

export class AuthController {
  handleEmailPass = (req: Request, res: Response, next: NextFunction): void => {
    const authHandler = passport.authenticate(
      PASSPORT_LOCAL_STRATEGY,
      { session: false },
      (authError?: string, user?: User) => {
        if (authError) {
          return res.status(400).send(createMessageObj(authError));
        }

        if (!user) {
          return next(
            new Error(
              "passport.authenticate callback should have a user if auth error is undefined"
            )
          );
        }

        this.loginSendJwt(req, res, user);
      }
    ) as RequestHandler;

    authHandler(req, res, next);
  };

  private get realm() {
    return config.getString(ConfigKey.JwtAudience);
  }

  private loginSendJwt(req: Request, res: Response, user: User) {
    const payload = {
      ...this.getIdentityFields(user.identities),
      claims: user.claims.map(c => c.name),
    };

    req.login(payload, { session: false }, error => {
      if (error) {
        res.status(400).send(createMessageObj(error as string));
      }

      const token = jsonwebtoken.default.sign(
        payload,
        config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
        this.signOptions(user.id)
      );

      const data: BearerToken = { token };
      res.status(200).send(data);
    });
  }

  private signOptions(userId: string) {
    return {
      expiresIn: `${config.getString(ConfigKey.JwtExpirationDays)} days`,
      audience: config.getString(ConfigKey.JwtAudience),
      issuer: config.getString(ConfigKey.JwtIssuer),
      subject: userId,
      algorithm: config.getString(ConfigKey.JwtSigningAlgorithm) as jsonwebtoken.Algorithm,
    };
  }

  private getIdentityFields(identities: DbTypes.DocumentArray<AnyIdentity>) {
    return identities.reduce(
      (obj, next) => {
        if (next.type === IdentityType.EmailPassword) {
          obj.email = (next as EmailPasswordIdentity).email;
        } else if (next.type === IdentityType.PublicKey) {
          obj.publicKey = (next as PublicKeyIdentity).publicKey.toString("base64");
        }
        return obj;
      },
      {} as Record<string, unknown>
    );
  }
}
