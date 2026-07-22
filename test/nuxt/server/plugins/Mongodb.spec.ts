import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useH3TestUtils } from "~~/test/setup";
import { connectDB } from "~~/server/db/connect";
import type { NitroApp } from "nitropack";

useH3TestUtils();

vi.mock("~~/server/db/connect", () => ({
  connectDB: vi.fn(),
}));

const { mongoDbUriRef } = vi.hoisted(() => ({
  mongoDbUriRef: { value: "" },
}));

// Must stay top-level: mockNuxtImport is an AST transform. Preserve the real
// config so setupNuxt can initialize `$router` (test-utils v4).
mockNuxtImport("useRuntimeConfig", (original) => {
  return () => ({
    ...original(),
    mongoDbUri: mongoDbUriRef.value,
  });
});

type MongodbPlugin = typeof import("~~/server/plugins/mongodb");

let mongoServer: MongoMemoryServer;
let mongodbPlugin: MongodbPlugin;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

describe("mongodb plugin", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoDbUriRef.value = mongoServer.getUri();
    mongodbPlugin = await import("~~/server/plugins/mongodb");
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should connect successfully", async () => {
    mongodbPlugin.default({} as NitroApp);

    await new Promise(process.nextTick);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MongoDB connected successfully!",
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle connection failure", async () => {
    const error = new Error("Failed");
    vi.mocked(connectDB).mockRejectedValue(error);

    mongodbPlugin.default({} as NitroApp);

    await new Promise(process.nextTick);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to connect to MongoDB:",
      error,
    );
  });
});
