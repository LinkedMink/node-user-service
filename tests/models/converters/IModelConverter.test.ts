import path from "path";
import {
  mapTrackedEntity,
  setUserModifier,
} from "../../../src/models/converters/IModelConverter";
import { ITrackedEntity } from "../../../src/models/database/TrackedEntity";
import { ITrackedEntityModel } from "../../../src/models/ITrackedEntityModel";

describe(path.basename(__filename, ".test.ts"), () => {
  test("mapTrackedEntity should return tracking info", () => {
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

  test("setUserModifier should set modifiedBy", () => {
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

  test("setUserModifier should set createdBy if new", () => {
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
