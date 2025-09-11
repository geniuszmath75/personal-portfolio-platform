import type { ISection as Section, SectionsResponse } from "~~/shared/types";

export const useSectionsStore = defineStore("sections", {
  state: () => {
    return {
      /**
       * List of main page sections
       */
      sections: [] as Section[],
    };
  },
  getters: {
    /**
     * Sections ordered by 'order' property
     *
     * @param state - store state
     * @returns array of sections ordered in the way they should appear on page
     */
    orderedSections(state): Section[] {
      return state.sections.slice().sort((a, b) => a.order - b.order);
    },
  },
  actions: {
    setSections(sectionsArray: Section[]): void {
      this.sections = sectionsArray;
    },
    /**
     * Fetches sections and sets the response to 'sections' state
     * @async
     */
    async fetchSections(): Promise<void> {
      const { finishLoading, startLoading } = useLoadingStore();
      const { baseApiPath } = useRuntimeConfig().public;
      startLoading();
      try {
        const res = await $fetch<SectionsResponse>(`${baseApiPath}/sections`);
        this.setSections(res.sections);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        finishLoading();
      }
    },
  },
});
