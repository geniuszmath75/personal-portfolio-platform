import type { Block } from "~~/shared/types";
import type { BlockKind, ISectionType } from "~~/shared/types/enums";
import type { SectionPlacement } from "~~/shared/config/sectionBuilder";
import type { ErrorObject } from "@vuelidate/core";

/**
 * Available wizard steps in the section form flow.
 */
export type SectionFormStep = 1 | 2;

/**
 * Form mode shared by create and future edit flows.
 */
export type SectionFormMode = "create" | "edit";

/**
 * Metadata field keys supported by touch handlers.
 */
export type SectionMetadataField = "title" | "slug" | "order";

/**
 * Metadata values collected in step 1 of the wizard.
 */
export interface SectionMetadataFormState {
  /**
   * The title of the section (empty string when omitted in UI state).
   */
  title: string;

  /**
   * The slug of the section, used for routing or identification
   */
  slug: string;

  /**
   * Selected section layout/content type.
   */
  type: ISectionType;

  /**
   * Manual placement order persisted with the section.
   */
  order: number;
}

/**
 * Full local state for the section create/edit form.
 */
export interface SectionFormState {
  /**
   * Step 1 metadata payload.
   */
  metadata: SectionMetadataFormState;

  /**
   * Builder blocks prepared for API submit.
   */
  blocks: Block[];

  /**
   * Context from route query (`home` or `standalone`).
   */
  placement: SectionPlacement;
}

/**
 * Select option model for section type dropdown.
 */
export interface SectionTypeOption {
  /**
   * Enum value sent in metadata and API payload.
   */
  value: ISectionType;

  /**
   * Human-readable label used in the UI.
   */
  label: string;
}

/**
 * SECTION METADATA FORM
 *
 * Props for the SectionMetadataForm component.
 * Metadata is bound via `v-model:metadata`.
 */
export interface SectionMetadataFormProps {
  /**
   * Placement context controlling copy and available types.
   */
  placement: SectionPlacement;

  /**
   * Filtered section type options for current placement.
   */
  typeOptions: SectionTypeOption[];

  /**
   * Disables fields during async submit/update operations.
   */
  isSubmitting?: boolean;

  /**
   * Enables duplicate-home-type warning banner.
   */
  showDuplicateTypeWarning: boolean;

  /**
   * Validation errors for title field.
   */
  titleErrors: ErrorObject[];

  /**
   * Validation errors for slug field.
   */
  slugErrors: ErrorObject[];

  /**
   * Validation errors for order field.
   */
  orderErrors: ErrorObject[];

  /**
   * Invalid state flag for title input styling.
   */
  isTitleInvalid: boolean;

  /**
   * Invalid state flag for slug input styling.
   */
  isSlugInvalid: boolean;

  /**
   * Invalid state flag for order input styling.
   */
  isOrderInvalid: boolean;

  /**
   * Marks a selected metadata field as touched.
   *
   * @param field - metadata field key to touch
   */
  touchField: (field: SectionMetadataField) => void;

  /**
   * Marks order value as manually edited by user.
   */
  onOrderInput: () => void;
}

/**
 * Block editor mode in the section builder.
 */
export type SectionBlockEditorMode = "add" | "edit";

/**
 * Props for the SectionBlockBuilder component.
 * Blocks are bound via `v-model:blocks`.
 */
export interface SectionBlockBuilderProps {
  /**
   * Metadata from step 1 used by the live preview.
   */
  metadata: SectionMetadataFormState;

  /**
   * Disables builder actions during async operations.
   */
  disabled?: boolean;
}

/**
 * Upload handler for section block images (delegates to sectionsStore).
 */
export type SectionUploadImageFn = (file: File) => Promise<string | null>;

/**
 * SECTION BUILDER PREVIEW SHELL
 *
 * Props for the live section preview wrapper in the block builder.
 */
export interface SectionBuilderPreviewShellProps {
  /**
   * Step 1 metadata driving layout type, order band and copy.
   */
  metadata: SectionMetadataFormState;

  /**
   * Draft blocks rendered inside the selected layout component.
   */
  blocks: Block[];
}

/**
 * SECTION BUILDER SLOT
 *
 * Props for an empty block placeholder with an add action.
 */
export interface SectionBuilderSlotProps {
  /**
   * Block kind inserted when the user clicks add.
   */
  kind: BlockKind;

  /**
   * Human-readable block name shown on the add button.
   */
  label: string;

  /**
   * Disables the add action during async operations.
   */
  disabled?: boolean;
}

/**
 * SECTION BLOCK EDITOR DRAWER
 *
 * Props for the inline block editor panel.
 * Draft block is bound via `v-model`.
 */
export interface SectionBlockEditorDrawerProps {
  /**
   * Whether the editor panel is visible.
   */
  open: boolean;

  /**
   * Add vs edit copy and behaviour.
   */
  mode: SectionBlockEditorMode;

  /**
   * Validation or save error shown below the editor fields.
   */
  error: string;

  /**
   * Disables editor fields and actions.
   */
  disabled?: boolean;

  /**
   * True while an image block upload is in progress.
   */
  isUploadingImage?: boolean;

  /**
   * Uploads a section image and returns its public URL.
   */
  uploadImage: SectionUploadImageFn;
}

/**
 * SECTION BLOCK EDITOR IMAGE
 *
 * Props for the IMAGE block editor fields.
 * Block draft is bound via `v-model`.
 */
export interface SectionBlockEditorImageProps {
  /**
   * Disables file input and alt-text fields.
   */
  disabled?: boolean;

  /**
   * True while upload is in progress (disables save in parent drawer).
   */
  isUploading?: boolean;

  /**
   * Uploads a section image and returns its public URL.
   */
  uploadImage: SectionUploadImageFn;
}
