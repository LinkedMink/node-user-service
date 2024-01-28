import { NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";
import { createMessageObj } from "../functions/Response.mjs";
import { isError, isString } from "../infrastructure/TypeCheck.mjs";
import { UserEntityViewModel } from "../models/responses/UserEntityViewModel.mjs";
import { PASSPORT_JWT_STRATEGY, UserSession } from "./passport/PassportJwt.mjs";

const GENERIC_AUTH_ERROR = "Not Authorized";

const getClaimMissingError = (claim: string[] | string): string => {
  const description = Array.isArray(claim) ? claim.join(", ") : claim;
  return `User requires claims to perform this operation: ${description}`;
};

export enum AuthorizationClaim {
  UserSettings = "UserSettings",
  UserManage = "UserManage",
  ClaimManage = "ClaimManage",
}

export const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authenticateHandler = passport.authenticate(
    PASSPORT_JWT_STRATEGY,
    { session: false },
    (error: unknown, payload: UserSession, info: unknown) => {
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
        res.send(createMessageObj(errorMessage));
        return;
      }

      return next();
    }
  ) as RequestHandler;

  authenticateHandler(req, res, next);
};

export const authorizeUserOwned = (req: Request, res: Response, next: NextFunction): void => {
  const jwt = req.user as UserSession;
  const model = req.body as UserEntityViewModel;

  if (model.userId !== jwt.sub) {
    const message = `The specified resource doesn't belong to the user: ${jwt.sub}`;
    res.status(403);
    res.send(createMessageObj(message));
    return;
  }

  return next();
};

export const authorizeJwtClaim = (requiredClaims: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const hasClaims = (req.user as UserSession)?.claims;
    if (!hasClaims) {
      res.status(403);
      res.send(createMessageObj(GENERIC_AUTH_ERROR));
    }

    const missingClaims = requiredClaims.filter(c => !hasClaims.has(c));
    if (missingClaims.length > 0) {
      res.status(403);
      res.send(createMessageObj(getClaimMissingError(missingClaims)));
    }

    return next();
  };
};

export type RequestResourceFunc = (req: Request) => string;

/**
 * @param resourceClaimMap Resource Name -> Required Claims
 */
export const authorizeJwtClaimByResource = (
  resourceClaimMap: Map<string, string>,
  resourceFunc: RequestResourceFunc
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const hasClaims = (req.user as UserSession)?.claims;
    if (!hasClaims) {
      res.status(403);
      res.send(createMessageObj(GENERIC_AUTH_ERROR));
    }

    const resourceName = resourceFunc(req);
    const requiredClaim = resourceClaimMap.get(resourceName);
    if (!requiredClaim) {
      return next();
    }

    if (!hasClaims.has(requiredClaim)) {
      res.status(403);
      res.send(createMessageObj(getClaimMissingError(requiredClaim)));
    }

    return next();
  };
};
