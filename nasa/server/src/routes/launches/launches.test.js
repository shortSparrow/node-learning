const request = require("supertest");
const app = require("../../app");
const { connectMongoDb, disconnectMongoDb } = require("../../services/mongo");

// !! Tests use prod DB but looks like after adding "preset": "@shelf/jest-mongodb" doesn't affect one
describe("Launches API", () => {
  beforeAll(async () => {
    await connectMongoDb();
  });

  afterAll(async () => {
    await disconnectMongoDb();
  });

  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-186 f",
      launchDate: "January 4, 2028",
    };

    const launchDateWithoutData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-186 f",
    };

    const launchDateWithoutInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-186 f",
      launchDate: "wrong date",
    };

    test("It should response with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDateWithoutData);
      // not the same as toEqual. Just see that response.body has the same fields as launchDateWithoutData. But response.body may contain more fields result sill true (see documentation)
    });

    test("It should catch required missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDateWithoutData)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing requires launch value",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDateWithoutInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
