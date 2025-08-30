import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../setup";
import { createMockH3Event } from "../mock/h3-event";
import { UserSchemaRole } from "../../server/types/enums";
import { User } from "../../server/models/User";

vi.mock("../server/models/User");

useH3TestUtils();

describe("Auth controller", async () => {
  const mockUser = {
    email: "test@example.com",
    role: UserSchemaRole.ADMIN,
    comparePassword: vi.fn(),
    createJWT: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = await import("../../server/api/v1/auth/login.post");

  it("should throw 400 if email or password missing", async () => {
    // Arrange: create mock event without password
    const event = createMockH3Event({ body: { email: "" } });

    // Act & Assert: calling handler should throw validation error
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  });

  it("should throw 401 if user not found", async () => {
    // Arrange: mock DB to return no user
    vi.mocked(User.findOne).mockResolvedValue(null);

    const event = createMockH3Event({
      body: { email: "notfound@example.com", password: "pass" },
    });

    // Act & Assert: calling handler should throw 'user not found' error
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Invalid credentials: User not found",
    });
  });

  it("should throw 401 if password is incorrect", async () => {
    // Arrange: mock DB to return a user
    vi.mocked(User.findOne).mockResolvedValue(mockUser);
    // And simulate wrong password
    mockUser.comparePassword.mockResolvedValue(false);

    const event = createMockH3Event({
      body: { email: "test@example.com", password: "wrongpassword" },
    });

    // Act & Assert: calling handler should throw 'incorrect password' error
    await expect(handler.default(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Incorrect password",
    });
  });

  it("should return token and user on success", async () => {
    // Arrange: mock DB to return a user
    vi.mocked(User.findOne).mockResolvedValue(mockUser);
    // Simulate correct password
    mockUser.comparePassword.mockResolvedValue(true);
    // And mock JWT generation
    mockUser.createJWT.mockReturnValue("jwt-token");

    const event = createMockH3Event({
      body: { email: "test@example.com", password: "correctpass" },
    });

    // Act: call handler
    const result = await handler.default(event);

    // Assert: check interactions and returned data
    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(mockUser.comparePassword).toHaveBeenCalledWith("correctpass");
    expect(mockUser.createJWT).toHaveBeenCalled();
    expect(result).toEqual({
      user: { email: "test@example.com", role: UserSchemaRole.ADMIN },
      token: "jwt-token",
    });
  });
});
