import { NextFunction, Router, Request, Response, RequestHandler } from "express";
import { sign, SignOptions } from "jsonwebtoken";
import passport from "passport";

import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { IUser } from "../models/database/User";
import { response } from "../models/responses/IResponseData";
import { IBearerToken } from "../models/responses/IBearerToken";
import { PASSPORT_LOCAL_STRATEGY } from "../middleware/Passport";

export const authenticateRouter = Router();

/**
 * @swagger
 * /authenticate:
 *   post:
 *     description: Authenticate the user credentials and retrieve a token for subsequent request
 *     tags: [Authenticate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IAuthenticateRequest'
 *     responses:
 *       200:
 *         description: The authentication token for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BearerTokenResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
authenticateRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const authHandler = passport.authenticate(
    PASSPORT_LOCAL_STRATEGY,
    { session: false },
    (authError, user: IUser) => {
      if (authError || !user) {
        return res.status(400).send(response.failed(authError));
      }

      /** This is what ends up in our JWT */
      const payload = {
        email: user.email,
        claims: user.claims.map(c => c.name),
      };

      /** assigns payload to req.user */
      req.login(payload, { session: false }, error => {
        if (error) {
          res.status(400).send(response.failed(error));
        }

        const signOptions: SignOptions = {
          expiresIn: `${config.getString(ConfigKey.JwtExpirationDays)} days`,
          audience: config.getString(ConfigKey.JwtAudience),
          issuer: config.getString(ConfigKey.JwtIssuer),
          subject: user.id,
          algorithm: config.getString(ConfigKey.JwtSigningAlgorithm),
        };

        /** generate a signed json web token and return it in the response */
        const token = sign(payload, config.getFileBuffer(ConfigKey.JwtSecretKeyFile), signOptions);

        const data = response.success({ token } as IBearerToken);
        res.status(200).send(data);
      });
    }
  ) as RequestHandler;

  authHandler(req, res, next);
});
