import { NextFunction, Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";

export const authenticateRouter = Router();
const authController = new AuthController();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
authenticateRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  return authController.handleEmailPass(req, res, next);
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
authenticateRouter.post("/key", (req: Request, res: Response, next: NextFunction) => {
  return authController.handleKeyChallenge(req, res, next);
});
