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

  /**
   * Minimum value for the input element
   */
  min?: string;

  /**
   * Maximum value for the input element
   */
  max?: string;
}

/**
 * Type for button style variants
 */
export type BaseBtnStyle =
  | "additional"
  | "secondary"
  | "tab--active"
  | "tab--inactive"
  | "login--logout"
  | "mobile--login--logout"
  | "mobile--secondary"
  | "sidebar--secondary"
  | "sidebar--additional"
  | "additional-transparent";

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
  btnStyle?: BaseBtnStyle;

  /**
   * Size variant of the button
   */
  btnSize?: "default" | "tab" | "large" | "small" | "mobile--menu";

  /**
   * Name of the icon to display in the button
   */
  iconName?: string | null;

  /**
   * Whether the button is waitng to finish background process
   */
  isLoading?: boolean;
}

/**
 * SIDEBAR LINK
 *
 * Union type representing a single navigation item
 * in the DashboardSideNavbar component.
 */
export type SidebarLink = SidebarSingleLink | SidebarDropdownLink;

/**
 * SIDEBAR BASE
 *
 * Shared properties for all sidebar navigation items
 */
interface SidebarBase {
  /**
   * Unique identifier of the sidebar item
   */
  id: number;

  /**
   * Display label of the sidebar item
   */
  label: string;

  /**
   * Optional icon name
   */
  icon?: string;
}

/**
 * SIDEBAR SINGLE LINK
 *
 * Represents a direct navigation link
 * without nested children
 */
interface SidebarSingleLink extends SidebarBase {
  /**
   * Discriminator defining link type
   */
  type: "link";

  /**
   * Target route path
   */
  to: string;
}

/**
 * SIDEBAR DROPDOWN LINK
 *
 * Represents a navigation item that contains
 * nested child links
 */
interface SidebarDropdownLink extends SidebarBase {
  /**
   * Discriminator defining dropdown type
   */
  type: "dropdown";

  /**
   * Array of nested dropdown navigation items
   */
  children: SidebarDropdownChild[];
}

/**
 * SIDEBAR DROPDOWN CHILD
 *
 * Represents a nested navigation link
 * inside a dropdown sidebar item
 */
export interface SidebarDropdownChild {
  /**
   * Unique identifier of the dropdown child item
   */
  id: number;

  /**
   * Display label of the dropdown child
   */
  label: string;

  /**
   * Target route path
   */
  to: string;

  /**
   * Optional icon name
   */
  icon?: string;
}

/**************
 * FILE UPLOAD
 *************/

/**
 * UPLOAD FILE STATUS
 *
 * Status of the uploaded file
 */
export type UploadFileStatus =
  "pending" | "uploading" | "finished" | "error" | "removed";

/**
 * UPLOAD FILE INFO
 *
 * Represents information about uploaded file
 */
export interface UploadFileInfo {
  /**
   * Unique file identifier (auto-generated)
   */
  id: string;

  /**
   * Original file name
   */
  name: string;

  /**
   * Native File object - null for pre-existing files (e.g. loaded from
   * server)
   */
  file: File | null;

  /**
   * Current lifecycle status
   */
  status: UploadFileStatus;

  /**
   * Upload progress 0-100
   */
  percentage: number | null;

  /**
   * Final URL after successful upload
   */
  url: string | null;

  /**
   * Local object URL used for image previews
   */
  thumbnailUrl: string | null;

  /**
   * MIME type
   */
  type: string | null;

  /**
   * Error message when status === 'error'
   */
  errorMessage: string | null;

  /**
   * Alternative text used for image accessibility
   */
  altText: string;

  /**
   * Image path for pre-existing files loaded from the database.
   * Set when file is null (edit mode); omitted for newly selected uploads.
   */
  srcPath?: string;
}

/**
 * CUSTOM REQUEST HANDLER
 *
 * Represents the function used to customize upload request
 */
export type CustomRequestHandler = (options: {
  /**
   * File being uploaded with its current metadata and status
   */
  file: UploadFileInfo;

  /**
   * Call with current progress (0–100) to update the progress bar
   *
   * @param percent - current progress percent
   */
  onProgress: (percent: number) => void;

  /**
   * Call on successful upload, optionally passing the resulting file URL
   *
   * @param url - file location URL
   */
  onFinish: (url?: string) => void;

  /**
   * Call on failure, optionally passing an error message to display
   *
   * @param message - error message
   * @returns
   */
  onError: (message?: string) => void;
}) => void;

/**
 * FILE UPLOAD PROPS
 *
 * Props for the FileUpload component
 */
export interface FileUploadProps {
  /**
   * Controlled file list - when provided, component operates in controlled mode (v-model)
   */
  fileList?: UploadFileInfo[];

  /**
   * Upload endpoint URL used by the default XHR request handler
   */
  action?: string;

  /**
   * Custom upload handler - overrides action, exposes onProgress/onFinish/onError callbacks
   */
  customRequest?: CustomRequestHandler;

  /**
   * Accepted MIME types or extensions
   */
  accept: string[];

  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;

  /**
   * Maximum allowed file size in megabytes
   */
  maxSizeMB?: number;

  /**
   * Disables the entire component including drop zone and remove buttons
   */
  disabled?: boolean;

  /**
   * Additional FormData fields appended to every upload request
   */
  data?: Record<string, string>;

  /**
   * Additional HTTP headers sent with every upload request
   */
  headers?: Record<string, string>;

