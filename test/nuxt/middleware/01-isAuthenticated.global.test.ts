import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia } from "pinia";
import middleware from "../../../app/middleware/01-isAuthenticated.global";
import { createTestPinia } from "../../setup";
import { useAuthStore } from "../../../app/stores/authStore";
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedGeneric,
} from "vue-router";

describe("01-isAuthenticated.global middleware", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createTestPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  it("should call checkAuth on client side", async () => {
    // Arrange: Spy on the checkAuth method and create minimal mock route objects
    vi.spyOn(authStore, "checkAuth");

    const to: Partial<RouteLocationNormalizedGeneric> = {
      path: "/",
    };

    const from: Partial<RouteLocationNormalized> = {
      path: "/admin/dashboard",
    };

    // Act
    await middleware(
      to as RouteLocationNormalizedGeneric,
      from as RouteLocationNormalized,
    );

    // Assert: checkAuth should be called
    expect(authStore.checkAuth).toHaveBeenCalledTimes(1);
  });

  // NOTE:
  // Cannot easily test server-side behavior because import.meta is a compiler flag
});
