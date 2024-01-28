import { Request, Response, Router } from "express";
import { randomBytes } from "node:crypto";
import { createMessageObj } from "../functions/Response.mjs";
import { config } from "../infrastructure/Config.mjs";
import { ConfigKey } from "../infrastructure/ConfigKey.mjs";
import { EmailSender } from "../infrastructure/Email.mjs";
import { Logger } from "../infrastructure/Logger.mjs";
import { EmailPasswordIdentity, IdentityType } from "../models/database/Identity.mjs";
import { UserModel } from "../models/database/User.mjs";
import { IPasswordResetRequest } from "../models/requests/IPasswordResetRequest.mjs";

const TEMP_KEY_BYTES = 16;

export const getPasswordRouter = (): Router => {
  const logger = Logger.fromModuleUrl(import.meta.url);

  const tempKeyValidMilliseonds = config.getNumber(ConfigKey.UserTemporaryKeyMinutes) * 60 * 1000;

  const passwordRouter = Router();

  passwordRouter.get("/:email", [
    async (req: Request, res: Response) => {
      const email = req.params.email;
      const user = await UserModel.findOne({ email }).exec();
      if (!user) {
        res.status(200);
        return res.send();
      }

      const resetCode = randomBytes(TEMP_KEY_BYTES).toString("hex");

      const identity = user.identities.find(
        i => i.type === IdentityType.EmailPassword
      ) as EmailPasswordIdentity;
      identity.temporaryKey = resetCode;
      identity.temporaryKeyDate = new Date();
      try {
        await user.save();
        const isSuccess = await EmailSender.get().sendPasswordReset(identity.email, resetCode);

        if (isSuccess) {
          res.send();
          return;
        }

        res.status(500);
        res.send(createMessageObj("An error occurred"));
      } catch (error) {
        logger.error({ message: error });
        res.status(500);
        res.send(createMessageObj("An error occurred"));
      }
    },
  ]);

  passwordRouter.put("/", [
    async (req: Request, res: Response) => {
      const requestData = req.body as IPasswordResetRequest;

      const user = await UserModel.findOne({ email: requestData.email }).exec();
      if (!user) {
        res.status(400);
        return res.send(createMessageObj("Invalid request"));
      }

      const identity = user.identities.find(
        i => i.type === IdentityType.EmailPassword
      ) as EmailPasswordIdentity;
      if (!identity.temporaryKey || !identity.temporaryKeyDate) {
        res.status(400);
        return res.send(createMessageObj("Invalid request"));
      }

      if (Date.now() - identity.temporaryKeyDate.getTime() > tempKeyValidMilliseonds) {
        res.status(400);
        res.send(createMessageObj("The reset token is no longer valid."));
      }

      if (identity.temporaryKey !== requestData.resetToken) {
        res.status(400);
        return res.send(createMessageObj("Invalid request"));
      }

      identity.temporaryKey = undefined;
      identity.temporaryKeyDate = undefined;
      identity.password = requestData.password;

      try {
        await user.save();
        res.send();
      } catch (error) {
        logger.error({ message: error });
        res.status(500);
        res.send(createMessageObj("An error occurred"));
      }
    },
  ]);

  return passwordRouter;
};
