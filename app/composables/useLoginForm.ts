import useVuelidate from "@vuelidate/core";
import { UserSchemaRole } from "~~/server/types/enums";

export function useLoginForm(credentials: { email: string; password: string }) {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  /**
   * Login form credentials
   */
  const formCredentials = ref({ ...credentials });

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
  const submitLogin = async (): Promise<void> => {
    // Validate the form before proceeding
    const isValid = await validate();
    if (!isValid) return;

    try {
      // Attempt to log in with the provided credentials
      const status = await authStore.login(formCredentials.value);

      //
      if (status) {
        showSuccessToast("Login successful!");
        if (user.value?.role === UserSchemaRole.GUEST) {
          await navigateTo("/");
        }
        if (user.value?.role === UserSchemaRole.ADMIN) {
          await navigateTo("/admin/dashboard");
        }
      }
    } catch (error) {
      handleError(error, "Login failed");
    }
  };

  return {
    formCredentials,
    submitLogin,

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
