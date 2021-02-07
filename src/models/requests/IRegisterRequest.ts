import { config } from "../../infastructure/Config";
import { ConfigKey } from "../../infastructure/ConfigKey";

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
 *           minLength: 8
 *       required:
 *         - email
 *         - password
 */
export interface IRegisterRequest {
  email: string;
  password: string;
}
