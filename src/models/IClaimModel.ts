import { ITrackedEntityModel } from "./ITrackedEntityModel";

/**
 * @swagger
 * definitions:
 *   IClaimModel:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       applications:
 *         type: array
 *         items:
 *           type: string
 *     required:
 *       - name
 *       - applications
 */
export interface IClaimModel extends ITrackedEntityModel {
  name: string;
  applications: string[];
}
