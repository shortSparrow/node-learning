import request from "supertest";
import app from "../../app";
import { users } from "../../data/users";
const refreshTokenValue = "RefreshToken";
const accessTokenValue = "AccessToken";

jest.mock("../../usecases/tokens/generateRefreshToken", () => ({
  generateRefreshToken: jest.fn(() => refreshTokenValue),
}));

jest.mock("../../usecases/tokens/generateAccessToken", () => ({
  generateAccessToken: jest.fn(() => accessTokenValue),
}));

describe("Register API", () => {
  beforeEach(() => {
    users.length = 0;
  });

  describe("Test POST /register validation", () => {
    test("It should response with 200 success", async () => {
      await request(app)
        .post("/register")
        .send({
          email: "1@ukr.net",
          password: "123",
          name: "Senya",
        })
        .expect("Content-Type", /json/)
        .expect(200);
    });

    test("It should response with 400 failure if email is wrong", async () => {
      await request(app)
        .post("/register")
        .send({
          email: "1@ukr.",
          password: "123",
          name: "Senya",
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((response) => {
          expect(typeof response.body.error).toBe("string");
        });
    });

    test("It should response with 400 failure if password is wrong", async () => {
      await request(app)
        .post("/register")
        .send({
          email: "1@ukr.",
          password: ".",
          name: "Senya",
        })
        .expect("Content-Type", /json/)
        .expect(400)
        .then((response) => {
          expect(typeof response.body.error).toBe("string");
        });
    });
  });

  test("It should response with 409 failure if user already exist", async () => {
    await request(app)
      .post("/register")
      .send({
        email: "1@ukr.net",
        password: "123",
        name: "Senya",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    await request(app)
      .post("/register")
      .send({
        email: "1@ukr.net",
        password: "123",
        name: "Senya",
      })
      .expect("Content-Type", /json/)
      .expect(409)
      .then((response) => {
        expect(response.body.error).toBe("User Already Exist");
      });
  });

  test("It should set refresh token in cookie and send access in body", async () => {
    await request(app)
      .post("/register")
      .send({
        email: "1@ukr.net",
        password: "123",
        name: "Senya",
      })
      .expect(
        "set-cookie",
        `refreshToken=${refreshTokenValue}; Path=/get-new-access-token; HttpOnly; Secure`
      )
      .expect(200)
      .then((response) => {
        expect(response.body.accessToken).toBe(accessTokenValue);
      });
  });
});
