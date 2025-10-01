/**
 * Utility type to make certain properties required while keeping others optional
 */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * BASE CAROUSEL
 *
 * Props for the BaseCarousel component
 */
export interface BaseCarouselProps {
  /**
   * Current active index (for controlled component)
   */
  currentIndex?: number;

  /**
   * Default active index (for uncontrolled component)
   */
  defaultIndex?: number;

  /**
   * Total number of elements in the carousel
   */
  totalElements?: number;

  /**
   * Whether to show navigation arrows
   */
  showArrow?: boolean;

  /**
   * Whether to show navigation dots
   */
  showDots?: boolean;

  /**
   * Whether to enable autoplay
   */
  autoplay?: boolean;

  /**
   * Placement of navigation dots
   */
  dotPlacement?: "top" | "bottom" | "left" | "right";
}

/**
 * Props for the carousel composable with default values applied
 */
export type CarouselComposableProps = WithDefaults<
  BaseCarouselProps,
  | "defaultIndex"
  | "totalElements"
  | "showArrow"
  | "showDots"
  | "autoplay"
  | "dotPlacement"
>;
