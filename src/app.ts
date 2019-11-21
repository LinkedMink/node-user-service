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

connectSingletonDatabase();

const app = express();

app.use(passport.initialize());
addJwtStrategy(passport);
addLocalStrategy(passport);

app.use(bodyParser.json());

app.use(cors({
  origin: getConfigValue(ConfigKey.AllowedOrigins),
  optionsSuccessStatus: 200,
}));

app.use(morgan("dev"));

app.use("/authenticate", authenticationRouter);
app.use("/", pingRouter);

export const server = app.listen(getConfigValue(ConfigKey.ListenPort));
