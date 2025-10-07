import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

const $toast = useToast();

/**
 * Displays an error toast message at the top of the screen.
 * @param message - Text content of the toast.
 */
export function showErrorToast(message: string) {
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
  $toast.warning(message, {
    position: "top",
    duration: 5000,
    dismissible: true,
  });
}
