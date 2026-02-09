// tests/mongodb.test.ts
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
import { useH3TestUtils } from "../../../setup";
import { connectDB } from "../../../../server/db/connect";
import type { NitroApp } from "nitropack";

useH3TestUtils();

vi.mock("../../../../server/db/connect", () => ({
  connectDB: vi.fn(),
}));

type MongodbPlugin = typeof import("../../../../server/plugins/mongodb");

let mongoServer: MongoMemoryServer;
let mongodbPlugin: MongodbPlugin;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

describe("mongodb plugin", async () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    // mocked useRuntimeConfig
    const { useRuntimeConfigMock } = vi.hoisted(() => ({
      useRuntimeConfigMock: vi.fn(() => ({
        mongoDbUri: mongoServer.getUri(),
      })),
    }));

    mockNuxtImport("useRuntimeConfig", () => useRuntimeConfigMock);

    // Import plugin after mocking
    mongodbPlugin = await import("../../../../server/plugins/mongodb");
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
    // Call the plugin
    mongodbPlugin.default({} as NitroApp);

    // Wait for the next tick to allow async operations to complete
    await new Promise(process.nextTick);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MongoDB connected successfully!",
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle connection failure", async () => {
    // Mock connectDB to throw an error
    const error = new Error("Failed");
    vi.mocked(connectDB).mockRejectedValue(error);

    // Call the plugin
    mongodbPlugin.default({} as NitroApp);

    // Wait for the next tick to allow async operations to complete
    await new Promise(process.nextTick);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to connect to MongoDB:",
      error,
    );
  });
});
