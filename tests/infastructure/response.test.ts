import { getResponseObject, ResponseStatus } from "../../src/models/response";

test("getMessageObject should return standard empty response interface", async () => {
  // Act
  const response = getResponseObject();

  // Assert
  expect(response.status).toEqual(ResponseStatus.Success);
  expect(response.data).toEqual(null);
});
