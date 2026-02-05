import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../../app/stores/authStore";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import middleware from "../../../app/middleware/02-admin";
import { UserSchemaRole } from "../../../server/types/enums";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport("navigateTo", () => navigateToMock);

describe("02-admin middleware", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createTestPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  it("should redirect to /auth/login when user is not logged in", async () => {
    // Arrange: Set authStore to not logged in
    authStore.loggedIn = false;
    authStore.user = null;
    const to = { path: "/admin/dashboard" };

    // Act
    await middleware(to);

    // Assert: redirect to /auth/login
    expect(navigateToMock).toHaveBeenCalledOnce();
    expect(navigateToMock).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to /auth/login when user is logged in but not admin", async () => {
    // Arrange: Set authStore to logged in but not admin
    authStore.loggedIn = true;
    authStore.user = {
      role: UserSchemaRole.GUEST,
    };
    const to = { path: "/admin/dashboard" };

    // Act
    await middleware(to);

    // Assert: redirect to /auth/login
    expect(navigateToMock).toHaveBeenCalledOnce();
    expect(navigateToMock).toHaveBeenCalledWith("/auth/login");
  });

  it("should not redirect when user is logged in as ADMIN", async () => {
    // Arrange: Set authStore to logged in as admin
    authStore.loggedIn = true;
    authStore.user = {
      role: UserSchemaRole.ADMIN,
    };
    const to = { path: "/admin/dashboard" };

    // Act
    await middleware(to);

    // Assert: no redirect
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it("should not redirect when route is /admin/login (even if not logged in)", async () => {
    // Arrange: Set authStore to not logged in
    authStore.loggedIn = false;
    authStore.user = null;
    const to = { path: "/admin/login" };

    // Act
    await middleware(to);

    // Assert: no redirect
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
