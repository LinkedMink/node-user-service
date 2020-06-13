import { createCrudRouter } from "../infastructure/CreateCrudRouter";
import { AuthorizationClaim } from "../middleware/Authorization";
import { userConverter } from "../models/converters/UserConverter";
import { User } from "../models/database/User";

/**
 * @swagger
 * /User:
 *   get:
 *     description: Get the details of a list of User
 *     tags: [User]
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
 *         description: The retrieved User list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 * 
 * @swagger
 * /User/{id}:
 *   get:
 *     description: Get the details of a specific User
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     responses:
 *       200:
 *         description: The retrieved User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 * 
 * @swagger
 * /User:
 *   post:
 *     description: Save a new User
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IUserModel'
 *     responses:
 *       200:
 *         description: The added User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 * 
 * @swagger
 * /User/{id}:
 *   put:
 *     description: Update an existing User
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IUserModel'
 *     responses:
 *       200:
 *         description: The updated User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         $ref: '#/components/responses/500Internal'
 * 
 * @swagger
 * /User/{id}:
 *   delete:
 *     description: Delete a specific User
 *     tags: [User]
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
export const userRouter = createCrudRouter(
    User,
    userConverter,
    AuthorizationClaim.UserManage);
