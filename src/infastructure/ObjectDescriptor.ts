import { NextFunction, Request, Response } from "express";
import { ParsedQs } from "qs";

import { response, ResponseStatus } from "../models/responses/IResponseData";
import { isArray, isString } from "./TypeCheck";

export enum ObjectAttribute {
  Required,
  Range,
  Length,
}

export interface IObjectAttributeParams {
  value: ObjectAttribute;
  params: { [key: string]: string | number };
}

export class ObjectDescriptor<TVerify> {
  constructor(
    private descriptors: {
      [key: string]: Array<ObjectAttribute | IObjectAttributeParams>;
    },
    private isEmptyRequestAllowed: boolean = false,
    private sanitizeFunc?: (toSanitize: TVerify) => TVerify
  ) {}

  public verify = (toVerify: Record<string, unknown>): string[] | TVerify => {
    const errors: string[] = [];

    if (!this.isEmptyRequestAllowed && (!toVerify || Object.keys(toVerify).length === 0)) {
      errors.push("The request requires parameters");
      return errors;
    }

    for (const [property, attributes] of Object.entries(this.descriptors)) {
      attributes.forEach(attribute => {
        const toVerifyProperty = toVerify[property];
        if (attribute === ObjectAttribute.Required && toVerifyProperty === undefined) {
          errors.push(`${property}: Required`);
          return;
        }

        if (toVerifyProperty === undefined) {
          return;
        }

        const complex = attribute as IObjectAttributeParams;
        if (complex.value === ObjectAttribute.Range) {
          if (complex.params.min !== undefined && Number(toVerifyProperty) < complex.params.min) {
            errors.push(`${property}: must be greater than ${complex.params.min}`);
          }

          if (complex.params.max !== undefined && Number(toVerifyProperty) > complex.params.max) {
            errors.push(`${property}: must be less than ${complex.params.max}`);
          }
        } else if (complex.value === ObjectAttribute.Length && isString(toVerifyProperty)) {
          if (complex.params.min !== undefined && toVerifyProperty.length < complex.params.min) {
            errors.push(`${property}: must be longer than ${complex.params.min}`);
          }

          if (complex.params.max !== undefined && toVerifyProperty.length > complex.params.max) {
            errors.push(`${property}: must be shorter than ${complex.params.max}`);
          }
        }
      });
    }

    if (errors.length > 0) {
      return errors;
    }

    return (toVerify as unknown) as TVerify;
  };

  public sanitize = (toSanitize: TVerify): TVerify => {
    if (this.sanitizeFunc) {
      return this.sanitizeFunc(toSanitize);
    }

    return toSanitize;
  };
}

export const objectDescriptorBodyVerify = <TVerify>(
  descriptor: ObjectDescriptor<TVerify>,
  isInBody = true
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    let data = req.body as Record<string, unknown>;
    if (!isInBody) {
      data = req.query as Record<string, unknown>;
    }

    const modelCheck = descriptor.verify(data);
    if (isArray(modelCheck)) {
      res.status(400);
      res.send(
        response.get(ResponseStatus.RequestValidation, {
          errors: modelCheck,
        })
      );
      return;
    } else {
      if (isInBody) {
        req.body = descriptor.sanitize(modelCheck);
      } else {
        req.query = (descriptor.sanitize(modelCheck) as unknown) as ParsedQs;
      }
    }

    next();
  };
};
