import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../../../setup";
import { createMockH3Event } from "../../../../../mock/h3-event";

vi.mock("../../../../../../server/controllers/admin/getAdminProfile");

useH3TestUtils();

describe("GET /api/v1/admin/profile (index.get)", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Arrange: import handlers
  const getAdminProfileHandler =
    await import("../../../../../../server/controllers/admin/getAdminProfile");

  type GetAdminProfileHandlerType = Awaited<
    ReturnType<typeof getAdminProfileHandler.default>
  >;

  const adminProfileIndexGet =
    await import("../../../../../../server/api/v1/admin/profile/index.get");

  it("should call getAdminProfile controller with event and returns result", async () => {
    const fakeResponse = {
      admin: {
        email: "email@gmail.com",
        username: "Admin",
        avatar: null,
        role: UserSchemaRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as unknown as GetAdminProfileHandlerType;
    vi.mocked(getAdminProfileHandler.default).mockResolvedValue(fakeResponse);

    const event = createMockH3Event({});

    // Act: call sections index.get handler
    const result = await adminProfileIndexGet.default(event);

    // Assert: controller should be called with event and response returned
    expect(getAdminProfileHandler.default).toHaveBeenCalledWith(event);
    expect(result).toEqual(fakeResponse);
  });
});
