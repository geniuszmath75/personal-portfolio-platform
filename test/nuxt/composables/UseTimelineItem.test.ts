import { describe, expect, it } from "vitest";
import { useTimelineItem } from "../../../app/composables/useTimelineItem";

describe("useTimelineItem", () => {
  describe("getDotTypeClasses", () => {
    it.each([
      {
        type: "success",
        expectedClasses: "border-success-500 bg-success-300",
      },
      { type: "info", expectedClasses: "border-info-500 bg-info-300" },
      {
        type: "warning",
        expectedClasses: "border-warning-500 bg-warning-300",
      },
      { type: "error", expectedClasses: "border-error-500 bg-error-300" },
      {
        type: "default",
        expectedClasses: "border-secondary-500 bg-secondary-300",
      },
      {
        type: undefined,
        expectedClasses: "border-secondary-500 bg-secondary-300",
      },
    ])(
      "should return correct classes for type: $type",
      ({ type, expectedClasses }) => {
        // Arrange
        const props = { type };
        const config = {};

        // Act
        const { getDotTypeClasses } = useTimelineItem(props, config);

        // Assert
        expect(getDotTypeClasses.value).toBe(expectedClasses);
      },
    );
  });

  describe("getDotSizeClasses", () => {
    it.each([
      { size: "large", expectedClasses: "w-10 h-10" },
      { size: "medium", expectedClasses: "w-8 h-8" },
      { size: undefined, expectedClasses: "w-8 h-8" },
    ])(
      "should return correct classes for size: $size",
      ({ size, expectedClasses }) => {
        // Arrange
        const props = {};
        const config = { size };

        // Act
        const { getDotSizeClasses } = useTimelineItem(props, config);

        // Assert
        expect(getDotSizeClasses.value).toBe(expectedClasses);
      },
    );
  });

  describe("getContentAlignmentClasses", () => {
    it.each([
      { horizontal: true, expectedClasses: "text-center" },
      { horizontal: false, expectedClasses: "text-left" },
      { horizontal: undefined, expectedClasses: "text-left" },
    ])(
      "returns correct alignment when horizontal=$horizontal",
      ({ horizontal, expectedClasses }) => {
        // Arrange
        const props = {};
        const config = { horizontal };

        // Act
        const { getContentAlignmentClasses } = useTimelineItem(props, config);

        // Assert
        expect(getContentAlignmentClasses.value).toBe(expectedClasses);
      },
    );
  });

  describe("getLineConnectorClasses", () => {
    it("should return empty string when isLast is true", () => {
      // Arrange
      const props = { isLast: true };
      const config = { size: "medium", horizontal: false };

      // Act
      const { getLineConnectorClasses } = useTimelineItem(props, config);

      // Assert
      expect(getLineConnectorClasses.value).toBe("");
    });

    it.each([
      {
        size: "large",
        horizontal: true,
        expectedClasses:
          "after:w-[380%] after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:bg-secondary-500",
      },
      {
        size: "large",
        horizontal: false,
        expectedClasses:
          "after:h-[210%] after:w-0.5 after:top-full after:left-1/2 after:-translate-x-1/2 after:bg-secondary-500",
      },
      {
        size: "medium",
        horizontal: true,
        expectedClasses:
          "after:w-[310%] after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:bg-secondary-500",
      },
      {
        size: "medium",
        horizontal: false,
        expectedClasses:
          "after:h-[180%] after:w-0.5 after:top-full after:left-1/2 after:-translate-x-1/2 after:bg-secondary-500",
      },
    ])(
      "should return correct connector classes for size=$size horizontal=$horizontal",
      ({ size, horizontal, expectedClasses }) => {
        // Arrange
        const props = { isLast: false };
        const config = { size, horizontal };

        // Act
        const { getLineConnectorClasses } = useTimelineItem(props, config);

        // Assert
        expect(getLineConnectorClasses.value).toBe(expectedClasses);
      },
    );
  });

  describe("getTimelineItemPlacementClasses", () => {
    it.each([
      {
        horizontal: true,
        itemPlacement: "left",
        expectedClasses: "flex-col",
      },
      {
        horizontal: false,
        itemPlacement: "right",
        expectedClasses: "flex-row-reverse",
      },
      {
        horizontal: false,
        itemPlacement: "left",
        expectedClasses: "flex-row",
      },
      {
        horizontal: false,
        itemPlacement: undefined,
        expectedClasses: "flex-row",
      },
    ])(
      "should return correct classes for horizontal=$horizontal and placement=$itemPlacement",
      ({ horizontal, itemPlacement, expectedClasses }) => {
        // Arrange
        const props = {};
        const config = { horizontal, itemPlacement };

        // Act
        const { getTimelineItemPlacementClasses } = useTimelineItem(
          props,
          config,
        );

        // Assert
        expect(getTimelineItemPlacementClasses.value).toBe(expectedClasses);
      },
    );
  });
});
