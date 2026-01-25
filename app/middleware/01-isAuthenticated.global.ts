export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  await authStore.checkAuth();
});
