#!/usr/bin/env node

import bodyParser from "body-parser";
import express from "express";
import passport from "passport";

import { config } from "./infastructure/Config";
import { ConfigKey } from "./infastructure/ConfigKey";
import { connectSingletonDatabase } from "./infastructure/Database";
import { initializeLogger, Logger } from "./infastructure/Logger";
import { corsMiddleware } from "./middleware/Cors";
import { errorMiddleware } from "./middleware/Error";
import { logRequestMiddleware } from "./middleware/LogRequest";
import { addJwtStrategy, addLocalStrategy } from "./middleware/Passport";
import { accountRouter } from "./routes/AccountRouter";
import { authenticateRouter } from "./routes/AuthenticateRouter";
import { claimRouter } from "./routes/ClaimRouter";
import { getPasswordRouter } from "./routes/PasswordRouter";
import { pingRouter } from "./routes/PingRouter";
import { registerRouter } from "./routes/RegisterRouter";
import { settingRouter } from "./routes/SettingRouter";
import { getSwaggerRouter } from "./routes/SwaggerRouter";
import { userRouter } from "./routes/UserRouter";

initializeLogger();
void connectSingletonDatabase();

const app = express();

app.use(logRequestMiddleware());
app.use(bodyParser.json());

addJwtStrategy(passport);
addLocalStrategy(passport);
app.use(passport.initialize());

app.use(corsMiddleware);
app.use(errorMiddleware);

app.use("/account", accountRouter);
app.use("/authenticate", authenticateRouter);
app.use("/ping", pingRouter);
app.use("/claims", claimRouter);
app.use("/users", userRouter);
app.use("/settings", settingRouter);

if (config.getBool(ConfigKey.UserRegistrationIsEnabled)) {
  app.use("/password", getPasswordRouter);
  app.use("/register", registerRouter);
}

void getSwaggerRouter()
  .then(router => {
    app.use("/docs", router);
    Logger.get().info("Swagger Doc Loaded: /docs");
  })
  .catch(error => {
    Logger.get().info("Swagger Disabled");
    Logger.get().verbose(error);
  });

const listenPort = config.getNumber(ConfigKey.ListenPort);
export const server = app.listen(listenPort);
