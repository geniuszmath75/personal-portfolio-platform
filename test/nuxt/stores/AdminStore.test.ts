import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { useAdminStore } from "../../../app/stores/adminStore";
import { UserSchemaRole } from "../../../shared/types/enums";
import { handleError } from "../../../app/utils/handleError";

mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      public: {
        baseApiPath: "/api/v1",
      },
    };
  };
});

vi.mock("~/utils/handleError", () => ({
  handleError: vi.fn(),
}));

vi.mock("~/utils/validateUser", () => ({
  adminDetailsResponseSchema: {
    parse: vi.fn((p) => p),
  },
  adminUserSchema: {
    parse: vi.fn((p) => p),
  },
}));

vi.mock("~/utils/validateImageUpload", () => ({
  imageCreationResponseSchema: {
    parse: vi.fn((p) => p),
  },
}));

describe("adminStore", () => {
  const mockAdminDetails: ValidatedAdminUser = {
    email: "test@example.com",
    username: "Admin",
    role: UserSchemaRole.ADMIN,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    setActivePinia(createTestPinia());
    vi.resetAllMocks();
  });

  it("should have default state", () => {
    // Arrange: create a new admin store
    const store = useAdminStore();

    // Assert: the default state should be an empty/initial values
    expect(store.adminDetails).toBeNull();
    expect(store.loading).toBe(false);
  });

  describe("setAdminDetails", () => {
    it("should 'setAdminDetails' correctly update state", () => {
      // Arrange: create store
      const store = useAdminStore();

      // Act: call setAuthUser with mock user
      store.setAdminDetails(mockAdminDetails);

      // Assert: store state should match provided mock user
      expect(store.adminDetails).toEqual(mockAdminDetails);
    });
  });

  describe("basicAdminDetails", () => {
    it("should return correct values when adminDetails is set", () => {
      const store = useAdminStore();
      store.setAdminDetails(mockAdminDetails);

      expect(store.basicAdminDetails).toEqual({
        email: mockAdminDetails.email,
        username: mockAdminDetails.username,
        avatar: mockAdminDetails.avatar,
      });
    });

    it("should return empty strings and null avatar when adminDetails is null", () => {
      const store = useAdminStore();

      expect(store.basicAdminDetails).toEqual({
        email: "",
        username: "",
        avatar: null,
      });
    });
  });

  describe("fetchAdminProfile", () => {
    it("should fetch admin profile and set adminDetails in state", async () => {
      const store = useAdminStore();
      const fetchResponse = { admin: mockAdminDetails };

      vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(fetchResponse));

      await store.fetchAdminProfile();

      expect(store.adminDetails).toEqual(mockAdminDetails);
    });

    it("should call $fetch with correct arguments", async () => {
      const store = useAdminStore();
      const mockFetch = vi.fn().mockResolvedValue({ admin: mockAdminDetails });
      vi.stubGlobal("$fetch", mockFetch);

      await store.fetchAdminProfile();

      expect(mockFetch).toHaveBeenCalledWith("/admin/profile", {
        baseURL: "/api/v1",
        credentials: "include",
      });
    });

    it("should set loading to false after successful fetch", async () => {
      const store = useAdminStore();
      vi.stubGlobal(
        "$fetch",
        vi.fn().mockResolvedValue({ admin: mockAdminDetails }),
      );

      await store.fetchAdminProfile();

      expect(store.loading).toBe(false);
    });

    it("should call handleError and set loading to false on fetch failure", async () => {
      const store = useAdminStore();
      const fetchError = new Error("Network error");
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(fetchError));

      await store.fetchAdminProfile();

      expect(handleError).toHaveBeenCalledWith(
        fetchError,
        "Failed to fetch Admin profile",
      );
      expect(store.loading).toBe(false);
    });

    it("should not update adminDetails on fetch failure", async () => {
      const store = useAdminStore();
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error()));

      await store.fetchAdminProfile();

      expect(store.adminDetails).toBeNull();
    });
  });

  describe("updateAdminProfile", () => {
    const updatedProfile = {
      username: "UpdatedAdmin",
      email: "new@example.com",
    };

    it("should call $fetch with correct arguments", async () => {
      const store = useAdminStore();
      const mockFetch = vi.fn().mockResolvedValue({ admin: mockAdminDetails });
      vi.stubGlobal("$fetch", mockFetch);

      await store.updateAdminProfile(updatedProfile);

      expect(mockFetch).toHaveBeenCalledWith("/admin/profile", {
        baseURL: "/api/v1",
        method: "PATCH",
        credentials: "include",
        body: updatedProfile,
      });
    });

    it("should update adminDetails and return true on success", async () => {
      const store = useAdminStore();
      const updatedAdmin = {
        ...mockAdminDetails,
        username: "UpdatedAdmin",
      };

      vi.stubGlobal(
        "$fetch",
        vi.fn().mockResolvedValue({ admin: updatedAdmin }),
      );

      const result = await store.updateAdminProfile(updatedProfile);

      expect(result).toBe(true);
      expect(store.adminDetails).toEqual(updatedAdmin);
    });

    it("should set loading to false after successful update", async () => {
      const store = useAdminStore();
      vi.stubGlobal(
        "$fetch",
        vi.fn().mockResolvedValue({ admin: mockAdminDetails }),
      );

      await store.updateAdminProfile(updatedProfile);

      expect(store.loading).toBe(false);
    });

    it("should call handleError and return false on failure", async () => {
      const store = useAdminStore();
      const fetchError = new Error("Update failed");
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(fetchError));

      const result = await store.updateAdminProfile(updatedProfile);

      expect(result).toBe(false);
      expect(handleError).toHaveBeenCalledWith(
        fetchError,
        "Failed to update Admin profile",
      );
    });

    it("should set loading to false after failed update", async () => {
      const store = useAdminStore();
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error()));

      await store.updateAdminProfile(updatedProfile);

      expect(store.loading).toBe(false);
    });
  });

  describe("uploadAvatar", () => {
    const mockFile = new File(["content"], "avatar.png", {
      type: "image/png",
    });
    const mockUrl = "/uploads/avatars/avatar.png";

    it("should call $fetch with correct arguments including FormData", async () => {
      const store = useAdminStore();
      const mockFetch = vi
        .fn()
        .mockResolvedValue({ success: true, data: { url: mockUrl } });
      vi.stubGlobal("$fetch", mockFetch);

      await store.uploadAvatar(mockFile);

      const [path, options] = mockFetch.mock.calls[0]!;
      expect(path).toBe("/upload/image");
      expect(options.baseURL).toBe("/api/v1");
      expect(options.method).toBe("POST");
      expect(options.credentials).toBe("include");
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.query.category).toBe(UploadCategory.AVATARS);
    });

    it("should return the uploaded avatar URL on success", async () => {
      const store = useAdminStore();
      vi.stubGlobal(
        "$fetch",
        vi.fn().mockResolvedValue({
          success: true,
          data: { url: mockUrl },
        }),
      );

      const result = await store.uploadAvatar(mockFile);

      expect(result).toBe(mockUrl);
    });

    it("should use default AVATARS category when none is provided", async () => {
      const store = useAdminStore();
      const mockFetch = vi
        .fn()
        .mockResolvedValue({ success: true, data: { url: mockUrl } });
      vi.stubGlobal("$fetch", mockFetch);

      await store.uploadAvatar(mockFile);

      expect(mockFetch.mock.calls[0]![1].query.category).toBe(
        UploadCategory.AVATARS,
      );
    });

    it("should pass custom category when provided", async () => {
      const store = useAdminStore();
      const mockFetch = vi
        .fn()
        .mockResolvedValue({ success: true, data: { url: mockUrl } });
      vi.stubGlobal("$fetch", mockFetch);

      await store.uploadAvatar(mockFile, UploadCategory.PROJECTS);

      expect(mockFetch.mock.calls[0]![1].query.category).toBe(
        UploadCategory.PROJECTS,
      );
    });

    it("should set loading to false after successful upload", async () => {
      const store = useAdminStore();
      vi.stubGlobal(
        "$fetch",
        vi.fn().mockResolvedValue({
          success: true,
          data: { url: mockUrl },
        }),
      );

      await store.uploadAvatar(mockFile);

      expect(store.loading).toBe(false);
    });

    it("should call handleError and return null on failure", async () => {
      const store = useAdminStore();
      const fetchError = new Error("Upload failed");
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(fetchError));

      const result = await store.uploadAvatar(mockFile);

      expect(result).toBeNull();
      expect(handleError).toHaveBeenCalledWith(
        fetchError,
        "Failed to upload image",
      );
    });

    it("should set loading to false after failed upload", async () => {
      const store = useAdminStore();
      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error()));

      await store.uploadAvatar(mockFile);

      expect(store.loading).toBe(false);
    });
  });
});
