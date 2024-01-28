import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import openapiValidatorMiddleware from "openapi-validator-middleware";
import { createMessageObj } from "../functions/Response.mjs";
import { Logger } from "../infrastructure/Logger.mjs";
import { isError } from "../infrastructure/TypeCheck.mjs";
import { CORS_ERROR } from "./Cors.mjs";

export const getErrorMiddleware = (): ErrorRequestHandler => {
  const OPENAPI_NOT_FOUND = /Path=\S+ with method=[a-zA-Z]+ not found from OpenAPI document/;
  const GENERIC_ERROR =
    "An unexpected error has occurred. Please try again later or contact the administrator if the problem persist.";
  const logger = Logger.fromModuleUrl(import.meta.url);

  const errorMiddleware: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (isError(error)) {
      if (error instanceof openapiValidatorMiddleware.InputValidationError) {
        logger.warn({
          message: `InputValidationError from ${req.ip}: ${JSON.stringify(error.errors)}`,
        });
        res.status(400);
        return res.send(error.errors);
      } else if (error.message === CORS_ERROR) {
        logger.warn({ message: `CORS_ERROR from ${req.ip}` });
        res.status(403);
        return res.send(createMessageObj(error.message));
      } else if (OPENAPI_NOT_FOUND.test(error.message)) {
        return res.status(404).send(createMessageObj("Not Found"));
      }
    }

    logger.error({ message: error as Error });
    res.status(500);
    return res.send(createMessageObj(GENERIC_ERROR));
  };

  return errorMiddleware;
};
