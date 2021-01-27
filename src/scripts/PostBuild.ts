import fs from "fs";

import { Logger } from "../infastructure/Logger";
import {
  generateSwaggerSpec,
  SWAGGER_SPEC_FILE,
} from "../infastructure/Swagger";

const logger = Logger.get();

logger.info("Generate Swagger Doc - Start");

const spec = generateSwaggerSpec();
fs.writeFileSync(SWAGGER_SPEC_FILE, JSON.stringify(spec, undefined, 2));

logger.info("Generate Swagger Doc - End");
