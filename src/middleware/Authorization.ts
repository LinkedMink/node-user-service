import { NextFunction, ParamsDictionary, Request, Response } from "express-serve-static-core";
import passport from "passport";
import { getResponseObject, ResponseStatus } from "../models/Response";
import { IJwtPayload } from "./Passport";

const GENERIC_AUTH_ERROR = "Not Authorized";

const getClaimMissingError = (claim: string[]) => {
  return `User requires claims to perform this operation: ${claim}`;
};

export enum AuthorizationClaim {
  UserManage = "UserManage",
  ClaimManage = "ClaimManage",
}

export const authorizeJwtClaim = (claimNames?: string[]) => {
  return (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {

    passport.authenticate("jwt", { session: false }, (error: any, payload: IJwtPayload, info: any) => {
      let errorMessage;
      if (error) {
        errorMessage = error;
      } else if (info && info.message) {
        errorMessage = info.message;
      } else if (!payload) {
        errorMessage = GENERIC_AUTH_ERROR;
      }

      if (errorMessage)  {
        res.status(401);
        return res.send(getResponseObject(ResponseStatus.Failed, errorMessage));
      }

      if (!claimNames) {
        return next();
      }

      let missingClaims = claimNames.slice();
      if (payload.claims) {
        missingClaims = missingClaims.filter((claimName) => {
          const foundClaim = payload.claims.find((claim: any) => claim === claimName);
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
        return res.send(getResponseObject(ResponseStatus.Failed, message));
      }

      return next();
    })(req, res, next);
  };
};
