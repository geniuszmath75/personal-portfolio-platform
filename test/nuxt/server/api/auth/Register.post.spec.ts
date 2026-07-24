import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockH3Event } from "~~/test/mock/h3-event";
import { useH3TestUtils } from "~~/test/setup";

vi.mock("~~/server/controllers/registerUser");

useH3TestUtils();

describe("POST /api/v1/auth/register", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controllerHandler = await import("~~/server/controllers/registerUser");
  const registerHandler = await import("~~/server/api/v1/auth/register.post");

  it("should call register controller with event and return its result", async () => {
    const event = createMockH3Event({
      body: { email: "a", password: "b", username: "c" },
    });

    vi.mocked(controllerHandler.default).mockRejectedValue(
      createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Registration is disabled",
      }),
    );

    await expect(registerHandler.default(event)).rejects.toMatchObject({
      statusCode: 403,
      message: "Registration is disabled",
    });
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
  });
});
