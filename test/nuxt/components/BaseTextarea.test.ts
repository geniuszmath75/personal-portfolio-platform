import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "~~/test/setup";
import BaseTextarea from "~/components/BaseTextarea.vue";

describe("BaseTextarea.vue", () => {
  describe("Rendering", () => {
    it("should render textarea element", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: {
          id: "test-textarea",
        },
      });
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeTruthy();
    });

    it("should have correct default rows", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: {
          id: "test-textarea",
        },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.rows).toBe("6");
    });
  });

  describe("Props", () => {
    it.each([
      { id: "test-id" },
      { id: "description-textarea" },
      { id: "comments-field" },
    ])("should set id prop correctly", ({ id }) => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: { id },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.id).toBe(id);
    });

    it.each([{ name: "description" }, { name: "comments" }, { name: "bio" }])(
      "should set name prop correctly",
      ({ name }) => {
        const { container } = renderWithNuxt(BaseTextarea, {
          props: { id: "test-id", name },
        });
        const textarea = container.querySelector(
          "textarea",
        ) as HTMLTextAreaElement;
        expect(textarea.name).toBe(name);
      },
    );

    it.each([
      { placeholder: "Enter description" },
      { placeholder: "Write your comments" },
      { placeholder: "Bio" },
    ])("should set placeholder prop correctly", ({ placeholder }) => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: { id: "test-id", placeholder },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe(placeholder);
    });

    it.each([{ rows: 4 }, { rows: 8 }, { rows: 10 }])(
      "should set rows prop correctly",
      ({ rows }) => {
        const { container } = renderWithNuxt(BaseTextarea, {
          props: { id: "test-id", rows },
        });
        const textarea = container.querySelector(
          "textarea",
        ) as HTMLTextAreaElement;
        expect(textarea.rows).toBe(rows.toString());
      },
    );
  });

  describe("v-model", () => {
    it("should emit update:modelValue on input event", async () => {
      const { container, emitted } = renderWithNuxt(BaseTextarea, {
        props: { id: "test-id" },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;

      textarea.value = "test value";
      textarea.dispatchEvent(new Event("input"));

      expect(emitted("update:modelValue")).toBeTruthy();
      expect(emitted("update:modelValue")[0]).toEqual(["test value"]);
    });

    it("should have empty string as default value", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: {
          id: "test-id",
        },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });
  });

  describe("Disabled state", () => {
    it.each([{ isDisabled: true }, { isDisabled: false }])(
      "should set disabled attribute correctly",
      ({ isDisabled }) => {
        const { container } = renderWithNuxt(BaseTextarea, {
          props: { isDisabled, id: "test-id" },
        });
        const textarea = container.querySelector(
          "textarea",
        ) as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(isDisabled);
      },
    );

    it("should apply disabled classes when isDisabled is true", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: { isDisabled: true, id: "test-id" },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.className).toContain("disabled:opacity-50");
      expect(textarea.className).toContain("disabled:cursor-not-allowed");
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
        const { container } = renderWithNuxt(BaseTextarea, {
          props: { isValid, id: "test-id" },
        });
        const textarea = container.querySelector(
          "textarea",
        ) as HTMLTextAreaElement;
        const className = textarea.className;

        expectedClasses.forEach((cls) => {
          expect(className).toContain(cls);
        });
      },
    );
  });

  describe("Base styling", () => {
    it("should have base styling classes", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: { id: "test-id" },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;
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
        "resize-none",
      ];

      requiredClasses.forEach((cls) => {
        expect(textarea.className).toContain(cls);
      });
    });
  });

  describe("Integration", () => {
    it("should work with multiple props combined", () => {
      const { container } = renderWithNuxt(BaseTextarea, {
        props: {
          id: "test-textarea",
          name: "description",
          placeholder: "Enter your description",
          rows: 8,
          isDisabled: false,
          isValid: true,
        },
      });
      const textarea = container.querySelector(
        "textarea",
      ) as HTMLTextAreaElement;

      expect(textarea.id).toBe("test-textarea");
      expect(textarea.name).toBe("description");
      expect(textarea.placeholder).toBe("Enter your description");
      expect(textarea.rows).toBe("8");
      expect(textarea.disabled).toBe(false);
      expect(textarea.className).toContain("border-secondary-700");
    });
  });
});
