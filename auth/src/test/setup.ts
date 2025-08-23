import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
  var signin: () => Promise<string[]>;
}

// Set up a new in-memory MongoDB instance
// beforeAll is a Jest hook that runs before all tests in the file
let mongoServer: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "test";
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// beforeEach is a Jest hook that runs before each test in the file
beforeEach(async () => {
  const collections = (await mongoose.connection?.db?.collections()) ?? [];
  //await mongoose.connection.dropDatabase();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// afterAll is a Jest hook that runs after all tests in the file
afterAll(async () => {
  await mongoose.connection?.close();
  await mongoServer?.stop();
});

global.signin = async (email?: string, password?: string) => {
  const auth = await request(app)
    .post("/api/users/signup")
    .send({
      email: email || "test@test.com",
      password: password || "valid-password",
    })
    .expect(201);
  const cookie = auth.get("Set-Cookie");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  return cookie;
};
