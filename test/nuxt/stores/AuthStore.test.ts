import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { useAuthStore } from "../../../app/stores/authStore";
import type { AuthUser } from "../../../shared/types";
import { UserSchemaRole } from "../../../server/types/enums";
import { handleError } from "../../../app/utils/handleError";
import { showSuccessToast } from "../../../app/utils/toastNotification";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      public: {
        baseApiPath: "/api/v1",
      },
    };
  };
});

mockNuxtImport("navigateTo", () => navigateToMock);

vi.mock("~/utils/toastNotification", () => ({
  showSuccessToast: vi.fn(),
}));

vi.mock("~/utils/handleError", () => ({
  handleError: vi.fn(),
}));

vi.mock("~/utils/validateLoginResponse", () => ({
  authUserSchema: {
    parse: vi.fn((p) => p),
  },
  loginResponseSchema: {
    parse: vi.fn((p) => p),
  },
}));

describe("authStore", () => {
  const mockAuthUser: AuthUser = {
    user_id: "68a9d098b70e48772cd5ceaa",
    email: "test@example.com",
    role: UserSchemaRole.GUEST,
  };

  beforeEach(() => {
    setActivePinia(createTestPinia());
    vi.resetAllMocks();
  });

  it("should have default state", () => {
    // Arrange: create a new auth store
    const store = useAuthStore();

    // Assert: the default state should be an empty/initial values
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
    expect(store.loading).toBe(false);
  });

  it("should 'setAuthUser' correctly update state", () => {
    // Arrange: create store
    const store = useAuthStore();

    // Act: call setAuthUser with mock user
    store.setAuthUser(mockAuthUser);

    // Assert: store state should match provided mock user
    expect(store.user).toEqual(mockAuthUser);
  });

  it("should 'setLoggedIn' correctly update state", () => {
    // Arrange: create store
    const store = useAuthStore();

    // Act: call setLoggedIn with true
    store.setLoggedIn(true);

    // Assert: store state should match provided loggedIn status
    expect(store.loggedIn).toBe(true);
  });

  it("should 'clearAuth' reset state", () => {
    // Arrange: create store and set some initial state
    const store = useAuthStore();
    store.setAuthUser(mockAuthUser);

    // Act: call clearAuth to reset state
    store.clearAuth();

    // Assert: store state should be reset to default values
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
  });

  it("should 'isAdmin' return true when user is admin and logged in", () => {
    // Arrange: create store with logged in admin user
    const store = useAuthStore();
    const adminUser = { ...mockAuthUser, role: UserSchemaRole.ADMIN };
    store.setAuthUser(adminUser);
    store.setLoggedIn(true);

    // Act: check if user is admin
    const isAdmin = store.isAdmin;

    // Assert: isAdmin should be true for an admin user
    expect(isAdmin).toBe(true);
  });

  it("should 'isAdmin' return false for non-admin user", () => {
    // Arrange
    const store = useAuthStore();
    store.setAuthUser(mockAuthUser);
    store.setLoggedIn(true);

    // Act
    const isAdmin = store.isAdmin;

    // Assert
    expect(isAdmin).toBe(false);
  });

  it("should 'login' perform successful login and update state", async () => {
    // Arrange: mock API response
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({
        user: mockAuthUser,
        token: "JWT_TOKEN",
      }),
    );

    const store = useAuthStore();

    // Act: perform login
    const result = await store.login({
      email: "test@example.com",
      password: "password",
    });

    // Assert: login successful
    expect(result).toBe(true);
    expect(store.user).toEqual(mockAuthUser);
    expect(store.loggedIn).toBe(true);
    expect(store.loading).toBe(false);
  });

  it("should 'login' handle error and not update auth state", async () => {
    // Arrange: mock API error
    vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("API error")));

    const store = useAuthStore();

    // Act
    const result = await store.login({
      email: "test@example.com",
      password: "password",
    });

    // Assert
    expect(result).toBe(false);
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
    expect(handleError).toHaveBeenCalled();
    expect(store.loading).toBe(false);
  });

  it("should 'logout' handle user logout, clear auth state and redirect", async () => {
    // Arrange
    vi.stubGlobal("$fetch", vi.fn().mockResolvedValue({ success: true }));

    const store = useAuthStore();
    store.setAuthUser(mockAuthUser);
    store.setLoggedIn(true);

    // Act
    await store.logout();

    // Assert
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
    expect(store.loading).toBe(false);
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(showSuccessToast).toHaveBeenCalledWith("Successfully logged out");
  });

  it("should 'logout' handle error but still clear auth state", async () => {
    // Arrange
    vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("API error")));

    const store = useAuthStore();
    store.setAuthUser(mockAuthUser);
    store.setLoggedIn(true);

    // Act
    await store.logout();

    // Assert
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
    expect(store.loading).toBe(false);
    expect(handleError).toHaveBeenCalled();
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(showSuccessToast).toHaveBeenCalledWith("Successfully logged out");
  });

  it("should set auth user when 'checkAuth' succeeds", async () => {
    // Arrange
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({
        user: mockAuthUser,
      }),
    );

    const store = useAuthStore();

    // Act
    await store.checkAuth();

    // Assert
    expect(store.user).toEqual(mockAuthUser);
    expect(store.loggedIn).toBe(true);
    expect(store.loading).toBe(false);
  });

  it("should clear auth state when 'checkAuth' fails", async () => {
    // Arrange
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockRejectedValue(new Error("Unauthorized")),
    );

    const store = useAuthStore();
    store.setAuthUser(mockAuthUser);
    store.setLoggedIn(true);

    // Act
    await store.checkAuth();

    // Assert
    expect(store.user).toBeNull();
    expect(store.loggedIn).toBe(false);
    expect(store.loading).toBe(false);
  });
});
