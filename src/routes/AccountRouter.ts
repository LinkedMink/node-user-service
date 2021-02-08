import { Router, Request, Response } from "express";

import { getEmailVerificationCode, sendEmailWithCode } from "../controllers/Verification";
import { authenticateJwt } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { accountMapper } from "../models/mappers/AccountMapper";
import { User } from "../models/database/User";
import { response } from "../models/responses/IResponseData";
import { IAccountModel } from "../models/requests/IAccountModel";
import { isMongooseValidationError } from "../infastructure/TypeCheck";

export const accountRouter = Router();

/**
 * @swagger
 * /account:
 *   get:
 *     description: Get a user's profile
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The user record matching the input token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
accountRouter.get("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).sub;
  const entity = await User.findById(userId).exec();

  if (entity) {
    const model = accountMapper.convertToFrontend(entity);
    return res.send(response.success(model));
  } else {
    res.status(404);
    return res.send(response.failed());
  }
});

accountRouter.put("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).sub;
  const account = req.body as IAccountModel;

  const toUpdate = await User.findById(userId).exec();
  if (toUpdate === null) {
    res.status(500);
    return res.send(response.failed());
  }

  const user = accountMapper.convertToBackend(account, toUpdate, `User(${userId})`);
  if (account.email) {
    user.temporaryKey = getEmailVerificationCode();
  }

  return new Promise((resolve, reject) => {
    user.save((error, newUser) => {
      if (isMongooseValidationError(error)) {
        res.status(400);
        res.send(response.failed(error.errors));
        return resolve();
      } else if (error) {
        res.status(500);
        res.send(response.failed());
        return resolve();
      }

      void sendEmailWithCode(res, newUser.email, newUser.temporaryKey as string, newUser).then(
        () => {
          res.send(response.success(accountMapper.convertToFrontend(newUser)));
          resolve();
        }
      );
    });
  });
});

accountRouter.delete("/", authenticateJwt, async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).sub;
  const deleted = await User.findByIdAndDelete(userId).exec();

  if (deleted) {
    return res.send(response.success());
  } else {
    res.status(500);
    return res.send(response.failed());
  }
});
