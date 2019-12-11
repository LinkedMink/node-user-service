import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { ClaimConverter } from "../models/converters/ClaimConverter";
import { Claim } from "../models/database/Claim";

/**
 * @swagger
 * /Claim:
 *   get:
 *     description: Get the details of a specific Claim
 *     tags: [Claim]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *     responses:
 *       200:
 *         description: The retrieved list of Claim
 *       400:
 *         description: The supplied parameters are invalid
 *
 * @swagger
 * /Claim/{id}:
 *   get:
 *     description: Get the details of a specific Claim
 *     tags: [Claim]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The retrieved Claim
 *       404:
 *         description: The id doesn't match a Claim
 *
 * @swagger
 * /Claim:
 *   post:
 *     description: Save a new Claim
 *     tags: [Claim]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/IClaimModel'
 *     responses:
 *       200:
 *         description: The saved Claim
 *       400:
 *         description: The supplied Claim is invalid
 *
 * @swagger
 * /Claim/{id}:
 *   put:
 *     description: Update an existing Claim
 *     tags: [Claim]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/IClaimModel'
 *     responses:
 *       200:
 *         description: The updated Claim
 *       400:
 *         description: The supplied Claim is invalid
 *       404:
 *         description: The id doesn't match a Claim
 *
 * @swagger
 * /Claim/{id}:
 *   delete:
 *     description: Delete a specific Claim
 *     tags: [Claim]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The Claim was deleted
 *       404:
 *         description: The id doesn't match a Claim
 */
export const claimRouter = createCrudRouter(
    Claim,
    new ClaimConverter(),
    AuthorizationClaim.ClaimManage);
