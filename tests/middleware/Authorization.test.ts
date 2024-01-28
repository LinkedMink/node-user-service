import path from "path";

import { authorizeJwtClaim } from "../../src/lib/middleware/Authorization.mjs";

describe(path.basename(__filename, ".test.ts"), () => {
  test("authorizeJwtClaim should return middleware handler function", () => {
    // Act
    const handler = authorizeJwtClaim(["TEST_CLAIM"]);

    // Assert
    expect(handler).toBeDefined();
  });
});
