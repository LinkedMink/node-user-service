import passport from "passport";

import { authorizeJwtClaim } from "../../src/middleware/Authorization";

describe("authorization.ts", () => {
  test("authorizeJwtClaim should return middleware handler function", () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const passportSpy = jest.spyOn(passport, "use");

    // Act
    const handler = authorizeJwtClaim(["TEST_CLAIM"]);

    // Assert
    expect(handler).toBeDefined();
  });
});
