import { MongoMemoryServer } from "mongodb-memory-server-core";

export declare type MongoDbMemoryServerOptions = ConstructorParameters<typeof MongoMemoryServer>[0];

/**
 * @see https://github.com/shelfio/jest-mongodb#2-create-jest-mongodb-configjs
 */
export declare interface ShelfJestMongoDbOptions {
  /**
   * @see https://github.com/nodkz/mongodb-memory-server#available-options-for-mongomemoryserver
   * @default { binary: { skipMD5: true }, autoStart: false, instance: {} }
   */
  mongodbMemoryServerOptions: MongoDbMemoryServerOptions;
  /**
   * The environmnent variable that will contain the URI to the in-memory server
   * @default 'MONGO_URL'
   */
  mongoURLEnvName: string;
  /**
   * When true, share the same database instance across all Jest workers
   * @default true
   */
  useSharedDBForAllJestWorkers: boolean;
}
