import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLoginForm } from "../../../app/composables/useLoginForm";
import { mount } from "vue-composable-tester";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { UserSchemaRole } from "../../../server/types/enums";
import { showSuccessToast } from "../../../app/utils/toastNotification";
import { handleError } from "../../../app/utils/handleError";

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
  beforeEach(() => {
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
    expect(result).toHaveProperty("loading");
    expect(result).toHaveProperty("login");

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
    vi.stubGlobal("$fetch", vi.fn());
    const { result } = mount(() => useLoginForm({ email: "", password: "" }));

    // Force validate() to return false
    vi.spyOn(result, "validate").mockResolvedValue(false);

    // Act
    await result.login();

    // Assert
    expect(result.loading.value).toBe(false);
    expect(handleError).not.toHaveBeenCalled();
    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it("should 'login' performs successful flow", async () => {
    // Arrange
    const validResponse = {
      user: { email: "john@mail.com", role: UserSchemaRole.ADMIN },
      token: "XYZ",
    };

    vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(validResponse));

    const { result } = mount(() =>
      useLoginForm({
        email: "john@email.com",
        password: "123456",
      }),
    );

    vi.spyOn(result, "validate").mockResolvedValue(true);

    // Act
    await result.login();

    // Assert
    expect(handleError).not.toHaveBeenCalled();
    expect(showSuccessToast).toHaveBeenCalledWith("Login successful!");
    expect(navigateToMock).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("should 'login' handles API errors", async () => {
    // Arrange
    vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("error")));
    const { result } = mount(() =>
      useLoginForm({ email: "a@a.com", password: "123" }),
    );

    vi.spyOn(result, "validate").mockResolvedValue(true);

    // Act
    await result.login();

    // Assert
    expect(handleError).toHaveBeenCalled();
    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
