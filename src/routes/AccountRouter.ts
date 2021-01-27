import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import {
  getEmailVerificationCode,
  sendEmailWithCode,
} from "../handlers/Verification";
import { objectDescriptorBodyVerify } from "../infastructure/ObjectDescriptor";
import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { accountConverter } from "../models/converters/AccountConverter";
import { User } from "../models/database/User";
import { getResponseFailed, getResponseSuccess } from "../models/IResponseData";
import {
  accountRequestDescriptor,
  IAccountModel,
} from "../models/requests/IAccountModel";

export const accountRouter = Router();

/**
 * @swagger
 * /account:
 *   get:
 *     description: Get a user's profile
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The user record matching the input token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountModelResponse'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
accountRouter.get(
  "/",
  authorizeJwtClaim(),
  async (req: Request<ParamsDictionary>, res: Response) => {
    const userId = (req.user as IJwtPayload).sub;
    const entity = await User.findById(userId).exec();

    if (entity) {
      const model = accountConverter.convertToFrontend(entity);
      return res.send(getResponseSuccess(model));
    } else {
      res.status(500);
      return res.send(getResponseFailed("An error occurred"));
    }
  }
);

/**
 * @swagger
 * /account:
 *   put:
 *     description: Update a user's account
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IAccountModel'
 *     responses:
 *       200:
 *         description: The newly created user record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
accountRouter.put(
  "/",
  authorizeJwtClaim(),
  objectDescriptorBodyVerify(accountRequestDescriptor),
  async (req: Request<ParamsDictionary>, res: Response) => {
    const userId = (req.user as IJwtPayload).sub;
    const account = req.body as IAccountModel;

    const toUpdate = await User.findById(userId).exec();
    if (toUpdate === null) {
      res.status(500);
      return res.send(getResponseFailed("An error occurred"));
    }

    const user = accountConverter.convertToBackend(
      account,
      toUpdate,
      `User(${userId})`
    );
    if (account.email) {
      user.temporaryKey = getEmailVerificationCode();
    }

    return new Promise((resolve, reject) => {
      user.validate(error => {
        if (error) {
          res.status(400);
          res.send(getResponseFailed(error));
          resolve();
        }

        User.findByIdAndUpdate(userId, user, null, (updateError: unknown) => {
          if (!updateError) {
            const newRecord = accountConverter.convertToFrontend(user);

            if (account.email) {
              sendEmailWithCode(
                res,
                user.email,
                user.temporaryKey as string,
                newRecord
              ).then(resolve);
            } else {
              res.send(getResponseSuccess(newRecord));
              resolve();
            }
          } else {
            res.status(500);
            res.send(getResponseFailed((updateError as Error).message));
            resolve();
          }
        }).exec();
      });
    });
  }
);

/**
 * @swagger
 * /account:
 *   delete:
 *     description: Delete a user's account
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
accountRouter.delete(
  "/",
  authorizeJwtClaim(),
  async (req: Request<ParamsDictionary>, res: Response) => {
    const userId = (req.user as IJwtPayload).sub;
    const deleted = await User.findByIdAndDelete(userId).exec();

    if (deleted) {
      return res.send(getResponseSuccess());
    } else {
      res.status(500);
      return res.send(getResponseFailed("An error occurred"));
    }
  }
);
