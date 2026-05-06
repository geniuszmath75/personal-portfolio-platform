import { describe, it, expect } from "vitest";
import { renderWithNuxt } from "~~/test/setup";
import BaseOption from "~/components/BaseOption.vue";

describe("BaseOption.vue", () => {
  it("should render option element with correct value and label attributes", () => {
    const { container } = renderWithNuxt(BaseOption, {
      props: {
        value: "test-value",
        label: "Test Label",
      },
    });

    const option = container.querySelector("option") as HTMLOptionElement;
    expect(option).toBeTruthy();
    expect(option.value).toBe("test-value");
    expect(option.textContent).toBe("Test Label");
  });

  it("should display label as option text content", () => {
    const { container } = renderWithNuxt(BaseOption, {
      props: {
        value: "option-1",
        label: "Option One",
      },
    });
    const option = container.querySelector("option") as HTMLOptionElement;
    expect(option.textContent?.trim()).toBe("Option One");
  });
});
