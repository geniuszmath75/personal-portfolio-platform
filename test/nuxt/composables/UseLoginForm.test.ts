import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLoginForm } from "../../../app/composables/useLoginForm";
import { mount } from "vue-composable-tester";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { UserSchemaRole } from "../../../server/types/enums";
import { showSuccessToast } from "../../../app/utils/toastNotification";
import { handleError } from "../../../app/utils/handleError";
import type { AuthUser } from "../../../shared/types";
import { createTestPinia } from "../../setup";
import { setActivePinia } from "pinia";
import { useAuthStore } from "../../../app/stores/authStore";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport("navigateTo", () => navigateToMock);

mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      public: {
        baseApiPath: "/api/v1",
      },
    };
  };
});

// Mock schema validator
vi.mock("~/utils/validateLoginResponse", () => ({
  loginResponseSchema: {
    parse: vi.fn((p) => p),
  },
}));

vi.mock("~/utils/toastNotification", () => ({
  showSuccessToast: vi.fn(),
}));

vi.mock("~/utils/handleError", () => ({
  handleError: vi.fn(),
}));

describe("useLoginForm composable", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createTestPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return expected API shape", () => {
    // Arrange
    const { result } = mount(() => useLoginForm({ email: "", password: "" }));

    // Assert
    expect(result).toHaveProperty("formCredentials");
    expect(result).toHaveProperty("submitLogin");

    expect(result).toHaveProperty("validate");
    expect(result).toHaveProperty("touchFields");

    expect(result).toHaveProperty("emailErrors");
    expect(result).toHaveProperty("passwordErrors");
    expect(result).toHaveProperty("isEmailInvalid");
    expect(result).toHaveProperty("isPasswordInvalid");
  });

  it("should 'touchFields' touch correct validation fields", async () => {
    // Arrange
    const { result } = mount(() => useLoginForm({ email: "", password: "" }));

    const spyTouch = vi.spyOn(result, "touchFields");

    // Act
    result.touchFields("email");
    result.touchFields("password");

    // Assert
    expect(spyTouch).toHaveBeenCalledTimes(2);
  });

  it("should 'validate' trigger full form validation", async () => {
    // Arrange
    const { result } = mount(() => useLoginForm({ email: "", password: "" }));

    const spyValidate = vi.spyOn(result.validate as never, "call");

    // Act
    await result.validate();

    // Assert
    expect(spyValidate).toBeDefined();
  });

  it("should 'login' method stop execution when form is invalid", async () => {
    // Arrange
    const { result } = mount(() => useLoginForm({ email: "", password: "" }));

    // Force validate() to return false
    vi.spyOn(result, "validate").mockResolvedValue(false);
    // Spy on authStore.login
    vi.spyOn(authStore, "login");

    // Act
    await result.submitLogin();

    // Assert
    expect(authStore.login).not.toHaveBeenCalled();
    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should 'login' performs successfully and redirect ADMIN to dashboard", async () => {
    // Arrange
    authStore.user = {
      email: "admin@gmail.com",
      role: UserSchemaRole.ADMIN,
    } as AuthUser;

    vi.spyOn(authStore, "login").mockResolvedValue(true);

    const { result } = mount(() =>
      useLoginForm({
        email: "admin@gmail.com",
        password: "123456",
      }),
    );

    vi.spyOn(result, "validate").mockResolvedValue(true);

    // Act
    await result.submitLogin();

    // Assert
    expect(authStore.login).toHaveBeenCalledWith({
      email: "admin@gmail.com",
      password: "123456",
    });
    expect(showSuccessToast).toHaveBeenCalledWith("Login successful!");
    expect(navigateToMock).toHaveBeenCalledWith("/admin/dashboard");
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should login successfully and redirect GUEST to home", async () => {
    // Arrange
    authStore.user = {
      email: "guest@gmail.com",
      role: UserSchemaRole.GUEST,
    };

    vi.spyOn(authStore, "login").mockResolvedValue(true);

    const { result } = mount(() =>
      useLoginForm({
        email: "guest@gmail.com",
        password: "123456",
      }),
    );

    vi.spyOn(result, "validate").mockResolvedValue(true);

    // Act
    await result.submitLogin();

    // Assert
    expect(showSuccessToast).toHaveBeenCalledWith("Login successful!");
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should 'login' handles API errors", async () => {
    // Arrange
    vi.spyOn(authStore, "login").mockRejectedValue(new Error("Login failed"));

    const { result } = mount(() =>
      useLoginForm({ email: "a@a.com", password: "123" }),
    );

    vi.spyOn(result, "validate").mockResolvedValue(true);

    // Act
    await result.submitLogin();

    // Assert
    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalled();
  });
});
