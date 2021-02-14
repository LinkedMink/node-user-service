import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import path from "path";
import { Logger } from "../infastructure/Logger";
import { response, ResponseStatus } from "../models/responses/IResponseData";
import { CORS_ERROR } from "./Cors";
import { isError, isOpenApiValidationError } from "../infastructure/TypeCheck";

export const getErrorMiddleware = (): ErrorRequestHandler => {
  const GENERIC_ERROR =
    "An unexpected error has occurred. Please try again later or contact the administrator if the problem persist.";
  const logger = Logger.get(path.basename(__filename));

  const errorMiddleware: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.error({ message: error as Error });

    if (isError(error)) {
      if (isOpenApiValidationError(error)) {
        res.send(error.data);
        res.status(400);
        return res.send(response.get(ResponseStatus.RequestValidation, error.message));
      } else if (error.message === CORS_ERROR) {
        res.status(403);
        return res.send(response.failed(error.message));
      }
    }

    res.status(500);
    return res.send(response.failed(GENERIC_ERROR));
  };

  return errorMiddleware;
};
