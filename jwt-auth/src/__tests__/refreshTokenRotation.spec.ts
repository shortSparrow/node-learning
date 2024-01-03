import request from "supertest";
import app from "../app";
import { getUserByEmail, getUserDbByEmail } from "../usecases/user/getUserBy";
import { users } from "../data/users";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Refresh Token Rotation", () => {
  beforeEach(() => {
    users.length = 0;
  });

  it("Should send new access and refresh token on call get-new-access-token", async () => {
    let userAccessToken = null;
    let userCookies = null;

    await request(app)
      .post("/register")
      .send({
        email: "1@ukr.net",
        password: "123",
        name: "Senya",
      })
      .expect(200)
      .then((res) => {
        userAccessToken = res.body.accessToken;
        userCookies = res.headers["set-cookie"];
      });

    await request(app)
      .get("/user-info")
      .set({ Authorization: `Bearer ${userAccessToken}` })
      .expect(200)
      .then((res) => {
        const user = getUserByEmail("1@ukr.net");
        expect(res.body).toEqual(user);
      });

    let newUserAccessToken = null;
    let newUserCookies = null;
    await request(app)
      .get("/get-new-access-token")
      .set("Cookie", userCookies!!)
      .expect(200)
      .then((res) => {
        newUserAccessToken = res.body.accessToken;
        newUserCookies = res.headers["set-cookie"];
      });

    await request(app)
      .get("/user-info")
      .set({ Authorization: `Bearer ${newUserAccessToken}` })
      .expect(200)
      .then((res) => {
        const user = getUserByEmail("1@ukr.net");
        expect(res.body).toEqual(user);
      });
  });

  it("Should delete all user's refresh tokens if one token could be compromised", async () => {
    const userEmail = "1@ukr.net";
    let userAccessToken = null;
    let userCookies = null;

    const registerRoute = await request(app).post("/register").send({
      email: userEmail,
      password: "123",
      name: "Senya",
    });

    expect(registerRoute.status).toBe(200);
    userAccessToken = registerRoute.body.accessToken;
    userCookies = registerRoute.headers["set-cookie"];

    const getUserRoute = await request(app)
      .get("/user-info")
      .set({ Authorization: `Bearer ${userAccessToken}` })
      .send();

    expect(getUserRoute.status).toBe(200);
    const user = getUserByEmail(userEmail);
    expect(getUserRoute.body).toEqual(user);

    let newUserAccessToken = null;
    let newUserCookies = null;

    const userGetNewAccess = await request(app) // emulate user behavior
      .get("/get-new-access-token")
      .set("Cookie", userCookies!!)
      .send();

    expect(userGetNewAccess.status).toBe(200);
    newUserAccessToken = userGetNewAccess.body.accessToken;
    newUserCookies = userGetNewAccess.headers["set-cookie"];

    await request(app) // emulate attacker use old refresh token
      .get("/get-new-access-token")
      .set("Cookie", userCookies!!)
      .expect(401)
      .send();

    await request(app) // user try to use his newUserCookies
      .get("/get-new-access-token")
      .set("Cookie", newUserCookies!!)
      .send()
      .expect(401);

    expect(getUserDbByEmail(userEmail)?.oldRefreshTokens.length).toBe(0);
  });
});
