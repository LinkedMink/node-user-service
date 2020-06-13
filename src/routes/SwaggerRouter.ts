import { Router } from "express";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";

import { config } from "../infastructure/Config";
import { generateSwaggerSpec, loadPreGeneratedSwaggerSpec } from "../infastructure/Swagger";

export const swaggerRouter = Router();

const swaggerUiOptions: SwaggerUiOptions = {
  isExplorer: true,
};

swaggerRouter.use("/", swaggerUi.serve);

if (config.isEnvironmentLocal) {
  swaggerRouter.get("/", swaggerUi.setup(generateSwaggerSpec(), swaggerUiOptions));
} else {
  swaggerRouter.get("/", swaggerUi.setup(loadPreGeneratedSwaggerSpec(), swaggerUiOptions));
}
