import { NextFunction, ParamsDictionary, Request, Response } from "express-serve-static-core";
import passport from "passport";

const getClaimMissingError = (claim: string[]) => {
  return `User requires claims to perform this operation: ${claim}`;
};

export const authorizeJwtClaim = (claimNames: string[]) => {
  return (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {

    passport.authenticate("jwt", { session: false }, (error: any, user: any, info: any) => {
      if (error) {
        res.status(401);
        res.send(error);
        return;
      }

      let missingClaims = claimNames.slice();
      if (user.claims) {
        missingClaims = claimNames.filter((claimName) => {
          const foundClaim = user.claims.find((claim: any) => claim.name === claimName);
          if (foundClaim) {
            return false;
          } else {
            return true;
          }
        });
      }

      if (missingClaims.length > 0) {
        res.status(401);
        res.send(getClaimMissingError(missingClaims));
      }
    })(req, res, next);
  };
};
