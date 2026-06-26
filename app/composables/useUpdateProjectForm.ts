import useVuelidate from "@vuelidate/core";
import type { UploadFileInfo } from "~/types/components";
import type { CreateProjectForm } from "~~/shared/types";

export function useUpdateProjectForm(projectId: string) {
  const projectsStore = useProjectsStore();

  // Prefill form from store — projectDetails must already be fetched
  const details = projectsStore.projectDetails;

  const form = ref<CreateProjectForm>({
    title: details?.title ?? "",
    shortDescription: details?.shortDescription ?? "",
    longDescription: details?.longDescription ?? "",
    startDate: details?.startDate.toISOString().split("T")[0] ?? "",
    endDate: details?.endDate?.toISOString().split("T")[0] ?? "",
    status: details?.status ?? ProjectStatusType.COMPLETED,
    projectSource: details?.projectSource ?? ProjectSourceType.HOBBY,
    githubLink: details?.githubLink ?? "",
    websiteLink: details?.websiteLink ?? "",
    technologies: [...(details?.technologies ?? [])],
    gainedExperience: [...(details?.gainedExperience ?? [])],
  });

  /**
   * Main image state synced from FileUpload @change.
   * null — user removed the image from UI.
   * { file: null, srcPath } — keep existing image from DB.
   * { file: File, altText } — new upload replacing the current image.
   */
  const pendingMainImage = ref<{
    file: File | null;
    altText: string;
    srcPath?: string;
  } | null>(
    details?.mainImage
      ? {
          file: null,
          altText: details.mainImage.altText,
          srcPath: details.mainImage.srcPath,
        }
      : null,
  );

  /**
   * Mix of new files (file !== null) and kept existing images (file === null, srcPath present).
   * Initialized from DB — all existing otherImages are kept by default.
   */
  const pendingOtherImages = ref<
    { file: File | null; altText: string; srcPath?: string }[]
  >(
    details?.otherImages?.map((img) => ({
      file: null,
      altText: img.altText,
      srcPath: img.srcPath,
    })) ?? [],
  );

  /**
   * True when the user selected a new main image that failed validation in FileUpload.
   */
  const isMainImageInvalid = ref(false);

  /**
   * Controlled file list for the main image FileUpload (edit mode prefill).
   * Synced via handleMainImageFileListUpdate on update:fileList.
   */
  const initialMainImageFileList = ref<UploadFileInfo[]>(
    details?.mainImage
      ? [
          {
            id: crypto.randomUUID(),
            name: details.mainImage.altText,
            status: "finished",
            percentage: 100,
            thumbnailUrl: details.mainImage.srcPath,
            altText: details.mainImage.altText,
            url: details.mainImage.srcPath,
            srcPath: details.mainImage.srcPath,
            file: null,
            type: null,
            errorMessage: null,
          },
        ]
      : [],
  );

  /**
   * Controlled file list for the additional images FileUpload (edit mode prefill).
   * Synced via handleOtherImagesFileListUpdate on update:fileList.
   */
  const initialOtherImagesFileList = ref<UploadFileInfo[]>(
    details?.otherImages?.map((img) => ({
      id: crypto.randomUUID(),
      name: img.altText,
      status: "finished",
      percentage: 100,
      thumbnailUrl: img.srcPath,
      altText: img.altText,
      url: img.srcPath,
      srcPath: img.srcPath,
      file: null,
      type: null,
      errorMessage: null,
    })) ?? [],
  );

  /**
   * Persists main image FileUpload state in controlled mode (update:fileList).
   */
  const handleMainImageFileListUpdate = (files: UploadFileInfo[]) => {
    initialMainImageFileList.value = files;
  };

  /**
   * Persists additional images FileUpload state in controlled mode (update:fileList).
   */
  const handleOtherImagesFileListUpdate = (files: UploadFileInfo[]) => {
    initialOtherImagesFileList.value = files;
  };

  /**
   * Called by FileUpload @change for the main image slot.
   * Maps UploadFileInfo entries to pendingMainImage, preserving srcPath
   * for existing images (file === null).
   *
   * @param files - current file list from the FileUpload component
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

    pendingMainImage.value = {
      file: file.file,
      altText: file.altText,
      ...(!file.file && file.srcPath ? { srcPath: file.srcPath } : {}),
    };

    isMainImageInvalid.value = false;
  };

  /**
   * Called by FileUpload @change for the additional images slot.
   * Replaces pendingOtherImages with the current FileUpload list,
   * preserving srcPath for existing images (file === null).
   *
   * @param files - current file list from the FileUpload component
   */
  const handleOtherImagesChange = (files: UploadFileInfo[]) => {
    pendingOtherImages.value = files
      .filter((f) => f.status !== "error")
      .map((f) => ({
        file: f.file ?? null,
        altText: f.altText,
        ...(!f.file && f.srcPath ? { srcPath: f.srcPath } : {}),
      }));
  };

  /**
   * Dynamic list helpers — identical to create form
   */
  const technologiesErrors = ref("");
  const gainedExperienceErrors = ref("");

  const addTechnology = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (form.value.technologies.includes(trimmed)) return;
    form.value.technologies.push(trimmed);
    technologiesErrors.value = "";
  };

  const removeTechnology = (index: number) => {
    form.value.technologies.splice(index, 1);
  };

  const addExperience = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (form.value.gainedExperience.includes(trimmed)) return;
    form.value.gainedExperience.push(trimmed);
    gainedExperienceErrors.value = "";
  };

  const removeExperience = (index: number) => {
    form.value.gainedExperience.splice(index, 1);
  };

  /**
   * Vuelidate — reuses the same rules as create form
   */
  const v$ = useVuelidate(createProjectValidationRules, form);
  const validate = () => v$.value.$validate();
  const touchField = (field: keyof typeof createProjectValidationRules) => {
    v$.value[field].$touch();
  };

  const titleErrors = computed(() => v$.value.title.$errors);
  const shortDescriptionErrors = computed(
    () => v$.value.shortDescription.$errors,
  );
  const longDescriptionErrors = computed(
    () => v$.value.longDescription.$errors,
  );
  const startDateErrors = computed(() => v$.value.startDate.$errors);
  const githubLinkErrors = computed(() => v$.value.githubLink.$errors);
  const websiteLinkErrors = computed(() => v$.value.websiteLink.$errors);
  const isTitleInvalid = computed(() => v$.value.title.$error);
  const isShortDescriptionInvalid = computed(
    () => v$.value.shortDescription.$error,
  );
  const isLongDescriptionInvalid = computed(
    () => v$.value.longDescription.$error,
  );
  const isStartDateInvalid = computed(() => v$.value.startDate.$error);
  const isGithubLinkInvalid = computed(() => v$.value.githubLink.$error);
  const isWebsiteLinkInvalid = computed(() => v$.value.websiteLink.$error);

  /**
   * Submit
   */
  const isSubmitting = ref(false);

  const submitUpdateProject = async () => {
    // 1. Validate text fields
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

    // 3. Validate images
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

    if (!pendingMainImage.value.file && !pendingMainImage.value.srcPath) {
      showErrorToast("Main image is required");
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

    // 4. Update project via store
    isSubmitting.value = true;
    try {
      const mainImageFile = pendingMainImage.value?.file
        ? {
            file: pendingMainImage.value.file,
            altText: pendingMainImage.value.altText,
          }
        : null;
      const existingMainImage = pendingMainImage.value.srcPath
        ? {
            srcPath: pendingMainImage.value.srcPath,
            altText: pendingMainImage.value.altText,
          }
        : {
            srcPath: "",
            altText: "",
          };

      const success = await projectsStore.updateProject(
        projectId,
        form.value,
        mainImageFile,
        existingMainImage,
        pendingOtherImages.value,
      );

      if (success) {
        showSuccessToast("Project updated successfully!");
        await navigateTo(`/projects/${projectId}`);
      }
    } catch (error) {
      handleError(error, "Failed to update project");
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    form,

    submitUpdateProject,
    handleMainImageChange,
    handleOtherImagesChange,

    initialMainImageFileList,
    initialOtherImagesFileList,
    isMainImageInvalid,
    handleMainImageFileListUpdate,
    handleOtherImagesFileListUpdate,

    technologiesErrors,
    gainedExperienceErrors,
    addTechnology,
    removeTechnology,
    addExperience,
    removeExperience,

    validate,
    touchField,
    isSubmitting,

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
