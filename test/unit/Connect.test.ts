import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB } from "../../server/db/connect";

let mongoServer: MongoMemoryServer;

describe("connectDB", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("should connect to MongoDB", async () => {
    const uri = mongoServer.getUri();
    const result = await connectDB(uri);

    expect(result.connection.readyState).toBe(1); // 1 means connected
  });
});
