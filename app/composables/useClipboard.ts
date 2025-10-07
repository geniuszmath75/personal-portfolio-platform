export function useClipboard() {
  /**
   * Flag indicating if Clipboard API is available
   */
  const isClipboardAvailable = ref(false);

  /**
   * Copies text content or element text to the clipboard.
   * Accepts a string, DOM element, or Vue component with $el.
   *
   * @param target - Source to copy from (string, HTMLElement, or component).
   * @returns true if copied successfully, false otherwise.
   */
  async function copyToClipboard(
    target: HTMLElement | string | { $el: HTMLElement } | null,
  ): Promise<boolean> {
    try {
      let textToCopy = "";

      // Case 1: Direct string provided
      if (typeof target === "string") {
        textToCopy = target;

        // Case 2: DOM element reference
      } else if (target instanceof HTMLElement) {
        textToCopy = target.textContent?.trim() ?? "";

        // Case 3: Vue component (e.g., NuxtLink) — access its root element
      } else if (target?.$el instanceof HTMLElement) {
        textToCopy = target.$el.textContent?.trim() ?? "";
      }

      // Prevent copying empty or invalid text
      if (!textToCopy) {
        showWarningToast("Nothing to copy");
        return false;
      }

      await navigator.clipboard.writeText(textToCopy);

      showSuccessToast(`Copied to clipboard: ${textToCopy}`);
      return true;
    } catch (error) {
      showErrorToast(`Failed to copy: ${error}`);
      return false;
    }
  }

  /**
   * Check clipboard support after component mounts (client-side only).
   */
  onMounted(() => {
    isClipboardAvailable.value =
      typeof window !== "undefined" && !!navigator.clipboard;
  });

  return {
    isClipboardAvailable,
    copyToClipboard,
  };
}
