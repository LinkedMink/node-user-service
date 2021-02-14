import { Types } from "@linkedmink/passport-mutual-key-challenge";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Algorithm, sign } from "jsonwebtoken";
import { Types as DbTypes } from "mongoose";
import passport from "passport";

import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { PASSPORT_LOCAL_STRATEGY } from "../middleware/PassportLocal";
import { PASSPORT_MUTUAL_STRATEGY } from "../middleware/PassportMutual";
import {
  IdentityType,
  IEmailPasswordIdentity,
  IIdentity,
  IPublicKeyIdentity,
} from "../models/database/Identity";
import { IUser } from "../models/database/User";
import { IBearerToken } from "../models/responses/IBearerToken";
import { response } from "../models/responses/IResponseData";

export class AuthController {
  handleEmailPass = (req: Request, res: Response, next: NextFunction): void => {
    const authHandler = passport.authenticate(
      PASSPORT_LOCAL_STRATEGY,
      { session: false },
      (authError?: string, user?: IUser) => {
        if (authError) {
          return res.status(400).send(response.failed(authError));
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

  handleKeyChallenge = (req: Request, res: Response, next: NextFunction): void => {
    const authHandler = passport.authenticate(
      PASSPORT_MUTUAL_STRATEGY,
      { session: false },
      (
        authError?: Types.ChallengeError,
        user?: IUser,
        challenge?: Types.ServerChallenge,
        status?: number
      ) => {
        if (challenge && status) {
          res.setHeader("WWW-Authenticate", `Mutual realm=${this.realm}`);
          const jsonBase64Encoded = {
            clientRequested: {
              message: challenge.clientRequested.message.toString("base64"),
              signature: challenge.clientRequested.signature.toString("base64"),
            },
            serverRequested: {
              message: challenge.serverRequested.message.toString("base64"),
              signature: challenge.serverRequested.signature.toString("base64"),
            },
          };
          return res.status(status).send(jsonBase64Encoded);
        }

        if (authError) {
          res.setHeader("WWW-Authenticate", `Mutual realm=${this.realm}`);
          return res.status(401).send(authError.message);
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

    return authHandler(req, res, next);
  };

  private get realm() {
    return config.getString(ConfigKey.JwtAudience);
  }

  private loginSendJwt(req: Request, res: Response, user: IUser) {
    const payload = {
      ...this.getIdentityFields(user.identities),
      claims: user.claims.map(c => c.name),
    };

    req.login(payload, { session: false }, error => {
      if (error) {
        res.status(400).send(response.failed(error));
      }

      const token = sign(
        payload,
        config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
        this.signOptions(user.id)
      );

      const data = response.success({ token } as IBearerToken);
      res.status(200).send(data);
    });
  }

  private signOptions(userId: string) {
    return {
      expiresIn: `${config.getString(ConfigKey.JwtExpirationDays)} days`,
      audience: config.getString(ConfigKey.JwtAudience),
      issuer: config.getString(ConfigKey.JwtIssuer),
      subject: userId,
      algorithm: config.getString(ConfigKey.JwtSigningAlgorithm) as Algorithm,
    };
  }

  private getIdentityFields(identities: DbTypes.DocumentArray<IIdentity>) {
    return identities.reduce((obj, next) => {
      if (next.type === IdentityType.EmailPassword) {
        obj.email = (next as IEmailPasswordIdentity).email;
      } else if (next.type === IdentityType.PublicKey) {
        obj.publicKey = (next as IPublicKeyIdentity).publicKey.toString("base64");
      }
      return obj;
    }, {} as Record<string, unknown>);
  }
}
