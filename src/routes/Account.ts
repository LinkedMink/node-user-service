import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { getEmailVerificationCode, sendEmailWithCode } from "../handlers/Verification";
import { objectDescriptorBodyVerify } from "../infastructure/ObjectDescriptor";
import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { accountConverter } from "../models/converters/AccountConverter";
import { User } from "../models/database/User";
import { getResponseFailed, getResponseSuccess } from "../models/IResponseData";
import { accountRequestDescriptor, IAccountModel } from "../models/requests/IAccountModel";

export const accountRouter = Router();

/**
 * @swagger
 * /account:
 *   get:
 *     description: Get a user's profile
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
accountRouter.get("/", authorizeJwtClaim(), async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const userId = (req.user as IJwtPayload).sub;
  const entity = await User.findById(userId).exec();

  if (entity) {
    const model = accountConverter.convertToFrontend(entity);
    return res.send(getResponseSuccess(model));
  } else {
    res.status(500);
    return res.send(getResponseFailed("An error occurred"));
  }
});

/**
 * @swagger
 * /account:
 *   put:
 *     description: Update a user's account
 *     tags: [Account]
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/IAccountModel'
 *     responses:
 *       200:
 *         description: The request was successful.
 */
accountRouter.put("/",
  authorizeJwtClaim(),
  objectDescriptorBodyVerify(accountRequestDescriptor),
  async (req: Request<ParamsDictionary, any, any>, res: Response) => {

  const userId = (req.user as IJwtPayload).sub;
  const account = req.body as IAccountModel;

  const toUpdate = await User.findById(userId).exec();
  if (toUpdate === null) {
    res.status(500);
    return res.send(getResponseFailed("An error occurred"));
  }

  const user = accountConverter.convertToBackend(account, toUpdate, `User(${userId})`);
  if (account.email) {
    user.temporaryKey = getEmailVerificationCode();
  }

  await user.validate(async (error) => {
    if (error) {
      res.status(400);
      return res.send(getResponseFailed(error));
    }

    await User.findByIdAndUpdate(userId, user, (updateError) => {
      if (!updateError) {
        const newRecord = accountConverter.convertToFrontend(user);

        if (account.email) {
          sendEmailWithCode(res, user.email, user.temporaryKey as string, newRecord);
        } else {
          return res.send(getResponseSuccess(newRecord));
        }
      } else {
        res.status(500);
        return res.send(getResponseFailed(updateError.message));
      }
    }).exec();
  });
});

/**
 * @swagger
 * /account:
 *   delete:
 *     description: Delete a user's account
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: The request was successful.
 */
accountRouter.delete("/", authorizeJwtClaim(),  async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const userId = (req.user as IJwtPayload).sub;
  const deleted = await User.findByIdAndDelete(userId).exec();

  if (deleted) {
    return res.send(getResponseSuccess());
  } else {
    res.status(500);
    return res.send(getResponseFailed("An error occurred"));
  }
});
