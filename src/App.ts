import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import passport from "passport";

import { config, ConfigKey, Environment } from "./infastructure/Config";
import { connectSingletonDatabase } from "./infastructure/Database";
import { corsMiddleware } from "./middleware/Cors";
import { errorMiddleware } from "./middleware/Error";
import { addJwtStrategy, addLocalStrategy } from "./middleware/Passport";
import { authenticateRouter } from "./routes/Authenticate";
import { claimRouter } from "./routes/Claim";
import { passwordRouter } from "./routes/Password";
import { pingRouter } from "./routes/Ping";
import { registerRouter } from "./routes/Register";
import { swaggerRouter } from "./routes/Swagger";
import { userRouter } from "./routes/User";

connectSingletonDatabase();

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());

addJwtStrategy(passport);
addLocalStrategy(passport);
app.use(passport.initialize());

app.use(corsMiddleware);
app.use(errorMiddleware);

app.use("/ping", pingRouter);
app.use("/authenticate", authenticateRouter);
app.use("/users", userRouter);
app.use("/claims", claimRouter);

if (config.getBool(ConfigKey.UserRegistrationIsEnabled)) {
  app.use("/password", passwordRouter);
  app.use("/register", registerRouter);
}

if (process.env.NODE_ENV !== Environment.Production) {
  app.use("/docs", swaggerRouter);
}

export const server = app.listen(config.getString(ConfigKey.ListenPort));
