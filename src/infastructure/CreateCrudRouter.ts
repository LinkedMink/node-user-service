import { RequestHandler, Router, Request, Response } from "express";
import { Document, Model, FilterQuery, Query } from "mongoose";

import { authorizeJwtClaim } from "../middleware/Authorization";
import { IJwtPayload } from "../middleware/Passport";
import { IModelMapper } from "../models/mappers/IModelMapper";
import { response } from "../models/responses/IResponseData";
import { IListRequest, searchRequestDescriptor } from "../models/requests/IListRequest";
import { objectDescriptorBodyVerify } from "./ObjectDescriptor";

const DEFAULT_ITEMS_PER_PAGE = 20;

export type GetFilterFunction<T> = (user: IJwtPayload) => FilterQuery<T>;

export const filterByUserId: GetFilterFunction<Document> = (user: IJwtPayload) => ({
  userId: user.sub,
});

/**
 * @swagger
 * /[ObjectType]:
 *   get:
 *     description: Get the details of a list of [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/listPageSize'
 *       - $ref: '#/components/parameters/listPageNumber'
 *       - $ref: '#/components/parameters/listSort'
 *       - $ref: '#/components/parameters/listQuery'
 *     responses:
 *       200:
 *         description: The retrieved [ObjectType] list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   get:
 *     description: Get the details of a specific [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         description: The retrieved [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *
 * @swagger
 * /[ObjectType]:
 *   post:
 *     description: Save a new [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/I[ObjectType]Model'
 *     responses:
 *       200:
 *         description: The added [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   put:
 *     description: Update an existing [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/I[ObjectType]Model'
 *     responses:
 *       200:
 *         description: The updated [ObjectType]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/[ObjectType]ModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 *
 * @swagger
 * /[ObjectType]/{id}:
 *   delete:
 *     description: Delete a specific [ObjectType]
 *     tags: [[ObjectType]]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
export const createCrudRouter = <TFrontend, TBackend extends Document<unknown>>(
  model: Model<TBackend>,
  modelConverter: IModelMapper<TFrontend, TBackend>,
  requiredClaimRead?: string,
  requiredClaimWrite?: string,
  authorizeWriteHandler?: RequestHandler,
  getFilterFunc?: GetFilterFunction<TBackend>,
  isPagingMandatory = true
): Router => {
  const router = Router();

  const getEntityListHandlers: RequestHandler[] = [
    objectDescriptorBodyVerify(searchRequestDescriptor, false),
    async (req: Request, res: Response): Promise<void> => {
      const reqData = req.query as IListRequest<TBackend>;

      let query: Query<TBackend[], TBackend>;
      if (reqData.query) {
        try {
          if (getFilterFunc) {
            const conditions = Object.assign(
              {},
              reqData.query,
              getFilterFunc(req.user as IJwtPayload)
            );
            query = model.find(conditions);
          } else {
            query = model.find(reqData.query);
          }
        } catch (e) {
          res.status(400);
          res.send(response.failed("The supplied query is invalid"));
          return;
        }
      } else {
        if (getFilterFunc) {
          query = model.find(getFilterFunc(req.user as IJwtPayload));
        } else {
          query = model.find();
        }
      }

      if (reqData.sort) {
        try {
          query = query.sort(reqData.sort);
        } catch (e) {
          res.status(400);
          res.send(response.failed("The supplied sort is invalid"));
          return;
        }
      }

      if (isPagingMandatory || reqData.pageSize || reqData.pageNumber) {
        const itemsPerPage = reqData.pageSize ? reqData.pageSize : DEFAULT_ITEMS_PER_PAGE;
        query = query.limit(itemsPerPage);

        if (reqData.pageNumber) {
          query = query.skip(itemsPerPage * reqData.pageNumber);
        }
      }

      const result = await query.exec();
      const responseData = result.map(e => {
        return modelConverter.convertToFrontend(e);
      });

      res.send(response.success(responseData));
    },
  ];

  const getEntityHandlers: RequestHandler[] = [
    async (req: Request, res: Response): Promise<void> => {
      const entityId = req.params.entityId;

      let query: Query<TBackend | null, TBackend>;
      if (getFilterFunc) {
        const conditions = Object.assign({ id: entityId }, getFilterFunc(req.user as IJwtPayload));
        query = model.findOne(conditions);
      } else {
        query = model.findById(entityId);
      }

      const entity = await query.exec();
      if (entity) {
        res.send(response.success(modelConverter.convertToFrontend(entity)));
      } else {
        res.status(404);
        res.send(response.failed(`Failed to find ID: ${entityId}`));
      }
    },
  ];

  const addEntityHandlers: RequestHandler[] = [
    async (req: Request, res: Response): Promise<Response> => {
      const userId = (req.user as IJwtPayload).sub;
      const toSave = modelConverter.convertToBackend(req.body, undefined, `User(${userId})`);

      const saveModel = new model(toSave);

      return saveModel
        .save()
        .then(saved => {
          if (saved !== saveModel) {
            res.status(400);
            return res.send(response.failed(saved));
          }

          return res.send(response.success(modelConverter.convertToFrontend(saved)));
        })
        .catch(e => {
          res.status(400);
          return res.send(response.failed(e));
        });
    },
  ];

  const updateEntityHandlers: RequestHandler[] = [
    async (req: Request, res: Response): Promise<Response> => {
      const entityId = req.params.entityId;
      const toUpdate = await model.findById(entityId).exec();
      if (toUpdate === null) {
        res.status(404);
        return res.send(response.failed(`Failed to find ID: ${entityId}`));
      }

      const userId = (req.user as IJwtPayload).sub;
      const updateModel = modelConverter.convertToBackend(req.body, toUpdate, `User(${userId})`);

      return updateModel
        .save()
        .then(saved => {
          if (saved !== updateModel) {
            res.status(400);
            return res.send(response.failed(saved));
          }

          return res.send(response.success(modelConverter.convertToFrontend(saved)));
        })
        .catch(e => {
          res.status(400);
          return res.send(response.failed(e));
        });
    },
  ];

  const deleteEntityHandlers: RequestHandler[] = [
    async (req: Request, res: Response): Promise<void> => {
      const entityId = req.params.entityId;

      let query: Query<TBackend | null, TBackend>;
      if (getFilterFunc) {
        const conditions = Object.assign({ id: entityId }, getFilterFunc(req.user as IJwtPayload));
        query = model.findOneAndDelete(conditions);
      } else {
        query = model.findByIdAndDelete(entityId);
      }

      const deleted = await query.exec();
      if (deleted) {
        res.send(response.success());
      } else {
        res.status(404);
        res.send(response.failed(`Failed to delete ID: ${entityId}`));
      }
    },
  ];

  if (authorizeWriteHandler) {
    addEntityHandlers.unshift(authorizeWriteHandler);
    updateEntityHandlers.unshift(authorizeWriteHandler);
  }

  if (requiredClaimRead) {
    const authorizeRead = authorizeJwtClaim([requiredClaimRead]);
    getEntityListHandlers.unshift(authorizeRead);
    getEntityHandlers.unshift(authorizeRead);

    const authorizeWrite = requiredClaimWrite
      ? authorizeJwtClaim([requiredClaimWrite])
      : authorizeRead;

    addEntityHandlers.unshift(authorizeWrite);
    updateEntityHandlers.unshift(authorizeWrite);
    deleteEntityHandlers.unshift(authorizeWrite);
  }

  router.get("/", getEntityListHandlers);
  router.get("/:entityId", getEntityHandlers);
  router.post("/", addEntityHandlers);
  router.put("/:entityId", updateEntityHandlers);
  router.delete("/:entityId", deleteEntityHandlers);

  return router;
};
