import { Request, Response, Router } from "express";
import { getEmailVerificationCode, sendEmailWithCode } from "../controllers/Verification.mjs";
import { isMongooseValidationError } from "../infrastructure/TypeCheck.mjs";
import { authenticateJwt } from "../middleware/Authorization.mjs";
import { UserSession } from "../middleware/passport/PassportJwt.mjs";
import { EmailPasswordIdentity, IdentityType } from "../models/database/Identity.mjs";
import { UserModel } from "../models/database/User.mjs";
import { accountMapper } from "../models/mappers/AccountMapper.mjs";
import { IAccountModel } from "../models/requests/IAccountModel.mjs";

export const accountRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
accountRouter.get("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as UserSession).sub;
  const entity = await UserModel.findById(userId).exec();

  if (entity) {
    const model = accountMapper.convertToFrontend(entity);
    return res.send(model);
  } else {
    res.status(404);
    return res.send();
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
accountRouter.put("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as UserSession).sub;
  const account = req.body as IAccountModel;

  const toUpdate = await UserModel.findById(userId).exec();
  if (toUpdate === null) {
    res.status(500);
    return res.send();
  }

  const user = accountMapper.convertToBackend(account, toUpdate, `User(${userId})`);
  const identity = user.identities.find(
    i => i.type === IdentityType.EmailPassword
  ) as EmailPasswordIdentity;
  if (account.email) {
    identity.temporaryKey = getEmailVerificationCode();
  }

  try {
    const newUser = await user.save();
    await sendEmailWithCode(res, identity.email, identity.temporaryKey as string, newUser);
    res.send(accountMapper.convertToFrontend(newUser));
  } catch (error) {
    if (isMongooseValidationError(error)) {
      res.status(400);
      res.send(error.errors);
      return;
    }

    res.status(500);
    res.send();
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
accountRouter.delete("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as UserSession).sub;
  const deleted = await UserModel.findByIdAndDelete(userId).exec();

  if (deleted) {
    return res.send();
  } else {
    res.status(500);
    return res.send();
  }
});
