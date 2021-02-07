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
