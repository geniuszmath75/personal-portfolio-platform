import { describe, it, expect } from "vitest";
import { usePasswordVisibility } from "../../../app/composables/usePasswordVisibility";
import { mount } from "vue-composable-tester";

describe("usePasswordVisibility composable", () => {
  describe("Initial state", () => {
    it("should initialize with password hidden", () => {
      const { result } = mount(() => usePasswordVisibility());
      expect(result.isPasswordVisible.value).toBe(false);
    });
  });

  describe("Toggle visibility", () => {
    it("should toggle visibility from hidden to visible", () => {
      const { result } = mount(() => usePasswordVisibility());
      expect(result.isPasswordVisible.value).toBe(false);

      result.toggleVisibility();

      expect(result.isPasswordVisible.value).toBe(true);
    });

    it("should toggle visibility from visible to hidden", () => {
      const { result } = mount(() => usePasswordVisibility());
      result.toggleVisibility();
      expect(result.isPasswordVisible.value).toBe(true);

      result.toggleVisibility();

      expect(result.isPasswordVisible.value).toBe(false);
    });
  });
});
