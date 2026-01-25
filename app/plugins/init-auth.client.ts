export default defineNuxtPlugin({
  name: "init-auth",
  parallel: true,
  async setup() {
    const authStore = useAuthStore();
    const { loggedIn } = storeToRefs(authStore);

    if (!loggedIn.value) {
      await authStore.checkAuth();
    }
  },
});
