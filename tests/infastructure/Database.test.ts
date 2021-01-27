import mongoose from "mongoose";
import path from "path";

import { connectSingletonDatabase } from "../../src/infastructure/Database";

describe(path.basename(__filename, ".test.ts"), () => {
  let connectFunction = mongoose.connect;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    connectFunction = mongoose.connect;
    mongoose.connect = jest.fn().mockReturnValue(Promise.resolve(undefined));
  });

  afterEach(() => {
    mongoose.connect = connectFunction;
    jest.resetAllMocks();
  });

  test("connectSingletonDatabase should call connect", () => {
    // Act
    connectSingletonDatabase();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });

  test("connectSingletonDatabase should catch connection errors", () => {
    // Arrange
    // Typescript restriction requires never return type on process.exit
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error();
    });
    mongoose.connect = jest.fn().mockRejectedValue(new Error());

    // Act
    connectSingletonDatabase().then(() => {
      // Assert
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
