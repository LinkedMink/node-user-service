import express from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";
import { sign, SignOptions } from "jsonwebtoken";
import passport from "passport";

import { ConfigKey, getConfigValue } from "../infastructure/config";
import { getResponseObject, ResponseStatus } from "../infastructure/response";

export const authenticationRouter = express.Router();

authenticationRouter.post("/", (req: Request<ParamsDictionary, any, any>, res: Response) => {
  passport.authenticate("local", { session: false }, (authError, user) => {
    if (authError || !user) {
      res.status(400)
        .send(getResponseObject(ResponseStatus.Failed, authError));
    }

    /** This is what ends up in our JWT */
    const payload = {
      email: user.email,
    };

    /** assigns payload to req.user */
    req.login(payload, {session: false}, (error) => {
      if (error) {
        res.status(400)
          .send(getResponseObject(ResponseStatus.Failed, error));
      }

      const signOptions: SignOptions = {
        expiresIn: getConfigValue(ConfigKey.JwtExpirationSecords),
        audience: getConfigValue(ConfigKey.JwtAudience),
        issuer: getConfigValue(ConfigKey.JwtIssuer),
        subject: user.id,
      };

      /** generate a signed json web token and return it in the response */
      const token = sign(
        JSON.stringify(payload),
        getConfigValue(ConfigKey.JwtSecretKey),
        signOptions);

      const response = getResponseObject();
      response.data = {
        token,
      };

      res.status(200).send(response);
    });
  })(req, res);
});
