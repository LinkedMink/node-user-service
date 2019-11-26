import { trackedEntityPreValidateFunc } from "../../../src/models/database/trackedEntity";

describe("trackedEntity.ts", () => {
  test("trackedEntityPreValidateFunc should update modified and call next", async () => {
    // Arrange
    const nextFunction = jest.fn();
    const mockTrackedEntity = {
      createdDate: null,
      modifiedDate: null,
    };

    // Act
    const boundFunction = trackedEntityPreValidateFunc.bind(mockTrackedEntity);
    boundFunction(nextFunction);

    // Assert
    expect(mockTrackedEntity.createdDate).not.toBeNull();
    expect(mockTrackedEntity.modifiedDate).not.toBeNull();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
