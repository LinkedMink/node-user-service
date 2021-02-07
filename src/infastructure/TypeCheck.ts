import { ValidationError } from "express-openapi-validate";
import { Error } from "mongoose";

export type IsTypeFunc<T> = (toCheck: unknown) => toCheck is T;

export function isError(error: unknown): error is Error {
  return (error as Error).message !== undefined;
}

export function isArray<T>(array: unknown): array is Array<T> {
  return Array.isArray(array);
}

export function isString(toCheck: unknown): toCheck is string {
  return typeof toCheck === "string" || toCheck instanceof String;
}

export function isMongooseValidationError(value: unknown): value is Error.ValidationError {
  const error = value as Error.ValidationError;
  return error.name === "ValidationError" && error.errors !== undefined;
}

export function isOpenApiValidationError(value: unknown): value is ValidationError {
  const error = value as ValidationError;
  return error.statusCode === 400 && error.data?.length !== undefined;
}
