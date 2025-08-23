import request, { Response } from "supertest";
import { app } from "../../app";

it("should sign up a user with status code 201", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
    .expect((res: Response) => {
      expect(res.body.user.email).toEqual("test@test.com");
    });
});

it("should return a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "invalid-email",
      password: "password",
    })
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual("Email must be valid");
    });
});

it("should return 400 with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "e@gmail.com",
      password: "p",
    })
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual(
        "Password must be between 4 and 20 characters"
      );
    });
});

it("should return 400 with invalid request body", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({})
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual("Email must be valid");
      expect(res.body.errors[1].message).toEqual(
        "Password must be between 4 and 20 characters"
      );
    });
});

it("should disallow duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400)
    .expect((res: Response) => {
      expect(res.body.errors[0].message).toEqual("Email in use");
    });
});

it('should return cookie with valid credentials', async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
