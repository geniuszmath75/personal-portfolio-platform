import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "../../../app/composables/useClipboard";
import { mount } from "vue-composable-tester";
import * as toastNotification from "../../../app/utils/toastNotification";

// Mock global toasts
const showWarningToastMock = vi.spyOn(toastNotification, "showWarningToast");

const showSuccessToastMock = vi.spyOn(toastNotification, "showSuccessToast");

const showErrorToastMock = vi.spyOn(toastNotification, "showErrorToast");

const writeTextMock = vi
  .spyOn(navigator.clipboard, "writeText")
  .mockResolvedValue();

describe("useClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set isClipboardAvailable = true on mount when clipboard API exists", () => {
    // Act: mount composable
    const { result } = mount(() => useClipboard());

    // Assert: flag should be true
    expect(result.isClipboardAvailable.value).toBe(true);
    expect(writeTextMock).toBeDefined();
  });

  it("should copy text when string target is provided", async () => {
    // Arrange: create instance
    const { result } = mount(() => useClipboard());

    // Act: call with string
    const success = await result.copyToClipboard("Hello World");

    // Assert: clipboard written and success toast called
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("Hello World");
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      `Copied to clipboard: Hello World`,
    );
  });

  it("should copy text when HTMLElement target is provided", async () => {
    // Arrange: create mock element
    const el = document.createElement("div");
    el.textContent = "Copied text";

    const { result } = mount(() => useClipboard());

    // Act: call with element
    const success = await result.copyToClipboard(el);

    // Assert: clipboard written with trimmed text
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("Copied text");
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      `Copied to clipboard: ${el.textContent}`,
    );
  });

  it("should copy text when Vue component target (with $el) is provided", async () => {
    // Arrange: simulate component with $el
    const mockComponent = { $el: document.createElement("div") };
    mockComponent.$el.textContent = "From Component";

    const { result } = mount(() => useClipboard());

    // Act: copy from component
    const success = await result.copyToClipboard(mockComponent);

    // Assert: text copied correctly
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("From Component");
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      `Copied to clipboard: ${mockComponent.$el.textContent}`,
    );
  });

  it("should show warning and returns false when text is empty", async () => {
    // Arrange: create empty element
    const el = document.createElement("div");
    el.textContent = "   ";

    const { result } = mount(() => useClipboard());

    // Act: try copying empty text
    const success = await result.copyToClipboard(el);

    // Assert: no copy attempted and warning toast shown
    expect(success).toBe(false);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(showWarningToastMock).toHaveBeenCalledWith("Nothing to copy");
  });

  it("should handle and report clipboard errors", async () => {
    // Arrange: simulate writeText failure
    writeTextMock.mockRejectedValueOnce(new Error("Permission denied"));

    const { copyToClipboard } = useClipboard();

    // Act: call with string target
    const success = await copyToClipboard("Failing case");

    // Assert: handled gracefully and error toast shown
    expect(success).toBe(false);
    expect(showErrorToastMock).toHaveBeenCalledWith(
      expect.stringContaining("Failed to copy"),
    );
  });

  it("should return false and warn when target is null", async () => {
    // Arrange: composable
    const { copyToClipboard } = useClipboard();

    // Act: call with null
    const success = await copyToClipboard(null);

    // Assert: no copy attempted and warning toast shown
    expect(success).toBe(false);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(showWarningToastMock).toHaveBeenCalledWith("Nothing to copy");
  });
});
