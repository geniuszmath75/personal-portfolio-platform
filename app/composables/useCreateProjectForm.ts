import useVuelidate from "@vuelidate/core";
import type { CreateProjectForm } from "~~/shared/types";

export function useCreateProjectForm() {
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
    // Validate vuelidate fields
    const isValid = await validate();

    // Validate dynamic lists manually (not covered by vuelidate)
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

    if (!isValid || !listsValid) return;

    isSubmitting.value = true;
    try {
      showSuccessToast("Project created successfully!");
    } catch (error) {
      handleError(error, "Failed to create project");
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    form,
    submitCreateProject,

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

    // Per-field
    titleErrors,
    shortDescriptionErrors,
    longDescriptionErrors,
    startDateErrors,
    githubLinkErrors,
    websiteLinkErrors,
    isTitleInvalid,
    isShortDescriptionInvalid,
    isLongDescriptionInvalid,
    isStartDateInvalid,
    isGithubLinkInvalid,
    isWebsiteLinkInvalid,
  };
}
