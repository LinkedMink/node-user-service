import { Router } from "express";

export const getSwaggerRouter = async (): Promise<Router> => {
  const swaggerUi = await import("swagger-ui-express");
  const swaggerModule = await import("../infastructure/Swagger");
  const swaggerDoc = await swaggerModule.getRuntimeSwaggerDoc();

  const swaggerRouter = Router();
  swaggerRouter.use("/", swaggerUi.serve);
  swaggerRouter.get(
    "/",
    swaggerUi.setup(swaggerDoc, {
      isExplorer: true,
    })
  );

  return swaggerRouter;
};
