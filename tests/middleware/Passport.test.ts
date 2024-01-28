import passport from "passport";
import path from "path";

import { addJwtStrategy } from "../../src/lib/middleware/passport/PassportJwt.mjs";

describe(path.basename(__filename, ".test.ts"), () => {
  test("addJwtStrategy should use passport JwtStrategy", () => {
    // Arrange
    const passportSpy = jest.spyOn(passport, "use");

    // Act
    addJwtStrategy(passport);

    // Assert
    expect(passportSpy).toBeCalledTimes(1);
  });

  test("JwtStrategy should verify expire date", () => {
    // Arrange
    addJwtStrategy(passport);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtHandler = (passport as any)._strategies.jwt._verify;
    const jwtPayload = { exp: (Date.now() - 1000) / 1000 };
    const doneFunc = jest.fn();
    const mockReq = {};

    // Act
    jwtHandler(mockReq, jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith("JWT Expired");
  });

  test("JwtStrategy should pass payload to next function and set user", () => {
    // Arrange
    addJwtStrategy(passport);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtHandler = (passport as any)._strategies.jwt._verify;
    const jwtPayload = { test: "TEST" };
    const doneFunc = jest.fn();
    const mockReq = { user: undefined };

    // Act
    jwtHandler(mockReq, jwtPayload, doneFunc);

    // Assert
    expect(doneFunc).toBeCalledWith(null, jwtPayload);
    expect(mockReq.user).toMatchObject(jwtPayload);
  });
});
