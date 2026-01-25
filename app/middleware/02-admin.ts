import { UserSchemaRole } from "~~/server/types/enums";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  if (
    to.path !== "/admin/login" &&
    (!authStore.loggedIn || authStore.user?.role !== UserSchemaRole.ADMIN)
  ) {
    return navigateTo("/auth/login");
  }
});
