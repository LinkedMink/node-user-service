/**
 * @swagger
 * components:
 *   schemas:
 *     IBearerToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example:
 *     BearerTokenResponse:
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/Response/properties/status'
 *         data:
 *           $ref: '#/components/schemas/IBearerToken'
 */
export interface IBearerToken {
  token: string;
}
