import "@shelf/jest-mongodb/lib/types";
import { setGlobalMockTransport } from "./mocks/MockTransport.mjs";

beforeAll(() => {
  process.env.MONGO_DB_CONNECTION_STRING = global.__MONGO_URI__;
  setGlobalMockTransport();
});
