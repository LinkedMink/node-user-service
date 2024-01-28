import { FilterQuery, SortOrder } from "mongoose";

export interface IListRequest<T> {
  pageSize?: number;
  pageNumber?: number;
  sort?: Record<string, SortOrder>;
  query?: FilterQuery<T>;
}
