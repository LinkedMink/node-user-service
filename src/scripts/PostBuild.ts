import fs from "fs";

import { initLogger, Logger } from "../infastructure/Logger";
import {
  generateSwaggerSpec,
  SWAGGER_SPEC_FILE,
} from "../infastructure/Swagger";

initLogger();
const logger = Logger.get();

logger.info("Generate Swagger Doc - Start");

const spec = generateSwaggerSpec();
fs.writeFileSync(SWAGGER_SPEC_FILE, JSON.stringify(spec, undefined, 2));

logger.info("Generate Swagger Doc - End");
