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
import { IEmailPasswordIdentityModel, IIdentityModel, IUserModel } from "../models/responses/IUserModel";
import { IRegisterRequest } from "../models/requests/IRegisterRequest";
import { isMongooseValidationError } from "../infastructure/TypeCheck";
import { IdentityType, IEmailPasswordIdentity } from "../models/database/Identity";

const DEFAULT_CLAIMS = config.getString(ConfigKey.UserDefaultClaims).split(",");

export const registerRouter = Router();

function registerRequestToUser(request: IRegisterRequest) {
  return {
    username: request.email,
    isLocked: false,
    identities: [
      {
        type: IdentityType.EmailPassword,
        email: request.email,
        password: request.password,
        isEmailVerified: false,
      } as IEmailPasswordIdentityModel
    ] as IIdentityModel[],
    claims: []
  } as IUserModel
}

registerRouter.post("/", [
  async (req: Request, res: Response) => {
    const requestData = req.body as IRegisterRequest;

    const userData = registerRequestToUser(requestData);
    DEFAULT_CLAIMS.forEach(rawClaim => {
      const claim = rawClaim.trim();
      if (claim.length > 0) {
        userData.claims.push(claim);
      }
    });

    const user: IUser = userMapper.convertToBackend(
      userData,
      undefined,
      `Register(${userData.username})`
    );
    const identity = user.identities.find(
      i => i.type === IdentityType.EmailPassword
    ) as IEmailPasswordIdentity;
    identity.temporaryKey = getEmailVerificationCode();
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
          newRecord.username,
          identity.temporaryKey as string,
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

    const identity = user.identities.find(
      i => i.type === IdentityType.EmailPassword
    ) as IEmailPasswordIdentity;
    if (!identity.temporaryKey || identity.temporaryKey !== code) {
      res.status(400);
      return res.send(response.failed());
    }

    identity.isEmailVerified = true;
    identity.temporaryKey = undefined;
    identity.temporaryKeyDate = undefined;

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

    const identity = user.identities.find(
      i => i.type === IdentityType.EmailPassword
    ) as IEmailPasswordIdentity;
    if (!identity.temporaryKey) {
      identity.temporaryKey = getEmailVerificationCode();

      await new Promise((resolve, reject) => {
        user.save(error => {
          if (error) {
            res.status(500);
            res.send(response.failed("An error occurred"));
            return resolve(undefined);
          }

          void sendEmailWithCode(res, email, identity.temporaryKey as string).then(() =>
            resolve(undefined)
          );
        });
      });
    }
  },
]);
