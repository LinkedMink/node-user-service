import { Router, Request, Response } from "express";

import {
  getEmailVerificationCode,
  getUserAndCheckVerified,
  sendEmailWithCode,
} from "../controllers/Verification";
import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { userMapper } from "../models/mappers/UserMapper";
import { IUser, User } from "../models/database/User";
import { response } from "../models/responses/IResponseData";
import { IUserModel } from "../models/responses/IUserModel";
import { IRegisterRequest } from "../models/requests/IRegisterRequest";
import { isMongooseValidationError } from "../infastructure/TypeCheck";

const DEFAULT_CLAIMS = config.getString(ConfigKey.UserDefaultClaims).split(",");

export const registerRouter = Router();

registerRouter.post("/", [
  async (req: Request, res: Response) => {
    const requestData = req.body as IRegisterRequest;

    const userData = requestData as IUserModel;
    (userData.isEmailVerified = false), (userData.isLocked = false), (userData.claims = []);
    DEFAULT_CLAIMS.forEach(rawClaim => {
      const claim = rawClaim.trim();
      if (claim.length > 0) {
        userData.claims.push(claim);
      }
    });

    const user: IUser = userMapper.convertToBackend(
      userData,
      undefined,
      `Register(${userData.email})`
    );
    user.temporaryKey = getEmailVerificationCode();
    const saveModel = new User(user);

    await new Promise((resolve, reject) => {
      saveModel.save(error => {
        if (isMongooseValidationError(error)) {
          res.status(400);
          res.send(response.failed(error.errors));
          return resolve(undefined);
        }

        const newRecord = userMapper.convertToFrontend(saveModel);
        void sendEmailWithCode(
          res,
          newRecord.email,
          user.temporaryKey as string,
          newRecord
        ).then(() => resolve(undefined));
      });
    });
  },
]);

registerRouter.get("/:email/:code", [
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const code = req.params.code;
    const user = await getUserAndCheckVerified(res, email);
    if (!user) {
      res.status(400);
      return res.send(response.failed());
    }

    if (!user.temporaryKey || user.temporaryKey !== code) {
      res.status(400);
      return res.send(response.failed());
    }

    user.isEmailVerified = true;
    user.temporaryKey = undefined;
    user.temporaryKeyDate = undefined;

    await new Promise((resolve, reject) => {
      user.save(error => {
        if (error) {
          res.status(500);
          res.send(response.failed("An error occurred"));
          return resolve(undefined);
        }

        res.send(response.success());
        return resolve(undefined);
      });
    });
  },
]);

registerRouter.get("/:email", [
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const user = await getUserAndCheckVerified(res, email);
    if (!user) {
      return res;
    }

    if (!user.temporaryKey) {
      user.temporaryKey = getEmailVerificationCode();

      await new Promise((resolve, reject) => {
        user.save(error => {
          if (error) {
            res.status(500);
            res.send(response.failed("An error occurred"));
            return resolve(undefined);
          }

          void sendEmailWithCode(res, email, user.temporaryKey as string).then(() =>
            resolve(undefined)
          );
        });
      });
    }
  },
]);
