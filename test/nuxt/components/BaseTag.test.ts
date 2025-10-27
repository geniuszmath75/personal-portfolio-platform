import { describe, expect, it } from "vitest";
import { renderWithNuxt } from "../../setup";
import BaseTag from "../../../app/components/BaseTag.vue";

describe("BaseTag", () => {
  it("should render with correct default classes", () => {
    // Arrange: render BaseTag with default props
    const { getByText, container } = renderWithNuxt(BaseTag, {
      slots: {
        default: "Default Tag",
      },
    });

    // Act: find rendered root element
    const tagElement = container.querySelector("div");

    // Assert: verify component exists and contains proper base classes
    expect(tagElement).toBeTruthy();

    // Assert: check that default computed classes are applied correctly
    expect(tagElement?.className).toContain(
      "flex items-center justify-center gap-2",
    );
    expect(tagElement?.className).toContain("h-10 px-3 py-1 text-sm"); // size
    expect(tagElement?.className).toContain(
      "border border-additional-500 border-solid",
    ); // border
    expect(tagElement?.className).toContain("rounded-2xl"); // rounded
    expect(tagElement?.className).toContain(
      "bg-secondary-500 text-primary-500",
    ); // type

    // Assert: slot content rendered correctly
    expect(getByText("Default Tag")).toBeTruthy();
  });
});
