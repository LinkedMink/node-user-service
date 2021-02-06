import { ITrackedEntityModel } from "./ITrackedEntityModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     IUserModel:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
 *         isLocked:
 *           type: boolean
 *         isLockedDate:
 *           type: string
 *           format: date-time
 *         authenticationDates:
 *           type: array
 *           items:
 *             type: string
 *             format: date-time
 *         claims:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - email
 *         - isEmailVerified
 *         - isLocked
 *         - claims
 *     UserModelResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/IUserModel'
 */
export interface IUserModel extends ITrackedEntityModel {
  email: string;
  password?: string;
  isEmailVerified: boolean;
  isLocked: boolean;
  isLockedDate?: Date;
  authenticationDates?: Date[];
  claims: string[];
}
