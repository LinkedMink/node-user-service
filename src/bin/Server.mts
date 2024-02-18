#!/usr/bin/env node

import compression from "compression";
import express from "express";
import passport from "passport";
import { config } from "../lib/infrastructure/Config.mjs";
import { ConfigKey } from "../lib/infrastructure/ConfigKey.mjs";
import { connectSingletonDatabase } from "../lib/infrastructure/Database.mjs";
import { initializeLogger, Logger } from "../lib/infrastructure/Logger.mjs";
import { loadOpenApiDoc, OPENAPI_DOCUMENT_PATH } from "../lib/infrastructure/OpenApi.mjs";
import { corsMiddleware } from "../lib/middleware/Cors.mjs";
import { getErrorMiddleware } from "../lib/middleware/Error.mjs";
import { logRequestMiddleware } from "../lib/middleware/LogRequest.mjs";
import { addJwtStrategy } from "../lib/middleware/passport/PassportJwt.mjs";
import { addLocalStrategy } from "../lib/middleware/passport/PassportLocal.mjs";
import { accountRouter } from "../lib/routes/AccountRouter.mjs";
import { authenticateRouter } from "../lib/routes/AuthenticateRouter.mjs";
import { getClaimRouter } from "../lib/routes/ClaimRouter.mjs";
import { healthRouter } from "../lib/routes/HealthRouter.mjs";
import { getOpenApiRouter } from "../lib/routes/OpenApiRouter.mjs";
import { getPasswordRouter } from "../lib/routes/PasswordRouter.mjs";
import { registerRouter } from "../lib/routes/RegisterRouter.mjs";
import { getSettingRouter } from "../lib/routes/SettingRouter.mjs";
import { getUserRouter } from "../lib/routes/UserRouter.mjs";

initializeLogger();
void connectSingletonDatabase();

const app = express();

app.use(logRequestMiddleware());
app.use(express.json());

if (config.getBool(ConfigKey.EnableCompression)) {
  app.use(compression());
}

app.use(corsMiddleware());

addJwtStrategy(passport);
addLocalStrategy(passport);
app.use(passport.initialize());

const openApiDoc = await loadOpenApiDoc();

try {
  const openApiRouter = await getOpenApiRouter(openApiDoc);
  app.use("/docs", openApiRouter);
  Logger.get().info("Swagger UI Path: /docs");
} catch (error) {
  Logger.get().info("Swagger Disabled");
  Logger.get().verbose({ message: error as Error });
}

app.use("/", healthRouter);
app.use("/account", accountRouter);
app.use("/authenticate", authenticateRouter);
app.use("/claims", getClaimRouter());
app.use("/users", getUserRouter());
app.use("/settings", getSettingRouter());

if (config.getBool(ConfigKey.UserRegistrationIsEnabled)) {
  app.use("/password", getPasswordRouter());
  app.use("/register", registerRouter);
}

app.use(getErrorMiddleware());

const listenPort = config.getNumber(ConfigKey.ListenPort);
app.listen(listenPort);
