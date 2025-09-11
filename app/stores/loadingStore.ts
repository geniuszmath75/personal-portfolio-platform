/**
 * Access to global loading state
 */
export const useLoadingStore = defineStore("loadingStore", {
  state: () => ({
    /**
     * Indicates if loading process is completed
     */
    loading: false,

    /**
     * Label displayed under loading spinner
     */
    label: "Loading...",
  }),
  actions: {
    startLoading(label = "Loading..."): void {
      this.loading = true;
      this.label = label;
    },
    finishLoading(): void {
      this.loading = false;
    },
  },
});
