import cryptoRandomString from "crypto-random-string";
import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { config, ConfigKey } from "../infastructure/Config";
import { sendPasswordReset } from "../infastructure/Email";
import { objectDescriptorBodyVerify } from "../infastructure/ObjectDescriptor";
import { User } from "../models/database/User";
import { getResponseObject, ResponseStatus } from "../models/IResponseData";
import { IPasswordResetRequest, passwordResetRequestDescriptor } from "../models/requests/IPasswordResetRequest";

const tempKeyLength = 30;
const tempKeyValidMilliseonds = config.getNumber(ConfigKey.UserTemporaryKeyMinutes) * 60 * 1000;

export const passwordRouter = Router();

/**
 * @swagger
 * /password/{email}:
 *   get:
 *     description: Send a request to retrieve a temporary reset link
 *     tags: [Password]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
passwordRouter.get("/:email", async (req: Request<ParamsDictionary>, res: Response) => {
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
  await user.save((error) => {
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
  });
});

/**
 * @swagger
 * /password:
 *   put:
 *     description: Use the temporary reset key to change a user's password
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IPasswordResetRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
passwordRouter.put("/",
  objectDescriptorBodyVerify(passwordResetRequestDescriptor),
  async (req: Request<ParamsDictionary>, res: Response) => {
    const requestData = req.body as IPasswordResetRequest;

    const user = await User.findOne({ email: requestData.email }).exec();
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
