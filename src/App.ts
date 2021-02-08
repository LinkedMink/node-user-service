#!/usr/bin/env node

import bodyParser from "body-parser";
import express from "express";
import passport from "passport";

import { config } from "./infastructure/Config";
import { ConfigKey } from "./infastructure/ConfigKey";
import { connectSingletonDatabase } from "./infastructure/Database";
import { initializeLogger, Logger } from "./infastructure/Logger";
import { corsMiddleware } from "./middleware/Cors";
import { getErrorMiddleware } from "./middleware/Error";
import { logRequestMiddleware } from "./middleware/LogRequest";
import { addJwtStrategy, addLocalStrategy } from "./middleware/Passport";
import { accountRouter } from "./routes/AccountRouter";
import { authenticateRouter } from "./routes/AuthenticateRouter";
import { claimRouter } from "./routes/ClaimRouter";
import { getPasswordRouter } from "./routes/PasswordRouter";
import { getOpenApiRouter } from "./routes/OpenApiRouter";
import { pingRouter } from "./routes/PingRouter";
import { registerRouter } from "./routes/RegisterRouter";
import { settingRouter } from "./routes/SettingRouter";
import { userRouter } from "./routes/UserRouter";
import { getValidator } from "./middleware/Validator";

initializeLogger();
void connectSingletonDatabase();

const app = express();

app.use(logRequestMiddleware());
app.use(bodyParser.json());

app.use(corsMiddleware);

addJwtStrategy(passport);
addLocalStrategy(passport);
app.use(passport.initialize());

void getValidator().then(validator => {
  app.use(validator.match());
  app.use("/", pingRouter);
  app.use("/account", accountRouter);
  app.use("/authenticate", authenticateRouter);
  app.use("/claims", claimRouter);
  app.use("/users", userRouter);
  app.use("/settings", settingRouter);

  if (config.getBool(ConfigKey.UserRegistrationIsEnabled)) {
    app.use("/password", getPasswordRouter);
    app.use("/register", registerRouter);
  }

  app.use(getErrorMiddleware());

  void getOpenApiRouter()
    .then(router => {
      app.use("/docs", router);
      Logger.get().info("Swagger UI Path: /docs");
    })
    .catch(error => {
      Logger.get().info("Swagger Disabled");
      Logger.get().verbose({ message: error as Error });
    });
});

const listenPort = config.getNumber(ConfigKey.ListenPort);
export const server = app.listen(listenPort);
