import { mapTrackedEntity, setUserModifier } from "../../../src/models/converters/modelConverter";
import { ITrackedEntity } from "../../../src/models/database/trackedEntity";
import { ITrackedEntityModel } from "../../../src/models/trackedEntityModel";

describe("modelConverter.ts", () => {
  test("mapTrackedEntity should return tracking info", async () => {
    // Arrrange
    const mockModel: ITrackedEntityModel = {};
    const mockEntity: ITrackedEntity = {
      id: "TEST",
      createdDate: new Date(),
      createdBy: "TEST",
      modifiedDate: new Date(),
      modifiedBy: "TEST",
    } as ITrackedEntity;

    // Act
    const response = mapTrackedEntity(mockEntity, mockModel);

    // Assert
    expect(response.createdBy).toEqual(mockEntity.createdBy);
    expect(response.createdDate).toEqual(mockEntity.createdDate);
    expect(response.modifiedBy).toEqual(mockEntity.modifiedBy);
    expect(response.modifiedDate).toEqual(mockEntity.modifiedDate);
  });

  test("setUserModifier should set modifiedBy", async () => {
    // Arrrange
    const mockModifier = "TEST";
    const mockEntity: ITrackedEntity = {
      id: "TEST",
      createdDate: new Date(),
      createdBy: "OLD_TEST",
      modifiedDate: new Date(),
      modifiedBy: "",
    } as ITrackedEntity;

    // Act
    const response = setUserModifier(mockEntity, mockModifier);

    // Assert
    expect(response.modifiedBy).toEqual(mockModifier);
    expect(response.createdBy).not.toEqual(mockModifier);
  });

  test("setUserModifier should set createdBy if new", async () => {
    // Arrrange
    const mockModifier = "TEST";
    const mockEntity: ITrackedEntity = {
      id: "TEST",
      createdDate: new Date(),
      createdBy: "",
      modifiedDate: new Date(),
      modifiedBy: "",
    } as ITrackedEntity;

    // Act
    const response = setUserModifier(mockEntity, mockModifier);

    // Assert
    expect(response.modifiedBy).toEqual(mockModifier);
    expect(response.createdBy).toEqual(mockModifier);
  });
});
