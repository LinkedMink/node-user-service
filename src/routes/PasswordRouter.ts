import cryptoRandomString from "crypto-random-string";
import { Router, Request, Response } from "express";

import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { EmailSender } from "../infastructure/Email";
import { User } from "../models/database/User";
import { response } from "../models/responses/IResponseData";
import { IPasswordResetRequest } from "../models/requests/IPasswordResetRequest";
import { Logger } from "../infastructure/Logger";
import { basename } from "path";

export const getPasswordRouter = (): Router => {
  const logger = Logger.get(basename(__filename));

  const tempKeyLength = 30;
  const tempKeyValidMilliseonds = config.getNumber(ConfigKey.UserTemporaryKeyMinutes) * 60 * 1000;

  const passwordRouter = Router();

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
   */
  passwordRouter.get("/:email", [
    async (req: Request, res: Response) => {
      const email = req.params.email;
      const user = await User.findOne({ email }).exec();
      if (!user) {
        res.status(404);
        return res.send(response.failed());
      }

      if (!user.isEmailVerified) {
        res.status(400);
        return res.send(response.failed("The email has not been verified."));
      }

      const resetCode = cryptoRandomString({
        length: tempKeyLength,
        type: "url-safe",
      });
      user.temporaryKey = resetCode;
      user.temporaryKeyDate = new Date();

      await new Promise((resolve, reject) => {
        user.save(error => {
          if (error) {
            logger.error({ message: error });
            res.status(500);
            res.send(response.failed("An error occurred"));
            return resolve(undefined);
          }

          void EmailSender.get()
            .sendPasswordReset(user.email, resetCode)
            .then(isSuccess => {
              if (isSuccess) {
                res.send(response.success());
                return resolve(undefined);
              }

              res.status(500);
              res.send(response.failed("An error occurred"));
              resolve(undefined);
            });
        });
      });
    },
  ]);

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
  passwordRouter.put("/", [
    async (req: Request, res: Response) => {
      const requestData = req.body as IPasswordResetRequest;

      const user = await User.findOne({ email: requestData.email }).exec();
      if (!user) {
        res.status(404);
        return res.send(response.failed());
      }

      if (!user.temporaryKey || !user.temporaryKeyDate) {
        res.status(400);
        return res.send(response.failed("No reset token has been issued."));
      }

      if (Date.now() - user.temporaryKeyDate.getTime() > tempKeyValidMilliseonds) {
        res.status(400);
        res.send(response.failed("The reset token is no longer valid."));
      }

      if (user.temporaryKey !== requestData.resetToken) {
        res.status(400);
        return res.send(response.failed("The reset token is not valid."));
      }

      user.temporaryKey = undefined;
      user.temporaryKeyDate = undefined;
      user.password = requestData.password;

      await new Promise((resolve, reject) => {
        user.save(error => {
          if (error) {
            logger.error({ message: error });
            res.status(500);
            res.send(response.failed("An error occurred"));
            return resolve(undefined);
          }

          res.send(response.success());
          resolve(undefined);
        });
      });
    },
  ]);

  return passwordRouter;
};
