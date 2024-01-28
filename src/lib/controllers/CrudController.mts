import { NextFunction, Request, Response } from "express";
import { Model, QueryWithHelpers } from "mongoose";
import { createMessageObj } from "../functions/Response.mjs";
import { GetFilterFunction } from "../infrastructure/CreateCrudRouter.mjs";
import { Logger } from "../infrastructure/Logger.mjs";
import { isMongooseValidationError } from "../infrastructure/TypeCheck.mjs";
import { UserSession } from "../middleware/passport/PassportJwt.mjs";
import { DocumentMapper } from "../models/mappers/DocumentMapper.mjs";
import { IListRequest } from "../models/requests/IListRequest.mjs";
import { MongooseDocument } from "../types/Mongoose.mjs";

const DEFAULT_ITEMS_PER_PAGE = 20;

export class CrudController<TFrontend, TBackend extends object> {
  private readonly logger = Logger.get(CrudController.name);

  constructor(
    private readonly model: Model<TBackend>,
    private readonly mapper: DocumentMapper<TFrontend, TBackend>,
    private readonly getFilterFunc?: GetFilterFunction<MongooseDocument<TBackend>>,
    private readonly isPagingMandatory = true
  ) {}

  getListHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const reqData = req.query as IListRequest<MongooseDocument<TBackend>>;

    let query: QueryWithHelpers<MongooseDocument<TBackend>[], MongooseDocument<TBackend>>;
    if (reqData.query) {
      try {
        if (this.getFilterFunc) {
          const conditions = Object.assign(
            {},
            reqData.query,
            this.getFilterFunc(req.user as UserSession)
          );
          query = this.model.find(conditions);
        } else {
          query = this.model.find(reqData.query);
        }
      } catch (e) {
        res.status(400);
        res.send(createMessageObj("The supplied query is invalid"));
        return;
      }
    } else {
      if (this.getFilterFunc) {
        query = this.model.find(this.getFilterFunc(req.user as UserSession));
      } else {
        query = this.model.find();
      }
    }

    if (reqData.sort) {
      try {
        query = query.sort(reqData.sort);
      } catch (e) {
        res.status(400);
        res.send(createMessageObj("The supplied sort is invalid"));
        return;
      }
    }

    if (this.isPagingMandatory || reqData.pageSize || reqData.pageNumber) {
      const itemsPerPage = reqData.pageSize ? reqData.pageSize : DEFAULT_ITEMS_PER_PAGE;
      query = query.limit(itemsPerPage);

      if (reqData.pageNumber) {
        query = query.skip(itemsPerPage * reqData.pageNumber);
      }
    }

    const result = await query.exec();
    const responseData = result.map(e => this.mapper.convertToFrontend(e));

    res.send(responseData);
  };

  getHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;

    let query: QueryWithHelpers<MongooseDocument<TBackend> | null, MongooseDocument<TBackend>>;
    if (this.getFilterFunc) {
      const conditions = Object.assign(
        { id: entityId },
        this.getFilterFunc(req.user as UserSession)
      );
      query = this.model.findOne(conditions);
    } else {
      query = this.model.findById(entityId);
    }

    const entity = await query.exec();
    if (entity) {
      res.send(this.mapper.convertToFrontend(entity));
    } else {
      res.status(404);
      res.send(createMessageObj(`Failed to find ID: ${entityId}`));
    }
  };

  addHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = (req.user as UserSession).sub;
    const toSave = this.mapper.convertToBackend(
      req.body as TFrontend,
      undefined,
      `User(${userId})`
    );

    const saveModel = new this.model(toSave);
    try {
      const doc = await saveModel.save();
      res.send(this.mapper.convertToFrontend(doc));
    } catch (error) {
      if (isMongooseValidationError(error)) {
        this.logger.info({ message: error });
        res.status(400).send(error.errors);
      } else if (error) {
        this.logger.error({ message: error });
        throw error;
      }
    }
  };

  updateHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;
    const toUpdate = await this.model.findById(entityId).exec();
    if (!toUpdate) {
      res.status(404);
      res.send(createMessageObj(`Failed to find ID: ${entityId}`));
      return;
    }

    const userId = (req.user as UserSession).sub;
    const updateModel = this.mapper.convertToBackend(
      req.body as TFrontend,
      toUpdate,
      `User(${userId})`
    );

    try {
      const savedDoc = await updateModel.save();
      res.send(this.mapper.convertToFrontend(savedDoc));
    } catch (error) {
      if (isMongooseValidationError(error)) {
        this.logger.info({ message: error });
        res.status(400).send(error.errors);
        return;
      }

      this.logger.error({ message: error });
      res.status(500).send();
    }
  };

  deleteHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const entityId = req.params.entityId;

    let query: QueryWithHelpers<MongooseDocument<TBackend> | null, MongooseDocument<TBackend>>;
    if (this.getFilterFunc) {
      const conditions = Object.assign(
        { id: entityId },
        this.getFilterFunc(req.user as UserSession)
      );
      query = this.model.findOneAndDelete(conditions);
    } else {
      query = this.model.findByIdAndDelete(entityId);
    }

    const deleted = await query.exec();
    if (deleted) {
      res.send(createMessageObj(`Deleted successfully: ${entityId}`));
    } else {
      res.status(404);
      res.send(createMessageObj(`Failed to delete ID: ${entityId}`));
    }
  };
}
