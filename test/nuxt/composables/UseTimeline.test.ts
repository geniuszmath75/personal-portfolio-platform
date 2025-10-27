import { beforeEach, describe, expect, it } from "vitest";
import { useTimeline } from "../../../app/composables/useTimeline";
import type { BaseTimelineProps } from "../../../app/types/components";

describe("useTimeline", () => {
  let testTimelineProps: BaseTimelineProps;

  beforeEach(() => {
    testTimelineProps = {
      horizontal: false,
      itemPlacement: "left",
      size: "medium",
    };
  });

  it.each([
    { size: "medium", expectedClass: "text-md gap-8" },
    { size: "large", expectedClass: "text-lg gap-16" },
  ])(
    "should 'getTimelineSizeClasses' return correct classes for $size size",
    ({ size, expectedClass }) => {
      // Arrange
      const { getTimelineSizeClasses } = useTimeline({
        ...testTimelineProps,
        size,
      });

      // Assert
      expect(getTimelineSizeClasses.value).toBe(expectedClass);
    },
  );

  it.each([
    { horizontal: true, expectedClass: "flex-row" },
    { horizontal: false, expectedClass: "flex-col" },
  ])(
    "should 'getTimelineDirectionClasses' return correct classes for horizontal=$horizontal",
    ({ horizontal, expectedClass }) => {
      // Arrange
      const { getTimelineDirectionClasses } = useTimeline({
        ...testTimelineProps,
        horizontal,
      });

      // Assert
      expect(getTimelineDirectionClasses.value).toBe(expectedClass);
    },
  );
});
