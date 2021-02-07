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
 *           minLength: 8
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
