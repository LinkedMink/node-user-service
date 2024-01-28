import { Response } from "express";
import { randomBytes } from "node:crypto";
import { createMessageObj } from "../functions/Response.mjs";
import { EmailSender } from "../infrastructure/Email.mjs";
import { IAccountModel } from "../models/requests/IAccountModel.mjs";
import { UserViewModel } from "../models/responses/UserViewModel.mjs";

const VERIFICATION_KEY_BYTES = 16;
export const getEmailVerificationCode = (): string =>
  randomBytes(VERIFICATION_KEY_BYTES).toString("hex");

export const sendEmailWithCode = (
  res: Response,
  email: string,
  code: string,
  data: UserViewModel | IAccountModel | null = null
): Promise<void> => {
  return EmailSender.get()
    .sendVerifyEmail(email, code)
    .then(isSuccess => {
      if (isSuccess) {
        res.send(data);
        return;
      }

      res.status(500);
      res.send(createMessageObj("An error occurred"));
    });
};
