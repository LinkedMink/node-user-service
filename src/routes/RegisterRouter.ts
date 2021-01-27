import { Router } from "express";
import { ParamsDictionary, Request, Response } from "express-serve-static-core";

import {
  getEmailVerificationCode,
  getUserAndCheckVerified,
  sendEmailWithCode,
} from "../handlers/Verification";
import { config, ConfigKey } from "../infastructure/Config";
import { objectDescriptorBodyVerify } from "../infastructure/ObjectDescriptor";
import { userConverter } from "../models/converters/UserConverter";
import { IUser, User } from "../models/database/User";
import { getResponseObject, ResponseStatus } from "../models/IResponseData";
import { IUserModel } from "../models/IUserModel";
import {
  IRegisterRequest,
  registerRequestDescriptor,
} from "../models/requests/IRegisterRequest";

const DEFAULT_CLAIMS = config.getString(ConfigKey.UserDefaultClaims).split(",");

export const registerRouter = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     description: Register a new user
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IRegisterRequest'
 *     responses:
 *       200:
 *         description: The newly created user record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
registerRouter.post(
  "/",
  objectDescriptorBodyVerify(registerRequestDescriptor),
  async (req: Request<ParamsDictionary>, res: Response) => {
    const requestData = req.body as IRegisterRequest;

    const userData = requestData as IUserModel;
    (userData.isEmailVerified = false),
      (userData.isLocked = false),
      (userData.claims = []);
    DEFAULT_CLAIMS.forEach(rawClaim => {
      const claim = rawClaim.trim();
      if (claim.length > 0) {
        userData.claims.push(claim);
      }
    });

    const user: IUser = userConverter.convertToBackend(
      userData,
      undefined,
      `Register(${userData.email})`
    );
    user.temporaryKey = getEmailVerificationCode();
    const saveModel = new User(user);

    await saveModel.save(error => {
      if (error) {
        let message = error.message;
        if (error.errors) {
          message = error.errors;
        }

        res.status(400);
        return res.send(getResponseObject(ResponseStatus.Failed, message));
      }

      const newRecord = userConverter.convertToFrontend(saveModel);
      sendEmailWithCode(
        res,
        newRecord.email,
        user.temporaryKey as string,
        newRecord
      );
    });
  }
);

/**
 * @swagger
 * /register/{email}/{code}:
 *   get:
 *     description: Verify the email address of the specified user
 *     tags: [Register]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
registerRouter.get(
  "/:email/:code",
  async (req: Request<ParamsDictionary>, res: Response) => {
    const email = req.params.email;
    const code = req.params.code;
    const user = await getUserAndCheckVerified(res, email);
    if (!user) {
      return res;
    }

    if (!user.temporaryKey || user.temporaryKey !== code) {
      res.status(500);
      return res.send(
        getResponseObject(
          ResponseStatus.Failed,
          "The verification code is invalid"
        )
      );
    }

    user.isEmailVerified = true;
    user.temporaryKey = undefined;
    user.temporaryKeyDate = undefined;

    await user.save(error => {
      if (error) {
        res.status(500);
        return res.send(
          getResponseObject(ResponseStatus.Failed, "An error occurred")
        );
      }

      return res.send(getResponseObject());
    });
  }
);

/**
 * @swagger
 * /register/{email}:
 *   get:
 *     description: Send the verification email again
 *     tags: [Register]
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
 *       500:
 *         $ref: '#/components/responses/500Internal'
 */
registerRouter.get(
  "/:email",
  async (req: Request<ParamsDictionary>, res: Response) => {
    const email = req.params.email;
    const user = await getUserAndCheckVerified(res, email);
    if (!user) {
      return res;
    }

    if (!user.temporaryKey) {
      user.temporaryKey = getEmailVerificationCode();
      await user.save(error => {
        if (error) {
          res.status(500);
          return res.send(
            getResponseObject(ResponseStatus.Failed, "An error occurred")
          );
        }

        sendEmailWithCode(res, email, user.temporaryKey as string);
      });
    } else {
      sendEmailWithCode(res, email, user.temporaryKey);
    }
  }
);
