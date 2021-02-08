import { FilterQuery } from "mongoose";

export enum SortOrder {
  Descending = "dsc",
  Ascending = "asc",
}

export interface IListRequest<T> {
  pageSize?: number;
  pageNumber?: number;
  sort?: Record<string, SortOrder>;
  query?: FilterQuery<T>;
}
