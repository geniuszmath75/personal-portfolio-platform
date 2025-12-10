import useVuelidate from "@vuelidate/core";

export function useLoginForm(credentials: { email: string; password: string }) {
  const { baseApiPath } = useRuntimeConfig().public;

  /**
   * Login form credentials
   */
  const formCredentials = ref({ ...credentials });

  /**
   * Indicates if the login request is in progress
   */
  const loading = ref(false);

  /**
   * Vuelidate validation setup
   */
  const v$ = useVuelidate(loginValidationRules, formCredentials);

  /**
   * Validates the entire form
   * @returns Promise indicating if the form is valid
   */
  const validate = (): Promise<boolean> => v$.value.$validate();

  /**
   * Marks specified fields as touched to trigger validation messages
   * @param field - The field to touch
   */
  const touchFields = (field: "email" | "password") => {
    v$.value[field].$touch();
  };

  /**
   * Email field validation errors
   */
  const emailErrors = computed(() => v$.value.email.$errors);

  /**
   * Password field validation errors
   */
  const passwordErrors = computed(() => v$.value.password.$errors);

  /**
   * Indicates if the email field is invalid
   */
  const isEmailInvalid = computed(() => v$.value.email.$error);

  /**
   * Indicates if the password field is invalid
   */
  const isPasswordInvalid = computed(() => v$.value.password.$error);

  /**
   * Performs the login operation
   * Checks validation, sends login request, and handles response
   *
   * @async
   */
  const login = async (): Promise<void> => {
    // Validate the form before proceeding
    const isValid = await validate();
    if (!isValid) return;

    try {
      loading.value = true;

      // Send login request to the API
      const res = await $fetch<LoginResponse>(`${baseApiPath}/auth/login`, {
        method: "POST",
        body: JSON.stringify(formCredentials.value),
      });

      // Validate the response schema
      const validatedLoginResponse = loginResponseSchema.parse(res);
      console.log("Login successful:", validatedLoginResponse.user);

      showSuccessToast("Login successful!");
      await navigateTo("/admin/dashboard");
    } catch (error) {
      handleError(error, "Login failed");
    } finally {
      loading.value = false;
    }
  };

  return {
    formCredentials,
    loading,
    login,

    // Validation API
    validate,
    touchFields,

    // Field validation
    emailErrors,
    passwordErrors,
    isEmailInvalid,
    isPasswordInvalid,
  };
}
