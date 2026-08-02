import { describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { useH3TestUtils } from "../../../setup";
import { createMockH3Event } from "../../../mock/h3-event";

useH3TestUtils();

describe("GET /api/v1/health", async () => {
  const healthHandler = await import("../../../../server/api/v1/health.get");

  it("should return ok and mongo connected when mongoose is ready", async () => {
    vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(1);

    const result = await healthHandler.default(createMockH3Event({}));

    expect(result).toEqual({
      ok: true,
      mongo: "connected",
    });
  });

  it("should return ok and mongo disconnected when mongoose is not ready", async () => {
    vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(0);

    const result = await healthHandler.default(createMockH3Event({}));

    expect(result).toEqual({
      ok: true,
      mongo: "disconnected",
    });
  });
});
