import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../test/setup";
import FormError from "../../../app/components/FormError.vue";

describe("FormError.vue", () => {
  describe("Rendering", () => {
    it("should render wrapper div", () => {
      const { container } = renderWithNuxt(FormError, {
        props: { errors: [] },
      });
      const wrapper = container.querySelector("div");
      expect(wrapper).toBeTruthy();
    });

    it("should render slot content", () => {
      const { container } = renderWithNuxt(FormError, {
        props: { errors: [] },
        slots: {
          default: "<input type='text' />",
        },
      });
      const input = container.querySelector("input");
      expect(input).toBeTruthy();
    });
  });

  describe("Error display", () => {
    it("should not render errors when errors array is empty", () => {
      const { container } = renderWithNuxt(FormError, {
        props: { errors: [] },
      });
      const errorMessages = container.querySelectorAll(".text-secondary-500");
      expect(errorMessages.length).toBe(0);
    });

    it("should render single error message", () => {
      const errors = [
        {
          $uid: 1,
          $message: "Field is required",
        },
      ];
      const { container } = renderWithNuxt(FormError, {
        props: { errors: errors as unknown },
      });
      const errorMessage = container.querySelector(".text-secondary-500");
      expect(errorMessage?.textContent).toContain("Field is required");
    });

    it("should render multiple error messages", () => {
      const errors = [
        { $uid: 1, $message: "Email is invalid" },
        { $uid: 2, $message: "Email is already registered" },
      ];

      const { container } = renderWithNuxt(FormError, {
        props: { errors: errors as unknown },
      });
      const errorMessages = container.querySelectorAll(".text-secondary-500");
      expect(errorMessages.length).toBe(errors.length);

      errors.forEach((error, index) => {
        expect(errorMessages[index]?.textContent).toContain(error.$message);
      });
    });
  });

  describe("Error icon", () => {
    it("should render error icon for each error", () => {
      const errors = [
        { $uid: 1, $message: "Error 1" },
        { $uid: 2, $message: "Error 2" },
      ];
      const { container } = renderWithNuxt(FormError, {
        props: { errors: errors as unknown },
      });
      const icons = container.querySelectorAll(
        ".i-material-symbols\\:error-outline",
      );
      expect(icons.length).toBe(errors.length);
    });

    it("should not render error icon when errors array is empty", () => {
      const { container } = renderWithNuxt(FormError, {
        props: { errors: [] },
      });
      const icons = container.querySelectorAll(
        ".i-material-symbols\\:error-outline",
      );
      expect(icons.length).toBe(0);
    });
  });
});
