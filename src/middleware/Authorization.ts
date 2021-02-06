import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { response } from "../models/responses/IResponseData";
import { IUserEntityModel } from "../models/responses/IUserEntityModel";
import { IJwtPayload } from "./Passport";
import { isError, isString } from "../infastructure/TypeCheck";

const JWT_STRATEGY = "jwt";
const GENERIC_AUTH_ERROR = "Not Authorized";

const getClaimMissingError = (claim: string[]): string => {
  return `User requires claims to perform this operation: ${claim}`;
};

export enum AuthorizationClaim {
  UserSettings = "UserSettings",
  UserManage = "UserManage",
  ClaimManage = "ClaimManage",
}

export const authorizeUserOwned = (req: Request, res: Response, next: NextFunction): void => {
  const jwt = req.user as IJwtPayload;
  const model = req.body as IUserEntityModel;

  if (model.userId !== jwt.sub) {
    const message = `The specified resource doesn't belong to the user: ${jwt.sub}`;
    res.status(401);
    res.send(response.failed(message));
    return;
  }

  return next();
};

export const authorizeJwtClaim = (claimNames?: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate(
      JWT_STRATEGY,
      { session: false },
      (error: unknown, payload: IJwtPayload, info: unknown) => {
        let errorMessage;
        if (isString(error)) {
          errorMessage = error;
        } else if (isError(info)) {
          errorMessage = info.message;
        } else if (!payload) {
          errorMessage = GENERIC_AUTH_ERROR;
        }

        if (errorMessage) {
          res.status(401);
          res.send(response.failed(errorMessage));
          return;
        }

        if (!claimNames) {
          return next();
        }

        let missingClaims = claimNames.slice();
        if (payload.claims) {
          missingClaims = missingClaims.filter(claimName => {
            const foundClaim = payload.claims.find(claim => claim === claimName);
            if (foundClaim) {
              return false;
            } else {
              return true;
            }
          });
        }

        if (missingClaims.length > 0) {
          const message = getClaimMissingError(missingClaims);
          res.status(401);
          res.send(response.failed(message));
          return;
        }

        return next();
      }
    )(req, res, next);
  };
};
