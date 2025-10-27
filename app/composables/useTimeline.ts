import type { BaseTimelineProps } from "~/types/components";

export function useTimeline(props: BaseTimelineProps) {
  // CLASSES:

  /**
   * Calculate CSS classes for different timeline sizes
   */
  const getTimelineSizeClasses = computed(() => {
    switch (props.size) {
      case "large":
        return "text-lg gap-16";
      default:
        return "text-md gap-8";
    }
  });

  /**
   * Calculate CSS classes for timeline direction
   */
  const getTimelineDirectionClasses = computed(() =>
    props.horizontal ? "flex-row" : "flex-col",
  );

  return {
    getTimelineSizeClasses,
    getTimelineDirectionClasses,
  };
}
