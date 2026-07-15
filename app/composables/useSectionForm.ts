import useVuelidate from "@vuelidate/core";
import {
  getSectionTypesByPlacement,
  shouldWarnDuplicateHomeSectionType,
  type SectionPlacement,
} from "~~/shared/config/sectionBuilder";
import { ISectionType } from "~~/shared/types/enums";
import { sectionMetadataValidationRules } from "~/utils/sectionMetadataValidationRules";
import {
  parseSectionInsertAfter,
  parseSectionPlacement,
} from "~/utils/parseSectionCreateQuery";
import {
  sectionBlockBuilderKey,
  useSectionBlockBuilder,
} from "~/composables/useSectionBlockBuilder";
import { showErrorToast, showSuccessToast } from "~/utils/toastNotification";
import type {
  SectionFormMode,
  SectionFormStep,
  SectionMetadataFormState,
  SectionTypeOption,
} from "~/types/sectionForm";

const SECTION_TYPE_LABELS: Record<ISectionType, string> = {
  [ISectionType.HERO]: "Hero",
  [ISectionType.SKILLS]: "Skills",
  [ISectionType.CONTACT]: "Contact",
  [ISectionType.ABOUT_ME]: "About Me",
};

/**
 * Returns fallback section type for selected placement.
 *
 * @param placement - section placement context
 * @returns default section type available for placement
 */
function getDefaultTypeForPlacement(placement: SectionPlacement): ISectionType {
  return getSectionTypesByPlacement(placement)[0] ?? ISectionType.HERO;
}

export function useSectionForm(options: { mode?: SectionFormMode } = {}) {
  const mode = options.mode ?? "create";
  const route = useRoute();
  const sectionsStore = useSectionsStore();

  const step = ref<SectionFormStep>(1);
  const placement = ref<SectionPlacement>(parseSectionPlacement(route.query));
  const insertAfter = ref<number | null>(parseSectionInsertAfter(route.query));
  const orderManuallyEdited = ref(false);

  const metadata = ref<SectionMetadataFormState>({
    title: "",
    slug: "",
    type: getDefaultTypeForPlacement(placement.value),
    order: 1,
  });

  const blocks = ref<Block[]>([]);
  const isSubmitting = ref(false);

  const sectionType = computed(() => metadata.value.type);
  const blockBuilder = useSectionBlockBuilder(blocks, sectionType);

  provide(sectionBlockBuilderKey, blockBuilder);

  const orderedSections = computed(() => sectionsStore.orderedSections);
  const { suggestedOrder } = useSectionInsertOrder(
    placement,
    insertAfter,
    orderedSections,
  );

  const typeOptions = computed<SectionTypeOption[]>(() =>
    getSectionTypesByPlacement(placement.value).map((type) => ({
      value: type,
      label: SECTION_TYPE_LABELS[type],
    })),
  );

  const showDuplicateTypeWarning = computed(() =>
    shouldWarnDuplicateHomeSectionType(
      placement.value,
      orderedSections.value.map((section) => section.type),
      metadata.value.type,
    ),
  );

  const metadataV$ = useVuelidate(sectionMetadataValidationRules, metadata);

  /**
   * Marks a metadata field as touched to trigger validation messages.
   *
   * @param field - metadata field key to mark as touched
   */
  const touchField = (field: keyof typeof sectionMetadataValidationRules) => {
    metadataV$.value[field].$touch();
  };

  const titleErrors = computed(() => metadataV$.value.title.$errors);
  const slugErrors = computed(() => metadataV$.value.slug.$errors);
  const orderErrors = computed(() => metadataV$.value.order.$errors);
  const isTitleInvalid = computed(() => metadataV$.value.title.$error);
  const isSlugInvalid = computed(() => metadataV$.value.slug.$error);
  const isOrderInvalid = computed(() => metadataV$.value.order.$error);

  /**
   * Prevents automatic order suggestions after user edits order manually.
   */
  const markOrderAsEdited = () => {
    orderManuallyEdited.value = true;
  };

  watch(suggestedOrder, (order) => {
    // Keep order in sync with insertion context only until user edits it.
    if (!orderManuallyEdited.value) {
      metadata.value.order = order;
    }
  });

  watch(
    placement,
    (nextPlacement) => {
      const availableTypes = getSectionTypesByPlacement(nextPlacement);

      // If current type is invalid for the new placement, switch to default.
      if (!availableTypes.includes(metadata.value.type)) {
        metadata.value.type = getDefaultTypeForPlacement(nextPlacement);
      }
    },
    { immediate: true },
  );

  /**
   * Validates metadata step and reveals validation messages.
   *
   * @returns true when metadata fields are valid
   */
  const validateMetadataStep = async (): Promise<boolean> => {
    metadataV$.value.$touch();
    return metadataV$.value.$validate();
  };

  /**
   * Advances wizard to block builder when metadata validation passes.
   *
   * @returns true when navigation to step 2 succeeded
   */
  const continueToBlockBuilder = async (): Promise<boolean> => {
    const isValid = await validateMetadataStep();

    if (isValid) {
      step.value = 2;
    }

    return isValid;
  };

  /**
   * Navigates back to metadata step.
   */
  const goToMetadataStep = () => {
    step.value = 1;
  };

  /**
   * Loads form state from an existing section (for future edit mode).
   */
  const loadFromSection = (section: ValidatedSection) => {
    metadata.value = {
      title: section.title ?? "",
      slug: section.slug,
      type: section.type,
      order: section.order,
    };
    blocks.value = [...section.blocks];
    orderManuallyEdited.value = true;
  };

  /**
   * Uploads pending images, creates the section, then redirects on success.
   */
  const submitCreateSection = async () => {
    const isMetadataValid = await validateMetadataStep();

    if (!isMetadataValid) {
      step.value = 1;
      return;
    }

    if (blockBuilder.editorOpen.value) {
      showErrorToast("Close the block editor before submitting");
      return;
    }

    if (!blockBuilder.hasMinimumBlocks.value) {
      showErrorToast("Add at least one block before submitting");
      return;
    }

    isSubmitting.value = true;

    try {
      const success = await sectionsStore.createSection(
        metadata.value,
        blocks.value,
        blockBuilder.pendingSectionImages.value,
      );

      if (success) {
        showSuccessToast("Section created successfully!");
        await navigateTo(
          placement.value === "home" ? "/" : `/${metadata.value.slug}`,
        );
      }
    } catch (error) {
      handleError(error, "Failed to create section");
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    // Fetch existing sections for duplicate type warning and order suggestion.
    await sectionsStore.fetchSections();

    // Apply latest suggested order only when it has not been overridden.
    if (!orderManuallyEdited.value) {
      metadata.value.order = suggestedOrder.value;
    }
  });

  return {
    mode,
    step,
    placement,
    insertAfter,
    metadata,
    blocks,
    typeOptions,
    showDuplicateTypeWarning,
    suggestedOrder,
    validateMetadataStep,
    continueToBlockBuilder,
    goToMetadataStep,
    loadFromSection,
    touchField,
    markOrderAsEdited,
    titleErrors,
    slugErrors,
    orderErrors,
    isTitleInvalid,
    isSlugInvalid,
    isOrderInvalid,
    hasMinimumBlocks: blockBuilder.hasMinimumBlocks,
    editorOpen: blockBuilder.editorOpen,
    isSubmitting,
    submitCreateSection,
  };
}
