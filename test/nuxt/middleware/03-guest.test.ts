import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../../app/stores/authStore";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import middleware from "../../../app/middleware/03-guest";
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedGeneric,
} from "vue-router";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport("navigateTo", () => navigateToMock);

describe("03-guest middleware", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createTestPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  it("should redirect to '/' when user is logged in and route is not '/'", async () => {
    // Arrange: logged in user
    authStore.loggedIn = true;
    const to: Partial<RouteLocationNormalizedGeneric> = { path: "/auth/login" };
    const from: Partial<RouteLocationNormalized> = { path: "/" };

    // Act
    await middleware(
      to as RouteLocationNormalizedGeneric,
      from as RouteLocationNormalized,
    );
    // Assert
    expect(navigateToMock).toHaveBeenCalledOnce();
    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  it("should not redirect when user is logged in and route is '/'", async () => {
    // Arrange: logged in user
    authStore.loggedIn = true;
    const to: Partial<RouteLocationNormalizedGeneric> = { path: "/" };
    const from: Partial<RouteLocationNormalized> = { path: "/" };

    // Act
    await middleware(
      to as RouteLocationNormalizedGeneric,
      from as RouteLocationNormalized,
    );

    // Assert: no redirect
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it("should not redirect when user is not logged in", async () => {
    // Arrange: not logged in user
    authStore.loggedIn = false;
    const to: Partial<RouteLocationNormalizedGeneric> = { path: "/auth/login" };
    const from: Partial<RouteLocationNormalized> = { path: "/" };

    // Act
    await middleware(
      to as RouteLocationNormalizedGeneric,
      from as RouteLocationNormalized,
    );

    // Assert: no redirect
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
