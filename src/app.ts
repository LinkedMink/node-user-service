import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import passport from "passport";

import { ConfigKey, getConfigValue } from "./infastructure/config";
import { connectSingletonDatabase } from "./infastructure/database";
import { addJwtStrategy, addLocalStrategy } from "./middleware/passport";
import { authenticationRouter } from "./routes/authentication";
import { pingRouter } from "./routes/ping";
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

app.use("/docs", swaggerRouter);
app.use("/authenticate", authenticationRouter);
app.use("/", pingRouter);
app.use("/users", userRouter);

export const server = app.listen(getConfigValue(ConfigKey.ListenPort));
