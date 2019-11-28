import cryptoRandomString from "crypto-random-string";
import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { ConfigKey, getConfigValue } from "../infastructure/config";
import { sendPasswordReset } from "../infastructure/email";
import { objectDescriptorBodyVerify } from "../infastructure/objectDescriptor";
import { User } from "../models/database/user";
import { IPasswordResetRequest, passwordResetRequestDescriptor } from "../models/requests/passwordResetRequest";
import { getResponseObject, ResponseStatus } from "../models/response";

const tempKeyLength = 30;
const tempKeyValidMilliseonds = Number(getConfigValue(ConfigKey.UserTemporaryKeyMinutes)) * 60 * 1000;

export const passwordRouter = Router();

// TODO
/**
 * @swagger
 * /password:
 *   post:
 *     description: Send a request to retrieve a temporary reset link
 *     tags: [Password, Reset]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
passwordRouter.get("/:email", async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const email = req.params.email;
  const user = await User.findOne({ email }).exec();
  if (!user) {
    res.status(404);
    return res.send(getResponseObject(ResponseStatus.Failed));
  }

  if (!user.isEmailVerified) {
    res.status(400);
    return res.send(getResponseObject(ResponseStatus.Failed, "The email has not been verified."));
  }

  const resetCode = cryptoRandomString({length: tempKeyLength, type: "url-safe"});
  user.temporaryKey = resetCode;
  user.temporaryKeyDate = new Date();
  await user.save(async (error) => {
    if (error) {
      res.status(500);
      return res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
    }

    sendPasswordReset(user.email, resetCode)
      .then(() => res.send(getResponseObject()))
      .catch(() => {
        res.status(500);
        return res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
      });

    return res.send(getResponseObject());
  });
});

/**
 * @swagger
 * /password:
 *   put:
 *     description: Use the temporary reset key to change a user's password
 *     tags: [Password, Reset]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
passwordRouter.put("/:email", objectDescriptorBodyVerify(passwordResetRequestDescriptor),
  async (req: Request<ParamsDictionary, any, any>, res: Response) => {

  const email = req.params.email;
  const requestData = req.body as IPasswordResetRequest;

  const user = await User.findOne({ email }).exec();
  if (!user) {
    res.status(404);
    return res.send(getResponseObject(ResponseStatus.Failed));
  }

  if (!user.temporaryKey || !user.temporaryKeyDate) {
    res.status(400);
    return res.send(getResponseObject(ResponseStatus.Failed, "No reset token has been issued."));
  }

  if (Date.now() - user.temporaryKeyDate.getTime() > tempKeyValidMilliseonds) {
    res.status(400);
    res.send(getResponseObject(ResponseStatus.Failed, "The reset token is no longer valid."));
  }

  if (user.temporaryKey !== requestData.resetToken) {
    res.status(400);
    return res.send(getResponseObject(ResponseStatus.Failed, "The reset token is not valid."));
  }

  user.temporaryKey = undefined;
  user.temporaryKeyDate = undefined;
  user.password = requestData.password;

  await user.save((error) => {
    if (error) {
      let message = error.message;
      if (error.errors) {
        message = error.errors;
      }

      res.status(400);
      return res.send(getResponseObject(ResponseStatus.Failed, message));
    }

    return res.send(getResponseObject());
  });
});
