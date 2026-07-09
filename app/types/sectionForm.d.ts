import type { Block } from "~~/shared/types";
import type { ISectionType } from "~~/shared/types/enums";
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
