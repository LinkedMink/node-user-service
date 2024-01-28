import { RequestHandler, Router } from "express";
import { Document, FilterQuery, Model, ObjectId } from "mongoose";
import { CrudController } from "../controllers/CrudController.mjs";
import { authenticateJwt, authorizeJwtClaim } from "../middleware/Authorization.mjs";
import { UserSession } from "../middleware/passport/PassportJwt.mjs";
import { DocumentMapper } from "../models/mappers/DocumentMapper.mjs";

export type GetFilterFunction<T> = (user: UserSession) => FilterQuery<T>;

export const filterByUserId: GetFilterFunction<Document<ObjectId>> = (user: UserSession) => ({
  userId: user.sub,
});

export const createCrudRouter = <TFrontend, TBackend extends object>(
  model: Model<TBackend>,
  modelConverter: DocumentMapper<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string,
  authorizeWriteHandler?: RequestHandler,
  getFilterFunc?: GetFilterFunction<TBackend>,
  isPagingMandatory = true
): Router => {
  const router = Router();
  const controller = new CrudController(model, modelConverter, getFilterFunc, isPagingMandatory);

  const getEntityListHandlers: RequestHandler[] = [];
  const getEntityHandlers: RequestHandler[] = [];
  const addEntityHandlers: RequestHandler[] = [];
  const updateEntityHandlers: RequestHandler[] = [];
  const deleteEntityHandlers: RequestHandler[] = [];

  if (requiredClaimRead || requiredClaimWrite || authorizeWriteHandler) {
    getEntityListHandlers.push(authenticateJwt);
    getEntityHandlers.push(authenticateJwt);
    addEntityHandlers.push(authenticateJwt);
    updateEntityHandlers.push(authenticateJwt);
    deleteEntityHandlers.push(authenticateJwt);
  }

  if (requiredClaimRead) {
    const authorizeRead = authorizeJwtClaim([requiredClaimRead]);
    getEntityListHandlers.push(authorizeRead);
    getEntityHandlers.push(authorizeRead);

    const authorizeWrite = requiredClaimWrite
      ? authorizeJwtClaim([requiredClaimWrite])
      : authorizeRead;

    addEntityHandlers.push(authorizeWrite);
    updateEntityHandlers.push(authorizeWrite);
    deleteEntityHandlers.push(authorizeWrite);
  }

  if (authorizeWriteHandler) {
    addEntityHandlers.push(authorizeWriteHandler);
    updateEntityHandlers.push(authorizeWriteHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  getEntityListHandlers.push(controller.getListHandler);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  getEntityHandlers.push(controller.getHandler);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  addEntityHandlers.push(controller.addHandler);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  updateEntityHandlers.push(controller.updateHandler);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  deleteEntityHandlers.push(controller.deleteHandler);

  router.get("/", getEntityListHandlers);
  router.get("/:entityId", getEntityHandlers);
  router.post("/", addEntityHandlers);
  router.put("/:entityId", updateEntityHandlers);
  router.delete("/:entityId", deleteEntityHandlers);

  return router;
};
