import { NextFunction, ParamsDictionary, Request, Response } from "express-serve-static-core";

import { getResponseObject, ResponseStatus } from "../models/IResponseData";

export enum ObjectAttribute {
  Required,
  Range,
  Length,
}

export interface IObjectAttributeParams {
  value: ObjectAttribute;
  params: { [key: string]: any; };
}

export class ObjectDescriptor<TVerify> {
  constructor(
    private descriptors: { [key: string]: Array<ObjectAttribute | IObjectAttributeParams>; },
    private isEmptyRequestAllowed: boolean = false,
    private sanitizeFunc?: (toSanitize: TVerify) => TVerify) {}

  public verify = (toVerify: any): string[] | TVerify => {
    const errors: string[] = [];

    if (!this.isEmptyRequestAllowed &&
      (!toVerify || Object.keys(toVerify).length === 0)) {

      errors.push("The request requires parameters");
      return errors;
    }

    for (const [property, attributes] of Object.entries(this.descriptors)) {
      attributes.forEach((attribute) => {
        if (attribute === ObjectAttribute.Required && !toVerify[property]) {
          errors.push(`${property}: Required`);
          return;
        }

        if (!toVerify[property]) {
          return;
        }

        const complex = (attribute as IObjectAttributeParams);
        if (complex.value === ObjectAttribute.Range) {
          if (complex.params.min !== undefined &&
            Number(toVerify[property]) < complex.params.min) {
            errors.push(`${property}: must be greater than ${complex.params.min}`);
          }

          if (complex.params.max !== undefined &&
            Number(toVerify[property]) > complex.params.max) {
            errors.push(`${property}: must be less than ${complex.params.max}`);
          }
        } else if (complex.value === ObjectAttribute.Length) {
          if (complex.params.min !== undefined &&
            toVerify[property].length < complex.params.min) {
            errors.push(`${property}: must be longer than ${complex.params.min}`);
          }

          if (complex.params.max !== undefined &&
            toVerify[property].length > complex.params.max) {
            errors.push(`${property}: must be shorter than ${complex.params.max}`);
          }
        }
      });
    }

    if (errors.length > 0) {
      return errors;
    }

    return toVerify as TVerify;
  }

  public sanitize = (toSanitize: TVerify) => {
    if (this.sanitizeFunc) {
      return this.sanitizeFunc(toSanitize);
    }

    return toSanitize;
  }
}

export const objectDescriptorBodyVerify = <TVerify>(
  descriptor: ObjectDescriptor<TVerify>,
  isInBody: boolean = true) => {
  return (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    let data = req.body;
    if (!isInBody) {
      data = req.query;
    }

    const modelCheck = descriptor.verify(data);
    if ((modelCheck as string[]).length) {
      const response = getResponseObject(ResponseStatus.RequestValidation, { errors: modelCheck });
      res.status(400);
      return res.send(response);
    } else {
      if (isInBody) {
        req.body = descriptor.sanitize(modelCheck as TVerify);
      } else {
        req.query = descriptor.sanitize(modelCheck as TVerify);
      }
    }

    next();
  };
};
