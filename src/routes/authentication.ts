import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { sign, SignOptions } from "jsonwebtoken";
import passport from "passport";

import { ConfigKey, getConfigValue, jwtSecretKey } from "../infastructure/config";
import { IUser } from "../models/database/user";
import { getResponseObject, ResponseStatus } from "../models/response";

export const authenticationRouter = Router();

/**
 * @swagger
 *
 * definitions:
 *   SuccessResponse:
 *     type: object
 *     properties:
 *       status: { type: string }
 *       data:
 *         type: string
 *         description: The authentication token as a string
 */

/**
 * @swagger
 * /authenticate:
 *   post:
 *     description: Authenticate the user credentials and retrieve a token for subsequent request
 *     tags: [Authenticate]
 *     parameters:
 *       - in: body
 *         name: email
 *         type: string
 *         required: true
 *       - in: body
 *         name: password
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The package name and version that's running this service
 *         schema:
 *           $ref: '#/definitions/SuccessResponse'
 *       400:
 *         description: The supplied parameters failed to authenticate
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
authenticationRouter.post("/", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  passport.authenticate("local", { session: false }, (authError, user: IUser) => {
    if (authError || !user) {
      res.status(400)
        .send(getResponseObject(ResponseStatus.Failed, authError));
    }

    const claims: string[] = [];
    user.claims.forEach((claim) => claims.push(claim.name));

    /** This is what ends up in our JWT */
    const payload = {
      email: user.email,
      claims,
    };

    /** assigns payload to req.user */
    req.login(payload, {session: false}, (error) => {
      if (error) {
        res.status(400)
          .send(getResponseObject(ResponseStatus.Failed, error));
      }

      const signOptions: SignOptions = {
        expiresIn: `${getConfigValue(ConfigKey.JwtExpirationDays)} days`,
        audience: getConfigValue(ConfigKey.JwtAudience),
        issuer: getConfigValue(ConfigKey.JwtIssuer),
        subject: user.id,
        algorithm: getConfigValue(ConfigKey.JwtSigningAlgorithm),
      };

      /** generate a signed json web token and return it in the response */
      const token = sign(
        payload,
        jwtSecretKey,
        signOptions);

      const response = getResponseObject();
      response.data = {
        token,
      };

      res.status(200).send(response);
    });
  })(req, res);
});
