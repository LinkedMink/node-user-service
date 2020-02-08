import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/ObjectDescriptor";

export enum SortOrder {
  Descending = -1,
  Ascending = 1,
}

/**
 * @swagger
 * definitions:
 *   ISearchRequest:
 *     type: object
 *     properties:
 *       pageSize:
 *         type: string
 *       pageNumber:
 *         type: string
 *       sort:
 *         type: string
 *       query:
 *         type: string
 */
export interface ISearchRequest {
  pageSize?: number;
  pageNumber?: number;
  sort?: { [key: string]: SortOrder };
  query?: { [key: string]: any };
}

export const searchRequestDescriptor = new ObjectDescriptor<ISearchRequest>(
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
  (toSanitize: ISearchRequest) => {
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
