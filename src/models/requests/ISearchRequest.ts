import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/ObjectDescriptor";
import { FilterQuery } from "mongoose";

export enum SortOrder {
  Descending = -1,
  Ascending = 1,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ISearchRequest:
 *       type: object
 *       properties:
 *         pageSize:
 *           type: string
 *         pageNumber:
 *           type: string
 *         sort:
 *           type: string
 *         query:
 *           type: string
 */
export interface ISearchRequest<T> {
  pageSize?: number;
  pageNumber?: number;
  sort?: { [key: string]: SortOrder };
  query?: FilterQuery<T>;
}

export const searchRequestDescriptor = new ObjectDescriptor<ISearchRequest<Document>>(
  {
    pageSize: [{
      value: ObjectAttribute.Range,
      params: { min: 1, max: 100 },
    }],
    pageNumber: [{
      value: ObjectAttribute.Range,
      params: { min: 0 },
    }],
  },
  true,
  (toSanitize: ISearchRequest<Document>) => {
    if (toSanitize.pageSize) {
      toSanitize.pageSize = Number(toSanitize.pageSize);
    }
    if (toSanitize.pageSize) {
      toSanitize.pageNumber = Number(toSanitize.pageNumber);
    }
    if (toSanitize.sort) {
      toSanitize.sort = JSON.parse(toSanitize.sort as unknown as string);
    }
    if (toSanitize.query) {
      toSanitize.query = JSON.parse(toSanitize.query as unknown as string);
    }
    return toSanitize;
  },
);
