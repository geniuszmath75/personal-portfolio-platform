export function usePasswordVisibility() {
  /**
   * Variable to track if the password is visible or not
   */
  const isPasswordVisible = ref(false);

  /**
   * Toggle the visibility of the password
   */
  const toggleVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
  };

  return {
    isPasswordVisible,
    toggleVisibility,
  };
}
