import { Router } from "express";

export const getOpenApiRouter = async (openApiDoc: Record<string, unknown>): Promise<Router> => {
  const swaggerUi = await import("swagger-ui-express");

  const getOpenApiRouter = Router();
  getOpenApiRouter.use("/", swaggerUi.serve);
  getOpenApiRouter.get(
    "/",
    swaggerUi.setup(openApiDoc, {
      isExplorer: true,
    })
  );

  return getOpenApiRouter;
};
