import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../../setup";
import { createMockH3Event } from "../../../../../mock/h3-event";

vi.mock("../../../../../../server/controllers/admin/updateAdminProfile");

useH3TestUtils();

describe("PATCH /api/v1/admin/profile (index.patch)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const controllerHandler =
    await import("../../../../../../server/controllers/admin/updateAdminProfile");

  type ControllerHandlerType = Awaited<
    ReturnType<typeof controllerHandler.default>
  >;

  const endpointHandler =
    await import("../../../../../../server/api/v1/admin/profile/index.patch");

  it("should call updateAdminProfile controller with event and returns result", async () => {
    const fakeResponse = {
      admin: {
        email: "email@gmail.com",
        username: "Admin",
        avatar: null,
        role: UserSchemaRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as unknown as ControllerHandlerType;
    vi.mocked(controllerHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections index.get handler
    const result = await endpointHandler.default(event);

    // Assert: controller should be called with event and response returned
    expect(controllerHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
