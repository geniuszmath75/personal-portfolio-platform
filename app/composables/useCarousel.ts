import type { CarouselComposableProps } from "~/types/components";

export function useCarousel(props: CarouselComposableProps) {
  /**
   * Internal state for current slide index
   */
  const internalIndex = ref(props.defaultIndex);

  /**
   * Store interval ID for autoplay cleanup
   */
  let intervalId: NodeJS.Timeout | null = null;

  // CLASSES:

  /**
   * Calculate CSS classes for dots navigation placement
   */
  const dotPlacementClasses = computed(() => {
    switch (props.dotPlacement) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "left":
        return "left-4 top-1/2 transform -translate-y-1/2 flex-col";
      case "right":
        return "right-4 top-1/2 transform -translate-y-1/2 flex-col";
      default:
        return props.showArrow
          ? "bottom-4 left-4"
          : "bottom-4 left-1/2 transform -translate-x-1/2";
    }
  });

  /**
   * Calculate inline style for carousel transform based on current index
   */
  const carouselTransformStyle = computed(() => ({
    transform: `translateX(-${internalIndex.value * 100}%)`,
  }));

  /**
   * Get CSS class for individual dot based on active state
   *
   * @param index - index of the dot
   * @returns CSS class string
   */
  const getDotClass = (index: number) => {
    return index === internalIndex.value
      ? "bg-secondary-500"
      : "bg-primary-400";
  };

  // METHODS:

  /**
   * Navigate to specific slide by index
   *
   * @param index - index of the slide to navigate to (0-based)
   */
  function goToElement(index: number) {
    if (index >= 0 && index < props.totalElements) {
      internalIndex.value = index;
    }
  }

  /**
   * Navigate to previous slide with circular rotation
   */
  function prevElement() {
    const newIndex =
      (internalIndex.value - 1 + props.totalElements) % props.totalElements;

    internalIndex.value = newIndex;
  }

  /**
   * Navigate to next slide with circular rotation
   */
  function nextElement() {
    const newIndex = (internalIndex.value + 1) % props.totalElements;

    internalIndex.value = newIndex;
  }

  /**
   * Get current slide index
   */
  function getCurrentIndex() {
    return internalIndex.value;
  }

  /**
   * Setup autoplay functionality on component mount
   */
  onMounted(() => {
    if (props.autoplay && props.totalElements > 1) {
      intervalId = setInterval(() => {
        nextElement();
      }, 5000);
    }
  });

  /**
   * Cleanup autoplay interval on component unmount
   */
  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    internalIndex,
    dotPlacementClasses,
    carouselTransformStyle,
    getDotClass,
    goToElement,
    prevElement,
    nextElement,
    getCurrentIndex,
  };
}
