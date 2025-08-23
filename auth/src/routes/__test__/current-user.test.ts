import request from "supertest";
import { app } from "../../app";

it("should return current user details", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeDefined();
  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("should return 401 if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual("Not authorized");
});
