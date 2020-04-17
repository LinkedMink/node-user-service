import cryptoRandomString from "crypto-random-string";
import { Response } from "express-serve-static-core";

import { sendVerifyEmail } from "../infastructure/Email";
import { IUser, User } from "../models/database/User";
import { getResponseObject, ResponseStatus } from "../models/IResponseData";

const VERIFICATION_KEY_LENGTH = 30;

export const getUserAndCheckVerified = async (res: Response, email: string): Promise<IUser | null> => {
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

export const sendEmailWithCode = (res: Response, email: string, code: string, data: object | null = null): Promise<void> => {
  return sendVerifyEmail(email, code)
    .then(() => {
      res.send(getResponseObject(ResponseStatus.Success, data))
    })
    .catch(() => {
      res.status(500);
      res.send(getResponseObject(ResponseStatus.Failed, "An error occurred"));
    });
};

export const getEmailVerificationCode = (): string => {
  return cryptoRandomString({
    length: VERIFICATION_KEY_LENGTH,
    type: "url-safe",
  });
};
