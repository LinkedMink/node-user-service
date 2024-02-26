import { NextFunction, Request, RequestHandler, Response } from "express";
import { Logger } from "../infrastructure/Logger.mjs";

export const logRequestMiddleware = (): RequestHandler => {
  const logger = Logger.fromModuleUrl(import.meta.url);

  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    logger.http(`Start ${req.method} ${req.originalUrl}`);

    res.on("finish", function () {
      const elapsed = Date.now() - start;
      logger.http(`Ended ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed} ms`);
    });

    next();
  };
};
