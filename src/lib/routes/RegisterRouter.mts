import { Request, Response, Router } from "express";
import { getEmailVerificationCode, sendEmailWithCode } from "../controllers/Verification.mjs";
import { createMessageObj } from "../functions/Response.mjs";
import { config } from "../infrastructure/Config.mjs";
import { ConfigKey } from "../infrastructure/ConfigKey.mjs";
import { isMongooseValidationError } from "../infrastructure/TypeCheck.mjs";
import { EmailPasswordIdentity, IdentityType } from "../models/database/Identity.mjs";
import { User, UserModel } from "../models/database/User.mjs";
import { userMapper } from "../models/mappers/UserMapper.mjs";
import { IRegisterRequest } from "../models/requests/IRegisterRequest.mjs";
import {
  EmailPasswordIdentityViewModel,
  IdentityViewModel,
  UserViewModel,
} from "../models/responses/UserViewModel.mjs";

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
      } as EmailPasswordIdentityViewModel,
    ] as IdentityViewModel[],
    claims: [],
  } as unknown as UserViewModel;
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

    const user: User = userMapper.convertToBackend(
      userData,
      undefined,
      `Register(${userData.username})`
    );
    const identity = user.identities.find(
      i => i.type === IdentityType.EmailPassword
    ) as EmailPasswordIdentity;
    identity.temporaryKey = getEmailVerificationCode();
    const saveModel = new UserModel(user);

    try {
      const userDoc = await saveModel.save();
      const user = userMapper.convertToFrontend(userDoc);
      await sendEmailWithCode(res, user.username, identity.temporaryKey, user);
    } catch (error) {
      if (isMongooseValidationError(error)) {
        res.status(400);
        res.send(error.errors);
        return;
      }

      res.status(500);
      res.send(createMessageObj("An error occurred"));
    }
  },
]);

registerRouter.get("/:email/:code", [
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const code = req.params.code;

    const user = await UserModel.findOne({ username: email }).exec();
    if (!user) {
      res.status(400);
      res.send(createMessageObj("Invalid request"));
      return;
    }

    const identity = user.identities.find(i => i.type === IdentityType.EmailPassword) as
      | EmailPasswordIdentity
      | undefined;
    if (identity?.isEmailVerified) {
      res.status(400);
      res.send(createMessageObj("Email already verified"));
      return;
    }

    if (identity?.temporaryKey !== code) {
      res.status(400);
      res.send(createMessageObj("Invalid request"));
      return;
    }

    identity.isEmailVerified = true;
    identity.temporaryKey = undefined;
    identity.temporaryKeyDate = undefined;

    try {
      await user.save();
      res.send(createMessageObj("Successfully verified email"));
    } catch (error) {
      res.status(500);
      res.send(createMessageObj("An error occurred"));
    }
  },
]);

registerRouter.get("/:email", [
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const user = await UserModel.findOne({ username: email }).exec();
    if (!user) {
      res.status(400);
      res.send(createMessageObj("Invalid request"));
      return;
    }

    const identity = user.identities.find(i => i.type === IdentityType.EmailPassword) as
      | EmailPasswordIdentity
      | undefined;
    if (!identity) {
      res.status(400);
      res.send(createMessageObj("Invalid request"));
      return;
    }

    if (identity.isEmailVerified) {
      res.status(400);
      res.send(createMessageObj("Email already verified"));
      return;
    }

    // TODO there should be a mechanism to limit code resets
    identity.temporaryKey = getEmailVerificationCode();

    try {
      await user.save();
      await sendEmailWithCode(res, email, identity.temporaryKey);
    } catch (error) {
      res.status(500);
      res.send(createMessageObj("An error occurred"));
    }
  },
]);
