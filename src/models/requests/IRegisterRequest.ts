import { ObjectAttribute, ObjectDescriptor } from "../../infastructure/ObjectDescriptor";

/**
 * @swagger
 * definitions:
 *   IRegisterRequest:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         format: email
 *       password:
 *         type: string
 *         format: password
 *     required:
 *       - email
 *       - password
 */
export interface IRegisterRequest {
  email: string;
  password: string;
}

export const registerRequestDescriptor = new ObjectDescriptor<IRegisterRequest>({
  email: [ObjectAttribute.Required],
  password: [ObjectAttribute.Required],
});
