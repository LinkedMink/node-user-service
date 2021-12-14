import { NextFunction, Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";

export const authenticateRouter = Router();
const authController = new AuthController();

authenticateRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  return authController.handleEmailPass(req, res, next);
});

authenticateRouter.post("/key", (req: Request, res: Response, next: NextFunction) => {
  return authController.handleKeyChallenge(req, res, next);
});
