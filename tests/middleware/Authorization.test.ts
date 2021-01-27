import passport from "passport";
import path from "path";

import { authorizeJwtClaim } from "../../src/middleware/Authorization";

describe(path.basename(__filename, ".test.ts"), () => {
  test("authorizeJwtClaim should return middleware handler function", () => {
    // Arrange
    const passportSpy = jest.spyOn(passport, "use");

    // Act
    const handler = authorizeJwtClaim(["TEST_CLAIM"]);

    // Assert
    expect(handler).toBeDefined();
  });
});
