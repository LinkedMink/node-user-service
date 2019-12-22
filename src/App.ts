import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import passport from "passport";

import { config, ConfigKey, Environment } from "./infastructure/Config";
import { connectSingletonDatabase } from "./infastructure/Database";
import { corsMiddleware } from "./middleware/Cors";
import { errorMiddleware } from "./middleware/Error";
import { addJwtStrategy, addLocalStrategy } from "./middleware/Passport";
import { accountRouter } from "./routes/AccountRouter";
import { authenticateRouter } from "./routes/AuthenticateRouter";
import { claimRouter } from "./routes/ClaimRouter";
import { passwordRouter } from "./routes/PasswordRouter";
import { pingRouter } from "./routes/PingRouter";
import { registerRouter } from "./routes/RegisterRouter";
import { settingRouter } from "./routes/SettingRouter";
import { swaggerRouter } from "./routes/SwaggerRouter";
import { userRouter } from "./routes/UserRouter";

connectSingletonDatabase();

const app = express();

app.use(morgan("dev"));
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
  app.use("/password", passwordRouter);
  app.use("/register", registerRouter);
}

if (process.env.NODE_ENV !== Environment.Production) {
  app.use("/docs", swaggerRouter);
}

export const server = app.listen(config.getString(ConfigKey.ListenPort));
