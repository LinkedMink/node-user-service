import { IUserEntityModel } from "./IUserEntityModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     ISettingsModel:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         applications:
 *           type: array
 *           items:
 *             type: string
 *         data:
 *           type: object
 *       required:
 *         - userId
 *         - name
 *         - applications
 *         - data
 *     SettingsModelResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/ISettingsModel'
 */
export interface ISettingModel extends IUserEntityModel {
  name: string;
  applications: string[];
  data: unknown;
}
