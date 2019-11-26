import passport from "passport";

import { addJwtStrategy } from "../../src/middleware/passport";

describe("passport.ts", () => {
  test("addJwtStrategy should use passport JwtStrategy", async () => {
    // Arrange
    const passportSpy = jest.spyOn(passport, "use");

    // Act
    addJwtStrategy(passport);

    // Assert
    expect(passportSpy).toBeCalledTimes(1);
  });

  test("JwtStrategy should verify expire date", async () => {
    // Arrange
    addJwtStrategy(passport);
    const jwtHandler = (passport as any)._strategies.jwt._verify;
    const jwtPayload = { exp: Date.now() - 100 };
    const doneFunc = jest.fn();

    // Act
    jwtHandler(jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith("jwt expired");
  });

  test("JwtStrategy should pass payload to next function", async () => {
    // Arrange
    addJwtStrategy(passport);
    const jwtHandler = (passport as any)._strategies.jwt._verify;
    const jwtPayload = { test: "TEST" };
    const doneFunc = jest.fn();

    // Act
    jwtHandler(jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith(null, jwtPayload);
  });
});
