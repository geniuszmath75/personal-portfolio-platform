import type { BaseTagProps } from "~/types/components";

export function useTag(props: BaseTagProps) {
  // CLASSES:

  /**
   * Calculate CSS classes for diffrent tag sizes
   */
  const getSizeClasses = computed(() => {
    switch (props.size) {
      case "small":
        return "h-8 px-2 py-0.5 text-xs";
      case "large":
        return "h-12 px-4 py-2 text-base";
      default:
        return "h-10 px-3 py-1 text-sm";
    }
  });

  /**
   * Calculate CSS classes for diffrent tag borders
   */
  const getBorderClasses = computed(() => {
    const border = props.bordered ? "border" : "border-none";

    const color =
      props.type === "default"
        ? "border-additional-500"
        : props.type === "primary"
          ? "border-secondary-500"
          : `border-${props.type}-500`;

    const dash = props.dashed ? "border-dashed" : "border-solid";

    return `${border} ${color} ${dash}`;
  });

  /**
   * Calculate CSS class for rounded border.
   */
  const getRoundedClass = computed(() =>
    props.rounded ? "rounded-2xl" : "rounded-none",
  );

  /**
   * Calculate CSS classes for the tag based on type prop
   */
  const getTypeClasses = computed(() => {
    switch (props.type) {
      case "info":
        return "bg-info-300 text-info-800";
      case "success":
        return "bg-success-300 text-success-800";
      case "warning":
        return "bg-warning-300 text-warning-800";
      case "error":
        return "bg-error-300 text-error-800";
      case "primary":
        return "bg-primary-500 text-secondary-500";
      default:
        return "bg-secondary-500 text-primary-500";
    }
  });

  return {
    getSizeClasses,
    getBorderClasses,
    getRoundedClass,
    getTypeClasses,
  };
}
