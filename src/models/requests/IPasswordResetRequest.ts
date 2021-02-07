/**
 * @swagger
 * components:
 *   schemas:
 *     IPasswordResetRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         resetToken:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *       required:
 *         - email
 *         - resetToken
 *         - password
 */
export interface IPasswordResetRequest {
  email: string;
  resetToken: string;
  password: string;
}
