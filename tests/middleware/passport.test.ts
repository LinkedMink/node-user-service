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
    const jwtPayload = { exp: (Date.now() - 1000) / 1000 };
    const doneFunc = jest.fn();
    const mockReq = {};

    // Act
    jwtHandler(mockReq, jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith("JWT Expired");
  });

  test("JwtStrategy should pass payload to next function and set user", async () => {
    // Arrange
    addJwtStrategy(passport);
    const jwtHandler = (passport as any)._strategies.jwt._verify;
    const jwtPayload = { test: "TEST" };
    const doneFunc = jest.fn();
    const mockReq = { user: undefined };

    // Act
    jwtHandler(mockReq, jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith(null, jwtPayload);
    expect(mockReq.user).toEqual(jwtPayload);
  });
});
