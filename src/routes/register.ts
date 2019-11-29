import cryptoRandomString from "crypto-random-string";
import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import { ConfigKey, getConfigValue } from "../infastructure/config";
import { sendVerifyEmail } from "../infastructure/email";
import { objectDescriptorBodyVerify } from "../infastructure/objectDescriptor";
import { UserConverter } from "../models/converters/userConverter";
import { IUser, User } from "../models/database/user";
import { IRegisterRequest, registerRequestDescriptor } from "../models/requests/registerRequest";
import { getResponseObject, ResponseStatus } from "../models/response";
import { IUserModel } from "../models/userModel";

const tempKeyLength = 30;

const getUserAndCheckVerified = async (res: Response, email: string): Promise<IUser | null> => {
  const user = await User.findOne({ email }).exec();
  if (!user) {
    res.status(404);
    res.send(getResponseObject(ResponseStatus.Failed));
    return null;
  }

  if (user.isEmailVerified) {
    res.status(400);
    res.send(getResponseObject(ResponseStatus.Failed, "Email already verified"));
    return null;
  }

  return user;
};

const sendEmailWithCode = (res: Response, email: string, code: string, data: IUserModel | null = null) => {
  sendVerifyEmail(email, code)
    .then(() => res.send(getResponseObject(ResponseStatus.Success, data)))
    .catch(() => {
      res.status(500);
      return res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
    });
};

const userConverter = new UserConverter();

export const registerRouter = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     description: Register a new user
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The user was registered successfully.
 */
registerRouter.post("/",
  objectDescriptorBodyVerify(registerRequestDescriptor),
  async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const requestData = req.body as IRegisterRequest;

    const userData =  requestData as IUserModel;
    userData.isEmailVerified = false,
    userData.isLocked = false,
    userData.claims = [];
    const rawClaims = getConfigValue(ConfigKey.UserDefaultClaims).split(",");
    rawClaims.forEach((rawClaim) => {
      const claim = rawClaim.trim();
      if (claim.length > 0) {
        userData.claims.push(claim);
      }
    });

    const user: IUser = userConverter.convertToBackend(userData, undefined, `Register(${userData.email})`);
    const resetCode = cryptoRandomString({length: tempKeyLength, type: "url-safe"});
    user.temporaryKey = resetCode;
    const saveModel = new User(user);

    await saveModel.save((error) => {
      if (error) {
        let message = error.message;
        if (error.errors) {
          message = error.errors;
        }

        res.status(400);
        return res.send(getResponseObject(ResponseStatus.Failed, message));
      }

      const newRecord = userConverter.convertToFrontend(saveModel);
      sendEmailWithCode(res, newRecord.email, resetCode, newRecord);
    });
  });

/**
 * @swagger
 * /register:
 *   get:
 *     description: Verify the email address of the specified user
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The user was verified successfully.
 */
registerRouter.get("/:email/:code", async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const email = req.params.email;
  const code = req.params.code;
  const user = await getUserAndCheckVerified(res, email);
  if (!user) { return res; }

  if (!user.temporaryKey || user.temporaryKey !== code) {
    res.status(500);
    return res.send(getResponseObject(ResponseStatus.Failed, "The verification code is invalid"));
  }

  user.isEmailVerified = true;
  user.temporaryKey = undefined;
  user.temporaryKeyDate = undefined;

  await user.save(async (error) => {
    if (error) {
      res.status(500);
      return res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
    }

    return res.send(getResponseObject());
  });
});

/**
 * @swagger
 * /register:
 *   get:
 *     description: Send the verification email again
 *     tags: [Register]
 *     responses:
 *       200:
 *         description: The email was sent successfully.
 */
registerRouter.get("/:email", async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const email = req.params.email;
  const user = await getUserAndCheckVerified(res, email);
  if (!user) { return res; }

  if (!user.temporaryKey) {
    const resetCode = cryptoRandomString({length: tempKeyLength, type: "url-safe"});
    user.temporaryKey = resetCode;
    await user.save(async (error) => {
      if (error) {
        res.status(500);
        return res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
      }

      sendEmailWithCode(res, email, resetCode);
    });
  } else {
    sendEmailWithCode(res, email, user.temporaryKey);
  }
});