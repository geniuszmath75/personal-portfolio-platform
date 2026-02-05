import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "../../../test/setup";
import BaseBtn from "../../../app/components/BaseBtn.vue";

describe("BaseBtn.vue", () => {
  describe("Rendering", () => {
    it("should render button element", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Click me" },
      });
      const button = container.querySelector("button");
      expect(button).toBeTruthy();
    });

    it("should display label text", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Submit Form" },
      });
      const button = container.querySelector("button");
      expect(button?.textContent).toContain("Submit Form");
    });
  });

  describe("Props - Type", () => {
    it.each([{ type: "submit" }, { type: "button" }, { type: "reset" }])(
      "should set type prop correctly",
      ({ type }) => {
        const { container } = renderWithNuxt(BaseBtn, {
          props: { label: "Test", type: type as "submit" | "button" | "reset" },
        });
        const button = container.querySelector("button") as HTMLButtonElement;
        expect(button.type).toBe(type);
      },
    );

    it("should default to submit type", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.type).toBe("submit");
    });
  });

  describe("Props - Label", () => {
    it.each([
      { label: "Save" },
      { label: "Delete" },
      { label: "Cancel" },
      { label: "Send Email" },
    ])("should render correct label", ({ label }) => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label },
      });
      const button = container.querySelector("button");
      expect(button?.textContent).toContain(label);
    });
  });

  describe("Disabled state", () => {
    it.each([{ isDisabled: true }, { isDisabled: false }])(
      "should set disabled attribute correctly",
      ({ isDisabled }) => {
        const { container } = renderWithNuxt(BaseBtn, {
          props: { label: "Test", isDisabled },
        });
        const button = container.querySelector("button") as HTMLButtonElement;
        expect(button.disabled).toBe(isDisabled);
      },
    );

    it("should apply disabled classes when isDisabled is true", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test", isDisabled: true },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.className).toContain("disabled:opacity-50");
      expect(button.className).toContain("disabled:cursor-not-allowed");
    });

    it("should show loading icon when disabled", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test", isDisabled: true },
      });
      const icon = container.querySelector(".i-mdi\\:loading");
      expect(icon).toBeTruthy();
    });

    it("should hide loading icon when not disabled", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test", isDisabled: false },
      });
      const icon = container.querySelector(".i-mdi\\:loading");
      expect(icon?.className).toContain("absolute");
    });
  });

  describe("Button Styles", () => {
    it.each([
      {
        btnStyle: "additional",
        expectedClasses: [
          "bg-additional-500",
          "text-primary-500",
          "hover:bg-additional-600",
        ],
      },
      {
        btnStyle: "secondary",
        expectedClasses: [
          "bg-secondary-500",
          "text-primary-500",
          "hover:bg-secondary-600",
        ],
      },
      {
        btnStyle: "tab--active",
        expectedClasses: ["text-additional-500", "border-additional-500"],
      },
      {
        btnStyle: "tab--inactive",
        expectedClasses: ["text-secondary-500", "border-secondary-500"],
      },
      {
        btnStyle: "login--logout",
        expectedClasses: [
          "bg-additional-500",
          "text-primary-500",
          "hover:bg-additional-600",
          "rounded-3xl",
          "shadow-primary",
        ],
      },
      {
        btnStyle: "mobile--login--logout",
        expectedClasses: [
          "bg-additional-500",
          "text-primary-500",
          "hover:bg-additional-600",
        ],
      },
      {
        btnStyle: "mobile--secondary",
        expectedClasses: [
          "bg-secondary-500",
          "text-primary-500",
          "hover:bg-secondary-600",
          "disabled:hover:bg-secondary-500",
        ],
      },
    ])(
      "should apply correct style classes for btnStyle: $btnStyle",
      ({ btnStyle, expectedClasses }) => {
        const { container } = renderWithNuxt(BaseBtn, {
          props: { label: "Test", btnStyle: btnStyle as unknown },
        });
        const button = container.querySelector("button") as HTMLButtonElement;
        const className = button.className;

        expectedClasses.forEach((cls) => {
          expect(className).toContain(cls);
        });
      },
    );

    it("should default to additional button style", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.className).toContain("bg-additional-500");
    });
  });

  describe("Button Sizes", () => {
    it.each([
      {
        btnSize: "default",
        expectedClasses: ["w-full", "py-3", "px-4", "font-bold", "text-md"],
      },
      {
        btnSize: "tab",
        expectedClasses: [
          "flex-1",
          "pb-3",
          "text-md",
          "font-medium",
          "border-b-2",
        ],
      },
      {
        btnSize: "large",
        expectedClasses: ["w-48", "h-12", "font-semibold"],
      },
      {
        btnSize: "mobile--menu",
        expectedClasses: ["w-full", "h-16", "font-semibold", "text-lg"],
      },
    ])(
      "should apply correct size classes for btnSize: $btnSize",
      ({ btnSize, expectedClasses }) => {
        const { container } = renderWithNuxt(BaseBtn, {
          props: { label: "Test", btnSize: btnSize as unknown },
        });
        const button = container.querySelector("button") as HTMLButtonElement;
        const className = button.className;

        expectedClasses.forEach((cls) => {
          expect(className).toContain(cls);
        });
      },
    );

    it("should default to default button size", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.className).toContain("w-full");
      expect(button.className).toContain("py-3");
    });
  });

  describe("Icon slot", () => {
    it("should render icon slot content", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
        slots: {
          icon: "<Icon name='mdi:check' />",
        },
      });

      const icon = container.querySelector("[data-icon='mdi:check']");
      expect(icon).toBeTruthy();
    });

    it("should render button without icon slot", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
      });
      const button = container.querySelector("button");
      expect(button?.textContent).toContain("Test");
    });
  });

  describe("Base styling", () => {
    it("should have base styling classes", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      const requiredClasses = [
        "relative",
        "flex",
        "justify-center",
        "items-center",
        "transition-colors",
        "focus:outline-none",
      ];

      requiredClasses.forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });
  });

  describe("Focus and interaction", () => {
    it("should have focus ring styling for secondary style", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test", btnStyle: "secondary" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.className).toContain("focus:ring-2");
      expect(button.className).toContain("focus:ring-offset-2");
    });

    it("should have focus ring styling for additional style", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: { label: "Test", btnStyle: "additional" },
      });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.className).toContain("focus:ring-2");
      expect(button.className).toContain("focus:ring-offset-2");
    });
  });

  describe("Integration", () => {
    it("should work with multiple props combined", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: {
          label: "Delete Item",
          type: "button",
          btnStyle: "secondary",
          btnSize: "default",
          isDisabled: false,
        },
      });
      const button = container.querySelector("button") as HTMLButtonElement;

      expect(button.textContent).toContain("Delete Item");
      expect(button.type).toBe("button");
      expect(button.disabled).toBe(false);
      expect(button.className).toContain("bg-secondary-500");
      expect(button.className).toContain("w-full");
    });

    it("should combine tab style with tab size", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: {
          label: "Active Tab",
          btnStyle: "tab--active",
          btnSize: "tab",
        },
      });
      const button = container.querySelector("button") as HTMLButtonElement;

      expect(button.className).toContain("text-additional-500");
      expect(button.className).toContain("flex-1");
      expect(button.className).toContain("border-b-2");
    });

    it("should handle disabled state with different styles", () => {
      const { container } = renderWithNuxt(BaseBtn, {
        props: {
          label: "Loading...",
          btnStyle: "secondary",
          isDisabled: true,
        },
      });
      const button = container.querySelector("button") as HTMLButtonElement;

      expect(button.disabled).toBe(true);
      expect(button.className).toContain("bg-secondary-500");
      expect(button.className).toContain("disabled:opacity-50");
    });
  });
});
