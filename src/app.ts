import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import passport from "passport";

import { ConfigKey, getConfigValue } from "./infastructure/config";
import { connectSingletonDatabase } from "./infastructure/database";
import { addJwtStrategy, addLocalStrategy } from "./middleware/passport";
import { authenticateRouter } from "./routes/authenticate";
import { claimRouter } from "./routes/claim";
import { passwordRouter } from "./routes/password";
import { pingRouter } from "./routes/ping";
import { registerRouter } from "./routes/register";
import { swaggerRouter } from "./routes/swagger";
import { userRouter } from "./routes/user";

connectSingletonDatabase();

const app = express();

app.use(morgan("dev"));

app.use(bodyParser.json());

addJwtStrategy(passport);
addLocalStrategy(passport);
app.use(passport.initialize());

app.use(cors({
  origin: getConfigValue(ConfigKey.AllowedOrigins),
  optionsSuccessStatus: 200,
}));

app.use("/ping", pingRouter);
app.use("/docs", swaggerRouter);
app.use("/authenticate", authenticateRouter);
app.use("/users", userRouter);
app.use("/claims", claimRouter);

if (getConfigValue(ConfigKey.UserRegistrationIsEnabled).toLowerCase() === "true") {
  app.use("/password", passwordRouter);
  app.use("/register", registerRouter);
}

export const server = app.listen(getConfigValue(ConfigKey.ListenPort));
