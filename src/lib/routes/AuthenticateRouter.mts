import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controllers/AuthController.mjs";

export const authenticateRouter = Router();
const authController = new AuthController();

authenticateRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  return authController.handleEmailPass(req, res, next);
});
