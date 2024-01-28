/**
 * @type {import('./tests/shelf-jest-mongodb').ShelfJestMongoDbOptions}
 */
const config = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "4.4.16",
      skipMD5: true,
    },
    instance: {
      dbName: "jest",
    },
    autoStart: false,
  },
};

module.exports = config;
