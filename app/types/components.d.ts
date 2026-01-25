import type { ButtonHTMLAttributes, InputTypeHTMLAttribute } from "vue";

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

/**
 * BASE TIMELINE
 *
 * Props for the BaseTimeline component
 */
export interface BaseTimelineProps {
  /**
   * Whether the timeline is displayed horizontally
   */
  horizontal?: boolean;

  /**
   * Placement of the timeline items
   */
  itemPlacement?: "left" | "right";

  /**
   * Size of the timeline component
   */
  size?: "medium" | "large";
}

/**
 * BASE TIMELINE ITEM
 *
 * Props for the BaseTimelineItem component
 */
export interface BaseTimelineItemProps {
  /**
   * Content of the timeline item
   */
  content?: string;

  /**
   * Datetime associated with the timeline item (can be null)
   */
  time?: string | null;

  /**
   * Title of the timeline item
   */
  title?: string;

  /**
   * Type of the timeline item (affects styling)
   */
  type?: "default" | "success" | "info" | "warning" | "error";

  /**
   * Whether this item is the last in the timeline (affects connector rendering)
   */
  isLast?: boolean;
}

/**
 * BASE TAG
 *
 * Props for the BaseTag component
 */
export interface BaseTagProps {
  /**
   * Whether the tag has a border
   */
  bordered?: boolean;

  /**
   * Whether the tag is rounded
   */
  rounded?: boolean;

  /**
   * Size of the tag component
   */
  size?: "small" | "medium" | "large";

  /**
   * Type of the tag component (affects styling)
   */
  type?: "default" | "primary" | "info" | "success" | "warning" | "error";

  /**
   * Whether the tag has dashed border.
   */
  dashed?: boolean;
}

/**
 * PROJECT PANEL
 *
 * Props for the ProjectPanel component
 */
export interface ProjectPanelProps {
  /**
   * Heading name of the panel
   */
  heading?: string;

  /**
   * Whether the panel has full width
   */
  fullWidth?: boolean;

  /**
   * Type of the panel component (affect styling)
   */
  type?: "primary" | "secondary";
}

/**
 * BASE INPUT
 *
 * Props for the BaseInput component
 */
export interface BaseInputProps {
  /**
   * Type of the input element
   */
  type?: InputTypeHTMLAttribute;

  /**
   * ID of the input element
   */
  id: string;

  /**
   * Name of the input element
   */
  name: string;

  /**
   * Placeholder text for the input element
   */
  placeholder?: string;

  /**
   * Whether the input has valid data
   */
  isValid?: boolean;

  /**
   * Whether the input is disabled
   */
  isDisabled?: boolean;
}

/**
 * BASE BUTTON
 *
 * Props for the BaseBtn component
 */
export interface BaseBtnProps {
  /**
   * Type of the button element
   */
  type?: ButtonHTMLAttributes["type"];

  /**
   * Whether the button is disabled
   */
  isDisabled?: boolean;

  /**
   * Label text for the button
   */
  label: string;

  /**
   * Style variant of the button
   */
  btnStyle?:
    | "additional"
    | "secondary"
    | "tab--active"
    | "tab--inactive"
    | "login--logout"
    | "mobile--login--logout"
    | "mobile--secondary";

  /**
   * Size variant of the button
   */
  btnSize?: "default" | "tab" | "large" | "mobile--menu";

  /**
   * Name of the icon to display in the button
   */
  iconName?: string | null;
}
