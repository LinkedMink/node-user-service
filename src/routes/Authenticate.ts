import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { sign, SignOptions } from "jsonwebtoken";
import passport from "passport";

import { config, ConfigKey } from "../infastructure/Config";
import { IUser } from "../models/database/User";
import { getResponseObject, ResponseStatus } from "../models/Response";

export const authenticateRouter = Router();

/**
 * @swagger
 * definitions:
 *   SuccessResponse:
 *     type: object
 *     properties:
 *       status: { type: string }
 *       data:
 *         type: string
 *         description: The authentication token as a string
 *
 * /authenticate:
 *   post:
 *     description: Authenticate the user credentials and retrieve a token for subsequent request
 *     tags: [Authenticate]
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/IAuthenticateRequest'
 *     responses:
 *       200:
 *         description: The authentication token for the specified user
 *         schema:
 *           $ref: '#/definitions/SuccessResponse'
 *       400:
 *         description: The supplied parameters failed to authenticate
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
authenticateRouter.post("/", (req: Request<ParamsDictionary, any, any>, res: Response) => {
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
        expiresIn: `${config.getString(ConfigKey.JwtExpirationDays)} days`,
        audience: config.getString(ConfigKey.JwtAudience),
        issuer: config.getString(ConfigKey.JwtIssuer),
        subject: user.id,
        algorithm: config.getString(ConfigKey.JwtSigningAlgorithm),
      };

      /** generate a signed json web token and return it in the response */
      const token = sign(
        payload,
        config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
        signOptions);

      const response = getResponseObject();
      response.data = {
        token,
      };

      res.status(200).send(response);
    });
  })(req, res);
});
