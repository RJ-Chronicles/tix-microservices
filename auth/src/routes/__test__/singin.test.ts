import request, { Response } from "supertest";
import { app } from "../../app";

// Email that does not exist
it("should return 400 if email does not exist", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "nonexistent@test.com",
      password: "password",
    })
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual("Invalid credentials");
    });
});

// Sign in with incorrect password
it("should return 400 with incorrect password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "valid-password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "ljasdlf",
    })
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual("Invalid credentials");
    });
});

// validate set-cookie header is present
it("should set a cookie after successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "valid-password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "valid-password",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
