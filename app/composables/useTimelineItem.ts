import type {
  BaseTimelineItemProps,
  BaseTimelineProps,
} from "~/types/components";

export function useTimelineItem(
  props: BaseTimelineItemProps,
  timelineConfig: BaseTimelineProps,
) {
  // CLASSES;

  /**
   * Calculate CSS classes for the dot based on the type prop
   */
  const getDotTypeClasses = computed(() => {
    switch (props.type) {
      case "success":
        return "border-success-500 bg-success-300";
      case "info":
        return "border-info-500 bg-info-300";
      case "warning":
        return "border-warning-500 bg-warning-300";
      case "error":
        return "border-error-500 bg-error-300";
      default:
        return "border-secondary-500 bg-secondary-300";
    }
  });

  /**
   * Calculate CSS classes for the dot size based on the timeline size
   */
  const getDotSizeClasses = computed(() => {
    switch (timelineConfig.size) {
      case "large":
        return "w-10 h-10";
      default:
        return "w-8 h-8";
    }
  });

  /**
   * Calculate CSS classes for content alignment based on timeline direction
   */
  const getContentAlignmentClasses = computed(() => {
    return timelineConfig.horizontal ? "text-center" : "text-left";
  });

  /**
   * Calculate CSS classes for the line connector after the dot
   */
  const getLineConnectorClasses = computed(() => {
    if (props.isLast) return "";

    const size =
      timelineConfig.size === "large"
        ? timelineConfig.horizontal
          ? "after:w-[380%] after:h-0.5"
          : "after:h-[210%] after:w-0.5"
        : timelineConfig.horizontal
          ? "after:w-[310%] after:h-0.5"
          : "after:h-[180%] after:w-0.5";

    const position = timelineConfig.horizontal
      ? "after:left-full after:top-1/2 after:-translate-y-1/2"
      : "after:top-full after:left-1/2 after:-translate-x-1/2";

    return `${size} ${position} after:bg-secondary-500`;
  });

  /**
   * Calculate CSS classes for timeline item placement
   */
  const getTimelineItemPlacementClasses = computed(() => {
    return timelineConfig.horizontal
      ? "flex-col"
      : timelineConfig.itemPlacement === "right"
        ? "flex-row-reverse"
        : "flex-row";
  });

  return {
    getDotTypeClasses,
    getDotSizeClasses,
    getContentAlignmentClasses,
    getLineConnectorClasses,
    getTimelineItemPlacementClasses,
  };
}
