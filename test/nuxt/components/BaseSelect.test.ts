import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "~~/test/setup";
import BaseSelect from "~/components/BaseSelect.vue";

describe("BaseSelect.vue", () => {
  describe("Rendering", () => {
    it("should render select element", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: {
          id: "test-select",
        },
      });
      const select = container.querySelector("select");
      expect(select).toBeTruthy();
    });
  });

  describe("Props", () => {
    it.each([
      { id: "test-id" },
      { id: "country-select" },
      { id: "category-field" },
    ])("should set id prop correctly", ({ id }) => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: { id },
      });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.id).toBe(id);
    });

    it.each([{ name: "category" }, { name: "country" }, { name: "status" }])(
      "should set name prop correctly",
      ({ name }) => {
        const { container } = renderWithNuxt(BaseSelect, {
          props: { id: "test-id", name },
        });
        const select = container.querySelector("select") as HTMLSelectElement;
        expect(select.name).toBe(name);
      },
    );
  });

  describe("v-model", () => {
    it("should emit update:modelValue on change event", async () => {
      const { container, emitted } = renderWithNuxt(BaseSelect, {
        props: { id: "test-id" },
        slots: {
          default: `
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          `,
        },
      });
      const select = container.querySelector("select") as HTMLSelectElement;

      select.value = "option2";
      select.dispatchEvent(new Event("change"));

      expect(emitted("update:modelValue")).toBeTruthy();
      expect(emitted("update:modelValue")[0]).toEqual(["option2"]);
    });

    it("should have empty string as default value", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: {
          id: "test-id",
        },
      });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("");
    });
  });

  describe("Disabled state", () => {
    it.each([{ isDisabled: true }, { isDisabled: false }])(
      "should set disabled attribute correctly",
      ({ isDisabled }) => {
        const { container } = renderWithNuxt(BaseSelect, {
          props: { isDisabled, id: "test-id" },
        });
        const select = container.querySelector("select") as HTMLSelectElement;
        expect(select.disabled).toBe(isDisabled);
      },
    );

    it("should apply disabled classes when isDisabled is true", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: { isDisabled: true, id: "test-id" },
      });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.className).toContain("disabled:opacity-50");
      expect(select.className).toContain("disabled:cursor-not-allowed");
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
        const { container } = renderWithNuxt(BaseSelect, {
          props: { isValid, id: "test-id" },
        });
        const select = container.querySelector("select") as HTMLSelectElement;
        const className = select.className;

        expectedClasses.forEach((cls) => {
          expect(className).toContain(cls);
        });
      },
    );
  });

  describe("Base styling", () => {
    it("should have base styling classes", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: { id: "test-id" },
      });
      const select = container.querySelector("select") as HTMLSelectElement;
      const requiredClasses = [
        "w-full",
        "px-4",
        "py-3",
        "bg-primary-600",
        "border-2",
        "rounded-lg",
        "text-secondary-500",
        "focus:outline-none",
        "transition-all",
      ];

      requiredClasses.forEach((cls) => {
        expect(select.className).toContain(cls);
      });
    });
  });

  describe("Slot", () => {
    it("should render slot content", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: { id: "test-id" },
        slots: {
          default: `
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          `,
        },
      });
      const options = container.querySelectorAll("option");
      expect(options.length).toBe(2);
      expect(options[0]?.textContent).toBe("Option 1");
      expect(options[1]?.textContent).toBe("Option 2");
    });
  });

  describe("Integration", () => {
    it("should work with multiple props combined", () => {
      const { container } = renderWithNuxt(BaseSelect, {
        props: {
          id: "test-select",
          name: "category",
          isDisabled: false,
          isValid: true,
        },
        slots: {
          default: `
            <option value="cat1">Category 1</option>
            <option value="cat2">Category 2</option>
          `,
        },
      });
      const select = container.querySelector("select") as HTMLSelectElement;

      expect(select.id).toBe("test-select");
      expect(select.name).toBe("category");
      expect(select.disabled).toBe(false);
      expect(select.className).toContain("border-secondary-700");
      expect(select.querySelectorAll("option").length).toBe(2);
    });
  });
});
