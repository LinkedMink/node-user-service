import cryptoRandomString from "crypto-random-string";
import { Response } from "express";

import { EmailSender } from "../infastructure/Email";
import { IUser, User } from "../models/database/User";
import { IAccountModel } from "../models/requests/IAccountModel";
import { response } from "../models/responses/IResponseData";
import { IUserModel } from "../models/responses/IUserModel";

const VERIFICATION_KEY_LENGTH = 30;

export const getUserAndCheckVerified = async (
  res: Response,
  email: string
): Promise<IUser | null> => {
  const user = await User.findOne({ email }).exec();
  if (!user) {
    res.status(404);
    res.send(response.failed());
    return null;
  }

  if (user.isEmailVerified) {
    res.status(400);
    res.send(response.failed("Email already verified"));
    return null;
  }

  return user;
};

export const sendEmailWithCode = (
  res: Response,
  email: string,
  code: string,
  data: IUserModel | IAccountModel | null = null
): Promise<void> => {
  return EmailSender.get()
    .sendVerifyEmail(email, code)
    .then(isSuccess => {
      if (isSuccess) {
        res.send(response.success(data));
        return;
      }

      res.status(500);
      res.send(response.failed("An error occurred"));
    });
};

export const getEmailVerificationCode = (): string => {
  return cryptoRandomString({
    length: VERIFICATION_KEY_LENGTH,
    type: "url-safe",
  });
};
