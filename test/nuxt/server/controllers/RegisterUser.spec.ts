import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "~~/test/setup";
import { createMockH3Event } from "~~/test/mock/h3-event";
import { User } from "~~/server/models/User";

vi.mock("~~/server/models/User");

useH3TestUtils();

describe("registerUser controller", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("~~/server/api/v1/auth/register.post");

  it("should throw 403 and never create a user", async () => {
    const event = createMockH3Event({
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    });

    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Registration is disabled",
    });
    expect(User.create).not.toHaveBeenCalled();
  });

  it("should reject registration even with an empty body", async () => {
    const event = createMockH3Event({ body: {} });

    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 403,
      message: "Registration is disabled",
    });
    expect(User.create).not.toHaveBeenCalled();
  });
});
