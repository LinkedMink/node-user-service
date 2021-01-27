import { config, ConfigKey } from "../../infastructure/Config";
import {
  ObjectAttribute,
  ObjectDescriptor,
} from "../../infastructure/ObjectDescriptor";

/**
 * @swagger
 * components:
 *   schemas:
 *     IAccountModel:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     AccountModelResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/IAccountModel'
 */
export interface IAccountModel {
  id?: string;
  email?: string;
  password?: string;
}

export const accountRequestDescriptor = new ObjectDescriptor<IAccountModel>({
  password: [
    {
      value: ObjectAttribute.Length,
      params: { min: config.getNumber(ConfigKey.UserPassMinLength) },
    },
  ],
});
