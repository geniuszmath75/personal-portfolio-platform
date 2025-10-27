import { describe, expect, it } from "vitest";
import { renderWithNuxt } from "../../setup";
import BaseTimeline from "../../../app/components/BaseTimeline.vue";

describe("BaseTimeline", () => {
  it("should render with default props", () => {
    // Arrange & Act
    const { container } = renderWithNuxt(BaseTimeline, {
      slots: { default: "<div>Timeline content</div>" },
    });

    const rootDiv = container.firstElementChild;

    // Assert: vertical and medium size
    expect(rootDiv?.classList.contains("flex-col")).toBe(true);
    expect(rootDiv?.classList.contains("text-md")).toBe(true);
    expect(rootDiv?.classList.contains("gap-8")).toBe(true);
  });

  it.each([
    { size: "large", expectedClass: "text-lg gap-16" },
    { size: "medium", expectedClass: "text-md gap-8" },
  ])(
    "should apply correct size classes for size=$size",
    ({ size, expectedClass }) => {
      // Arrange & Act
      const { container } = renderWithNuxt(BaseTimeline, {
        props: { size },
        slots: { default: "<div>Timeline content</div>" },
      });

      const rootDiv = container.firstElementChild;

      // Assert
      expect(rootDiv?.className).toContain(expectedClass);
    },
  );

  it("should apply horizontal direction when horizontal=true", () => {
    // Arrange & Act
    const { container } = renderWithNuxt(BaseTimeline, {
      props: { horizontal: true },
      slots: { default: "<div>Timeline content</div>" },
    });

    const rootDiv = container.firstElementChild;

    // Assert
    expect(rootDiv?.classList.contains("flex-row")).toBe(true);
  });
});
