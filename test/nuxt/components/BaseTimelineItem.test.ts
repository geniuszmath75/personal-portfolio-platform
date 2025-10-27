import { describe, expect, it } from "vitest";
import { renderWithNuxt } from "../../setup";
import BaseTimelineItem from "../../../app/components/BaseTimelineItem.vue";

describe("BaseTimelineItem", () => {
  const testDefaultConfig = {
    provide: {
      BaseTimelineConfig: {
        horizontal: false,
        itemPlacement: "left",
        size: "medium",
      },
    },
  };

  it("should render title, time and content when provided", () => {
    // Arrange: render with basic props
    const { getByText } = renderWithNuxt(BaseTimelineItem, {
      ...testDefaultConfig,
      props: {
        title: "Timeline title",
        time: "2025-09-01",
        content: "This is a timeline event",
      },
    });

    // Assert: all pieces of content are visible
    expect(getByText("Timeline title")).toBeInTheDocument();
    expect(getByText("2025-09-01")).toBeInTheDocument();
    expect(getByText("This is a timeline event")).toBeInTheDocument();
  });

  it.each([
    { type: "default", expected: "border-secondary-500 bg-secondary-300" },
    { type: "success", expected: "border-success-500 bg-success-300" },
    { type: "info", expected: "border-info-500 bg-info-300" },
    { type: "warning", expected: "border-warning-500 bg-warning-300" },
    { type: "error", expected: "border-error-500 bg-error-300" },
  ])(
    "should apply correct dot type classes for type=$type",
    ({ type, expected }) => {
      // Arrange
      const { container } = renderWithNuxt(BaseTimelineItem, {
        ...testDefaultConfig,
        props: { type },
      });

      // Act: find dot element
      const dot = container.querySelector(".rounded-full");

      // Assert
      expect(dot?.className).toContain(expected);
    },
  );

  it.each([
    { size: "large", expected: "w-10 h-10" },
    { size: "medium", expected: "w-8 h-8" },
  ])(
    "should apply correct dot size classes for size=$size",
    async ({ size, expected }) => {
      // Arrange
      const { container } = renderWithNuxt(BaseTimelineItem, {
        global: {
          provide: {
            BaseTimelineConfig: {
              horizontal: false,
              itemPlacement: "left",
              size,
            },
          },
        },
      });

      // Act
      const dot = container.querySelector(".rounded-full");

      // Assert
      expect(dot?.className).toContain(expected);
    },
  );

  it.each([
    { horizontal: true, expected: "text-center" },
    { horizontal: false, expected: "text-left" },
  ])(
    "should apply correct content alignment for horizontal=$horizontal",
    ({ horizontal, expected }) => {
      // Arrange
      const { container } = renderWithNuxt(BaseTimelineItem, {
        global: {
          provide: {
            BaseTimelineConfig: {
              horizontal,
              itemPlacement: "left",
              size: "medium",
            },
          },
        },
      });

      // Act
      const content = container.querySelector(".relative")?.lastElementChild;

      // Assert
      expect(content?.className).toContain(expected);
    },
  );

  it.each([
    {
      desc: "medium vertical timeline",
      config: { horizontal: false, size: "medium" },
      expected:
        "after:h-[180%] after:w-0.5 after:top-full after:left-1/2 after:-translate-x-1/2 after:bg-secondary-500",
    },
    {
      desc: "large vertical timeline",
      config: { horizontal: false, size: "large" },
      expected:
        "after:h-[210%] after:w-0.5 after:top-full after:left-1/2 after:-translate-x-1/2 after:bg-secondary-500",
    },
    {
      desc: "medium horizontal timeline",
      config: { horizontal: true, size: "medium" },
      expected:
        "after:w-[310%] after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:bg-secondary-500",
    },
    {
      desc: "large horizontal timeline",
      config: { horizontal: true, size: "large" },
      expected:
        "after:w-[380%] after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:bg-secondary-500",
    },
  ])(
    "should apply correct line connector classes for $desc",
    ({ config, expected }) => {
      // Arrange
      const { container } = renderWithNuxt(BaseTimelineItem, {
        global: { provide: { BaseTimelineConfig: config } },
        props: { isLast: false },
      });

      // Act
      const dot = container.querySelector(".rounded-full");

      // Assert
      expect(dot?.className).toContain(expected);
    },
  );

  it("should not render line connector when isLast=true", () => {
    // Arrange
    const { container } = renderWithNuxt(BaseTimelineItem, {
      ...testDefaultConfig,
      props: { isLast: true },
    });

    // Act
    const dot = container.querySelector(".rounded-full");

    // Assert
    expect(dot?.className).not.toMatch(/after:w-/);
    expect(dot?.className).not.toMatch(/after:h-/);
  });

  it.each([
    {
      config: { horizontal: true, itemPlacement: "left" },
      expected: "flex-col",
    },
    {
      config: { horizontal: false, itemPlacement: "right" },
      expected: "flex-row-reverse",
    },
    {
      config: { horizontal: false, itemPlacement: "left" },
      expected: "flex-row",
    },
  ])(
    "should apply correct placement classes for config=$expected",
    ({ config, expected }) => {
      // Arrange
      const { container } = renderWithNuxt(BaseTimelineItem, {
        global: { provide: { BaseTimelineConfig: config } },
      });

      // Act
      const root = container.firstElementChild;

      // Assert
      expect(root?.className).toContain(expected);
    },
  );
});