  /**
   * Whether to include cookies and auth headers in cross-origin requests
   */
  withCredentials?: boolean;

  /**
   * Whether to include alternative text for image accessibility
   */
  withAltText?: boolean;
}

/**
 * Emits for the file upload component
 */
export type FileUploadEmit = {
  (e: "update:fileList" | "change", files: UploadFileInfo[]): void;
  (e: "finish" | "error" | "remove", file: UploadFileInfo): void;
};

/**
 * Props for the file upload composable with default values applied
 */
export type FileUploadComposableProps = WithDefaults<
  Pick<
    FileUploadProps,
    | "fileList"
    | "action"
    | "customRequest"
    | "disabled"
    | "accept"
    | "maxFiles"
    | "maxSizeMB"
    | "data"
    | "headers"
    | "withCredentials"
  >,
  "maxFiles" | "maxSizeMB" | "accept" | "data" | "headers" | "withCredentials"
>;

/**
 * BASE TEXTAREA
 *
 * Props for BaseTextarea component
 */
export interface BaseTextareaProps {
  /**
   * ID of the textarea element
   */
  id?: string;

  /**
   * Name of the textarea element
   */
  name?: string;

  /**
   * Placeholder of the textarea element
   */
  placeholder?: string;

  /**
   * Number of rows for the textarea element
   */
  rows?: number;

  /**
   * Whether the textarea is valid
   */
  isValid?: boolean;

  /**
   * Whether the textarea is disabled
   */
  isDisabled?: boolean;
}

/**
 * BASE SELECT
 *
 * Props for BaseSelect component
 */
export interface BaseSelectProps {
  /**
   * ID of the select element
   */
  id?: string;

  /**
   * Name of the select element
   */
  name?: string;

  /**
   * Whether the select is valid
   */
  isValid?: boolean;

  /**
   * Whether the select is disabled
   */
  isDisabled?: boolean;
}

/**
 * BASE OPTION
 *
 * Props for BaseOption component
 */
export interface BaseOptionProps<T = string> {
  /**
   * The value of the option
   */
  value: T;

  /**
   * The label of the option
   */
  label: string;
}

/**
 * PROJECT FORM
 *
 * Props for the ProjectForm component
 */
export interface ProjectFormProps {
  /**
   * Form mode — controls labels and submit button text
   */
  mode: "create" | "edit";

  /**
   * Reactive project form fields bound to inputs
   */
  form: CreateProjectForm;

  /**
   * Whether the form is currently being submitted
   */
  isSubmitting: boolean;

  /**
   * Called when the user submits the form
   */
  onSubmit: () => Promise<void>;

  /**
   * Controlled file list for the main image slot (edit mode prefill)
   */
  mainImageFileList?: UploadFileInfo[];

  /**
   * Controlled file list for the additional images slot (edit mode prefill)
   */
  otherImagesFileList?: UploadFileInfo[];

  /**
   * Called when the main image FileUpload emits change
   */
  onMainImageChange: (files: UploadFileInfo[]) => void;

  /**
   * Called when the additional images FileUpload emits change
   */
  onOtherImagesChange: (files: UploadFileInfo[]) => void;

  /**
   * Called when the main image FileUpload emits update:fileList (controlled mode)
   */
  onMainImageFileListUpdate?: (files: UploadFileInfo[]) => void;

  /**
   * Called when the additional images FileUpload emits update:fileList (controlled mode)
   */
  onOtherImagesFileListUpdate?: (files: UploadFileInfo[]) => void;

  /**
   * Validation error message for the technologies list
   */
  technologiesErrors: string;

  /**
   * Appends a technology to the form list
   */
  addTechnology: (value: string) => void;

  /**
   * Removes a technology from the form list by index
   */
  removeTechnology: (index: number) => void;

  /**
   * Validation error message for the gained experience list
   */
  gainedExperienceErrors: string;

  /**
   * Appends an experience entry to the form list
   */
  addExperience: (value: string) => void;

  /**
   * Removes an experience entry from the form list by index
   */
  removeExperience: (index: number) => void;

  /**
   * Marks a single form field as touched for Vuelidate display
   */
  touchField: (field: keyof typeof createProjectValidationRules) => void;

  /**
   * Vuelidate error messages for the title field
   */
  titleErrors: ErrorObject[];

  /**
   * Vuelidate error messages for the short description field
   */
  shortDescriptionErrors: ErrorObject[];

  /**
   * Vuelidate error messages for the long description field
   */
  longDescriptionErrors: ErrorObject[];

  /**
   * Vuelidate error messages for the start date field
   */
  startDateErrors: ErrorObject[];

  /**
   * Vuelidate error messages for the GitHub link field
   */
  githubLinkErrors: ErrorObject[];

  /**
   * Vuelidate error messages for the website link field
   */
  websiteLinkErrors: ErrorObject[];

  /**
   * Whether the title field has a validation error
   */
  isTitleInvalid: boolean;

  /**
   * Whether the short description field has a validation error
   */
  isShortDescriptionInvalid: boolean;

  /**
   * Whether the long description field has a validation error
   */
  isLongDescriptionInvalid: boolean;

  /**
   * Whether the start date field has a validation error
   */
  isStartDateInvalid: boolean;

  /**
   * Whether the GitHub link field has a validation error
   */
  isGithubLinkInvalid: boolean;

  /**
   * Whether the website link field has a validation error
   */
  isWebsiteLinkInvalid: boolean;
}
