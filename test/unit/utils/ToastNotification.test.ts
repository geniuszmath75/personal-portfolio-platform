import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../app/utils/toastNotification";
import { useToast } from "vue-toast-notification";

vi.mock("vue-toast-notification", () => {
  return {
    useToast: vi.fn(),
  };
});

describe("toastNotification util", () => {
  const mockError = vi.fn();
  const mockSuccess = vi.fn();
  const mockWarning = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as Mock).mockReturnValue({
      error: mockError,
      success: mockSuccess,
      warning: mockWarning,
    });
  });

  const expectedOptions = {
    position: "top",
    duration: 5000,
    dismissible: true,
  };

  it("should call $toast.error() with message and correct options", () => {
    showErrorToast("Test error");

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith("Test error", expectedOptions);
  });

  it("should call $toast.success() with message and correct options", () => {
    showSuccessToast("The operation was completed successfully");

    expect(mockSuccess).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith(
      "The operation was completed successfully",
      expectedOptions,
    );
  });

  it("should call $toast.warning() with message and correct options", () => {
    showWarningToast("Test warning");

    expect(mockWarning).toHaveBeenCalledTimes(1);
    expect(mockWarning).toHaveBeenCalledWith("Test warning", expectedOptions);
  });
});
