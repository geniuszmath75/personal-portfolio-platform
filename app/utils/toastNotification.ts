import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

const getToast = () => useToast();

/**
 * Displays an error toast message at the top of the screen.
 * @param message - Text content of the toast.
 */
export function showErrorToast(message: string) {
  const $toast = getToast();
  $toast.error(message, {
    position: "top",
    duration: 5000,
    dismissible: true,
  });
}

/**
 * Displays a success toast message at the top of the screen.
 * @param message - Text content of the toast.
 */
export function showSuccessToast(message: string) {
  const $toast = getToast();
  $toast.success(message, {
    position: "top",
    duration: 5000,
    dismissible: true,
  });
}

/**
 * Displays a warning toast message at the top of the screen.
 * @param message - Text content of the toast.
 */
export function showWarningToast(message: string) {
  const $toast = getToast();
  $toast.warning(message, {
    position: "top",
    duration: 5000,
    dismissible: true,
  });
}
