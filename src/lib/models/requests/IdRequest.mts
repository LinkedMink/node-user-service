import { Request, RequestHandler } from "express";

export interface IdParams {
  id: string;
}

export type IdRequest<TResponse> = Request<
  IdParams,
  TResponse,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;

export type IdRequestHandler<TResponse> = RequestHandler<
  IdParams,
  TResponse,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;
