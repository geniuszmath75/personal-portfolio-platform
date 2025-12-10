import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../test/setup";
import BaseInput from "../../../app/components/BaseInput.vue";

describe("BaseInput.vue", () => {
  describe("Rendering", () => {
    it("should render input element", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: {
          id: "test-input",
          name: "test-name",
        },
      });
      const input = container.querySelector("input");
      expect(input).toBeTruthy();
    });

    it("should have correct default type", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: {
          id: "test-input",
          name: "test-name",
        },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.type).toBe("text");
    });
  });

  describe("Props", () => {
    it.each([
      { id: "test-id" },
      { id: "email-input" },
      { id: "password-field" },
    ])("should set id prop correctly", ({ id }) => {
      const { container } = renderWithNuxt(BaseInput, {
        props: { id, name: "test-name" },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.id).toBe(id);
    });

    it.each([
      { type: "email" },
      { type: "password" },
      { type: "number" },
      { type: "tel" },
    ])("should set type prop correctly", ({ type }) => {
      const { container } = renderWithNuxt(BaseInput, {
        props: { id: "test-id", name: "test-name", type },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.type).toBe(type);
    });

    it.each([{ name: "email" }, { name: "password" }, { name: "username" }])(
      "should set name prop correctly",
      ({ name }) => {
        const { container } = renderWithNuxt(BaseInput, {
          props: { name, id: "test-id" },
        });
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.name).toBe(name);
      },
    );

    it.each([
      { placeholder: "Enter email" },
      { placeholder: "Enter password" },
      { placeholder: "Username" },
    ])("should set placeholder prop correctly", ({ placeholder }) => {
      const { container } = renderWithNuxt(BaseInput, {
        props: { placeholder, id: "test-id", name: "test-name" },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.placeholder).toBe(placeholder);
    });
  });

  describe("v-model", () => {
    it("should emit update:inputValue on input event", async () => {
      const { container, emitted } = renderWithNuxt(BaseInput, {
        props: { id: "test-id", name: "test-name" },
      });
      const input = container.querySelector("input") as HTMLInputElement;

      input.value = "test value";
      input.dispatchEvent(new Event("input"));

      expect(emitted("update:modelValue")).toBeTruthy();
      expect(emitted("update:modelValue")[0]).toEqual(["test value"]);
    });

    it("should have empty string as default value", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: {
          id: "test-id",
          name: "test-name",
        },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("Disabled state", () => {
    it.each([{ isDisabled: true }, { isDisabled: false }])(
      "should set disabled attribute correctly",
      ({ isDisabled }) => {
        const { container } = renderWithNuxt(BaseInput, {
          props: { isDisabled, id: "test-id", name: "test-name" },
        });
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.disabled).toBe(isDisabled);
      },
    );

    it("should apply disabled classes when isDisabled is true", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: { isDisabled: true, id: "test-id", name: "test-name" },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.className).toContain("disabled:opacity-50");
      expect(input.className).toContain("disabled:cursor-not-allowed");
    });
  });

  describe("Validation classes", () => {
    it.each([
      {
        isValid: true,
        expectedClasses: ["border-secondary-700", "focus:border-secondary-300"],
      },
      {
        isValid: false,
        expectedClasses: [
          "border-additional-500",
          "focus:border-additional-500",
        ],
      },
    ])(
      "should apply correct validation classes when isValid is $isValid",
      ({ isValid, expectedClasses }) => {
        const { container } = renderWithNuxt(BaseInput, {
          props: { isValid, id: "test-id", name: "test-name" },
        });
        const input = container.querySelector("input") as HTMLInputElement;
        const className = input.className;

        expectedClasses.forEach((cls) => {
          expect(className).toContain(cls);
        });
      },
    );
  });

  describe("Base styling", () => {
    it("should have base styling classes", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: { id: "test-id", name: "test-name" },
      });
      const input = container.querySelector("input") as HTMLInputElement;
      const requiredClasses = [
        "w-full",
        "px-4",
        "py-3",
        "bg-primary-600",
        "border-2",
        "rounded-lg",
        "text-secondary-500",
        "placeholder-secondary-700",
        "focus:outline-none",
        "transition-all",
      ];

      requiredClasses.forEach((cls) => {
        expect(input.className).toContain(cls);
      });
    });
  });

  describe("Integration", () => {
    it("should work with multiple props combined", () => {
      const { container } = renderWithNuxt(BaseInput, {
        props: {
          id: "test-input",
          type: "email",
          name: "user-email",
          placeholder: "Enter your email",
          isDisabled: false,
          isValid: true,
        },
      });
      const input = container.querySelector("input") as HTMLInputElement;

      expect(input.id).toBe("test-input");
      expect(input.type).toBe("email");
      expect(input.name).toBe("user-email");
      expect(input.placeholder).toBe("Enter your email");
      expect(input.disabled).toBe(false);
      expect(input.className).toContain("border-secondary-700");
    });
  });
});
