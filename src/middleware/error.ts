import { logger } from "../infastructure/logger";
import { getResponseObject, ResponseStatus } from "../models/response";
import { CORS_ERROR } from "./cors";

export const errorMiddleware = (error: any, req: any, res: any, next: any) => {
  if (error && error.stack) {
    if (error.stack) {
      logger.error(error.stack);
    } else if (error.message) {
      logger.error(error.message);
    }
  }

  if (error && error.message === CORS_ERROR) {
    res.status(401);
    res.send(getResponseObject(ResponseStatus.Failed, error.message));
  }
};