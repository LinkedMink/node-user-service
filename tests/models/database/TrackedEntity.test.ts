import path from "path";
import {
  ITrackedEntity,
  trackedEntityPreValidateFunc,
} from "../../../src/models/database/TrackedEntity";

describe(path.basename(__filename, ".test.ts"), () => {
  test("trackedEntityPreValidateFunc should update modified and call next", () => {
    // Arrange
    const nextFunction = jest.fn();
    const mockTrackedEntity = {
      createdDate: null,
      modifiedDate: null,
    } as unknown as ITrackedEntity;

    // Act
    const boundFunction = trackedEntityPreValidateFunc.bind(mockTrackedEntity);
    boundFunction(nextFunction);

    // Assert
    expect(mockTrackedEntity.createdDate).not.toBeNull();
    expect(mockTrackedEntity.modifiedDate).not.toBeNull();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
