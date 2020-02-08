import { logger } from "../infastructure/Logger";
import { getResponseObject, ResponseStatus } from "../models/IResponseData";
import { CORS_ERROR } from "./Cors";

export class UserInputError extends Error {
  private inputErrorValue: boolean;

  constructor(message: string) {
    super(message);
    this.inputErrorValue = true;
  }

  get inputError() {
    return this.inputErrorValue;
  }
}

export const errorMiddleware = (error: any, req: any, res: any) => {
  if (error && error.stack) {
    if (error.stack) {
      logger.error(error.stack);
    } else if (error.message) {
      logger.error(error.message);
    } else if (typeof error === "string") {
      logger.error(error);
    }
  }

  if (error.inputError) {
    res.status(400);
    return res.send(getResponseObject(ResponseStatus.Failed, error.message));
  } else if (error && error.message === CORS_ERROR) {
    res.status(401);
    return res.send(getResponseObject(ResponseStatus.Failed, error.message));
  }

  res.status(500);
  return res.send(getResponseObject(ResponseStatus.Failed));
};
