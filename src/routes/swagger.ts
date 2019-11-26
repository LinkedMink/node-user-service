import { Router } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";

export const swaggerRouter = Router();

const swaggerUiOptions: SwaggerUiOptions = {
  isExplorer: true,
};

const swaggerJsDocOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: "Node User Service",
      version: "0.1.0",
    },
  },
  apis: [
    "../models/response.ts",
    "./ping.ts",
    "./authentication.ts",
    "./user",
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerJsDocOptions);

swaggerRouter.use("/", swaggerUi.serve);
swaggerRouter.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
