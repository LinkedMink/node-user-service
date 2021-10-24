import path from "path";
import { response, ResponseStatus } from "../../../src/models/responses/IResponseData";

describe(path.basename(__filename, ".test.ts"), () => {
  test("getMessageObject should return standard empty response interface", () => {
    // Act
    const result = response.get();

    // Assert
    expect(result.status).toEqual(ResponseStatus.Success);
    expect(result.data).toEqual(null);
  });
});
