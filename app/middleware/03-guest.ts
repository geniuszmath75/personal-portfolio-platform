export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  if (to.path !== "/" && authStore.loggedIn) {
    return navigateTo("/");
  }
});
