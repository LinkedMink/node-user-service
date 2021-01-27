import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { claimConverter } from "../models/converters/ClaimConverter";
import { Claim } from "../models/database/Claim";

/**
 * @swagger
 * /Claim:
 *   get:
 *     description: Get the details of a list of Claim
 *     tags: [Claim]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The retrieved Claim list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClaimModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /Claim/{id}:
 *   get:
 *     description: Get the details of a specific Claim
 *     tags: [Claim]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         description: The retrieved Claim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *
 * @swagger
 * /Claim:
 *   post:
 *     description: Save a new Claim
 *     tags: [Claim]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IClaimModel'
 *     responses:
 *       200:
 *         description: The added Claim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *
 * @swagger
 * /Claim/{id}:
 *   put:
 *     description: Update an existing Claim
 *     tags: [Claim]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IClaimModel'
 *     responses:
 *       200:
 *         description: The updated Claim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 *
 * @swagger
 * /Claim/{id}:
 *   delete:
 *     description: Delete a specific Claim
 *     tags: [Claim]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200Null'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
export const claimRouter = createCrudRouter(
  Claim,
  claimConverter,
  AuthorizationClaim.ClaimManage
);
