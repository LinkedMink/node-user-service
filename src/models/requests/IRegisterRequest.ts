import { config, ConfigKey } from "../../infastructure/Config";
import {
  ObjectAttribute,
  ObjectDescriptor,
} from "../../infastructure/ObjectDescriptor";

/**
 * @swagger
 * components:
 *   schemas:
 *     IRegisterRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *       required:
 *         - email
 *         - password
 */
export interface IRegisterRequest {
  email: string;
  password: string;
}

export const registerRequestDescriptor = new ObjectDescriptor<IRegisterRequest>(
  {
    email: [ObjectAttribute.Required],
    password: [
      ObjectAttribute.Required,
      {
        value: ObjectAttribute.Length,
        params: { min: config.getNumber(ConfigKey.UserPassMinLength) },
      },
    ],
  }
);
