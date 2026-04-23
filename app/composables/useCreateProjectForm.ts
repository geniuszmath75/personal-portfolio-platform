import useVuelidate from "@vuelidate/core";
import type FileUpload from "~/components/FileUpload.vue";
import type { UploadFileInfo } from "~/types/components";
import type { CreateProjectForm } from "~~/shared/types";

export function useCreateProjectForm() {
  const projectsStore = useProjectsStore();

  const form = ref<CreateProjectForm>({
    title: "",
    shortDescription: "",
    longDescription: "",
    startDate: "",
    endDate: "",
    status: ProjectStatusType.COMPLETED,
    projectSource: ProjectSourceType.HOBBY,
    githubLink: "",
    websiteLink: "",
    technologies: [],
    gainedExperience: [],
    mainImage: null,
    otherImages: [],
  });

  /**
   * FileUpload refs
   */

  const mainImageUploadRef = ref<InstanceType<typeof FileUpload>>();

  const otherImagesUploadRef = ref<InstanceType<typeof FileUpload>>();

  /**
   * Pending file state
   */
  const pendingMainImage = ref<{ file: File; altText: string } | null>(null);

  const pendingOtherImages = ref<{ file: File; altText: string }[]>([]);

  const isMainImageInvalid = ref(false);

  /**
   * File change handlers
   */

  /**
   * Called by FileUpload @change for the main image slot.
   *
   * @param files - array of uploaded image files
   */
  const handleMainImageChange = (files: UploadFileInfo[]) => {
    const file = files[0];

    if (!file) {
      pendingMainImage.value = null;
      isMainImageInvalid.value = false;
      return;
    }

    if (file.status === "error") {
      pendingMainImage.value = null;
      isMainImageInvalid.value = true;
      return;
    }

    if (!file.file) return;

    pendingMainImage.value = {
      file: file.file,
      altText: file.altText,
    };
    isMainImageInvalid.value = false;
  };

  /**
   * Called by FileUpload @change for the additional images slot
   * Collects all valid (non-error) files
   *
   * @param files - array of uploaded image files
   */
  const handleOtherImagesChange = (files: UploadFileInfo[]) => {
    pendingOtherImages.value = files
      .filter((f) => f.status !== "error" && f.file !== null)
      .map((f) => ({
        file: f.file as File,
        altText: f.altText,
      }));
  };

  /**
   * Dynamic list helpers
   */

  /**
   * Current value of the technology input before adding to the list
   */
  const techInput = ref("");

  /**
   * Current value of the experience input before adding to the list
   */
  const experienceInput = ref("");

  /**
   * Whether technologies list has at least one entry
   */
  const technologiesErrors = ref("");

  /**
   * Whether gainedExperience list has at least one entry
   */
  const gainedExperienceErrors = ref("");

  const addTechnology = () => {
    const value = techInput.value.trim();
    if (!value) return;
    if (form.value.technologies.includes(value)) return;
    form.value.technologies.push(value);
    techInput.value = "";
    technologiesErrors.value = "";
  };

  const removeTechnology = (index: number) => {
    form.value.technologies.splice(index, 1);
  };

  const addExperience = () => {
    const value = experienceInput.value.trim();
    if (!value) return;
    if (form.value.gainedExperience.includes(value)) return;
    form.value.gainedExperience.push(value);
    experienceInput.value = "";
    gainedExperienceErrors.value = "";
  };

  const removeExperience = (index: number) => {
    form.value.gainedExperience.splice(index, 1);
  };

  /**
   * Vuelidate
   */
  const $v = useVuelidate(createProjectValidationRules, form);

  const validate = () => $v.value.$validate();

  const touchField = (field: keyof typeof createProjectValidationRules) => {
    $v.value[field].$touch();
  };

  /**
   * Per-field error/invalid helpers
   */
  const titleErrors = computed(() => $v.value.title.$errors);
  const shortDescriptionErrors = computed(
    () => $v.value.shortDescription.$errors,
  );
  const longDescriptionErrors = computed(
    () => $v.value.longDescription.$errors,
  );
  const startDateErrors = computed(() => $v.value.startDate.$errors);
  const githubLinkErrors = computed(() => $v.value.githubLink.$errors);
  const websiteLinkErrors = computed(() => $v.value.websiteLink.$errors);

  const isTitleInvalid = computed(() => $v.value.title.$error);
  const isShortDescriptionInvalid = computed(
    () => $v.value.shortDescription.$error,
  );
  const isLongDescriptionInvalid = computed(
    () => $v.value.longDescription.$error,
  );
  const isStartDateInvalid = computed(() => $v.value.startDate.$error);
  const isGithubLinkInvalid = computed(() => $v.value.githubLink.$error);
  const isWebsiteLinkInvalid = computed(() => $v.value.websiteLink.$error);

  /**
   * Submit
   */

  const isSubmitting = ref(false);

  const submitCreateProject = async () => {
    // 1. Validate text fields via Vuelidate
    const isValid = await validate();

    // 2. Validate dynamic lists
    let listsValid = true;

    if (form.value.technologies.length === 0) {
      technologiesErrors.value = "At least one technology is required";
      listsValid = false;
    }

    if (form.value.gainedExperience.length === 0) {
      gainedExperienceErrors.value =
        "At least one experience description is required";
      listsValid = false;
    }

    // 3. Validate main image - must be selected and have no upload error
    if (isMainImageInvalid.value) {
      showErrorToast("Please fix the main image before submitting");
      return;
    }

    if (!pendingMainImage.value) {
      showErrorToast("Main image is required");
      return;
    }

    if (!pendingMainImage.value.altText.trim()) {
      showErrorToast("Main image requires alt text");
      return;
    }

    const missingAltText = pendingOtherImages.value.some(
      (img) => !img.altText.trim(),
    );

    if (missingAltText) {
      showErrorToast("All additional images require alt text");
      return;
    }

    if (!isValid || !listsValid) return;

    // 4. Upload images + create project via store
    isSubmitting.value = true;
    try {
      const success = await projectsStore.createProject(
        form.value,
        pendingMainImage.value,
        pendingOtherImages.value,
      );

      if (success) {
        showSuccessToast("Project created successfully!");
        await navigateTo("/projects");
      }
    } catch (error) {
      handleError(error, "Failed to create project");
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    form,

    // Form submission and image handling
    submitCreateProject,
    handleMainImageChange,
    handleOtherImagesChange,

    // FileUpload refs
    mainImageUploadRef,
    otherImagesUploadRef,

    // Dynamic list state
    techInput,
    experienceInput,
    technologiesErrors,
    gainedExperienceErrors,
    addTechnology,
    removeTechnology,
    addExperience,
    removeExperience,

    // Validation API
    validate,
    touchField,
    isSubmitting,

    // Per-field errors
    titleErrors,
    shortDescriptionErrors,
    longDescriptionErrors,
    startDateErrors,
    githubLinkErrors,
    websiteLinkErrors,

    // Per-field invalid flags
    isTitleInvalid,
    isShortDescriptionInvalid,
    isLongDescriptionInvalid,
    isStartDateInvalid,
    isGithubLinkInvalid,
    isWebsiteLinkInvalid,
  };
}
