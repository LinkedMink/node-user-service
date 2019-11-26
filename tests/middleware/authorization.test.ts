import passport from "passport";

import { authorizeJwtClaim } from "../../src/middleware/authorization";

describe("authorization.ts", () => {
  test("authorizeJwtClaim should return middleware handler function", async () => {
    // Arrange
    const passportSpy = jest.spyOn(passport, "use");

    // Act
    const handler = authorizeJwtClaim(["TEST_CLAIM"]);

    // Assert
    expect(handler).toBeDefined();
  });
});
