import {
  ObjectAttribute,
  ObjectDescriptor,
} from "../../infastructure/ObjectDescriptor";

/**
 * @swagger
 * components:
 *   schemas:
 *     IAuthenticateRequest:
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
export interface IAuthenticateRequest {
  email: string;
  password: string;
}

export const registerRequestDescriptor = new ObjectDescriptor<IAuthenticateRequest>(
  {
    email: [ObjectAttribute.Required],
    password: [ObjectAttribute.Required],
  }
);
