import { Router } from "express";

export const getOpenApiRouter = async (
  openApiDoc: Record<string, unknown>
): Promise<Router | null> => {
  try {
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
  } catch (error) {
    if (error instanceof Error && error.code === "ERR_MODULE_NOT_FOUND") {
      return null;
    }

    throw error;
  }
};
