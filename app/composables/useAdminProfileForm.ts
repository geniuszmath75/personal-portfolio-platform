import useVuelidate from "@vuelidate/core";

export function useAdminProfileForm() {
  /**
   * Edited admin profile fields
   */
  const editedData = ref({
    email: "",
    username: "",
    avatar: null as string | null,
  });

  /**
   * Fetched Admin profile fields data
   */
  const originalData = ref({
    email: "",
    username: "",
    avatar: null as string | null,
  });

  /**
   * Pending avatar file to upload (before SAVE)
   */
  const pendingAvatarFile = ref<File | null>(null);

  /**
   * Indicates if avatar file is invalid
   */
  const isAvatarInvalid = ref(false);

  /**
   * Vuelidate validation setup
   */
  const $v = useVuelidate(adminProfileValidationRules, editedData);

  /**
   * Validated the entire admin profile
   */
  const validate = () => $v.value.$validate();

  /**
   * Marks specified fields as touched to trigger validation messages
   * @param field - The field to touch
   */
  const touchFields = (field: "email" | "username") => {
    $v.value[field].$touch();
  };

  /**
   * Initialize form data and remember starting state
   */
  const initFormData = (data: typeof editedData.value) => {
    editedData.value = { ...data };
    originalData.value = { ...data };
    pendingAvatarFile.value = null;
  };

  /**
   * Resets edited data to original values
   */
  const resetToOriginal = () => {
    editedData.value = { ...originalData.value };
    pendingAvatarFile.value = null;
  };

  /**
   * Username field validation errors
   */
  const usernameErrors = computed(() => $v.value.username.$errors);

  /**
   * Email field validation errors
   */
  const emailErrors = computed(() => $v.value.email.$errors);

  /**
   * Indicates if the email field is invalid
   */
  const isEmailInvalid = computed(() => $v.value.email.$error);

  /**
   * Indicates if the username field is invalid
   */
  const isUsernameInvalid = computed(() => $v.value.username.$error);

  /**
   * Check if there are any changes while editing process
   */
  const hasChanges = computed(() => {
    return (
      editedData.value.username !== originalData.value.username ||
      editedData.value.email !== originalData.value.email ||
      editedData.value.avatar !== originalData.value.avatar ||
      pendingAvatarFile.value !== null
    );
  });

  /**
   * Get only the fields that have been changed
   * @returns object containing only modified fields
   */
  const getChangedFields = () => {
    const changed: Record<string, unknown> = {};

    if (editedData.value.username !== originalData.value.username) {
      changed.username = editedData.value.username;
    }
    if (editedData.value.email !== originalData.value.email) {
      changed.email = editedData.value.email;
    }
    if (editedData.value.avatar !== originalData.value.avatar) {
      changed.avatar = editedData.value.avatar ?? undefined;
    }

    return changed;
  };

  return {
    editedData,
    validate,
    touchFields,
    usernameErrors,
    emailErrors,
    isEmailInvalid,
    isUsernameInvalid,
    hasChanges,
    initFormData,
    resetToOriginal,
    pendingAvatarFile,
    isAvatarInvalid,
    getChangedFields,
  };
}
