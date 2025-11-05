import type { SectionsResponse } from "~~/shared/types";

export const useSectionsStore = defineStore("sections", {
  state: () => {
    return {
      /**
       * List of main page sections
       */
      sections: [] as ValidatedSection[],
    };
  },
  getters: {
    /**
     * Sections ordered by 'order' property
     *
     * @param state - store state
     * @returns array of sections ordered in the way they should appear on page
     */
    orderedSections(state): ValidatedSection[] {
      return state.sections.slice().sort((a, b) => a.order - b.order);
    },
  },
  actions: {
    setSections(sectionsArray: ValidatedSection[]): void {
      this.sections = sectionsArray;
    },
    /**
     * Fetches sections and sets the response to 'sections' state
     * @async
     */
    async fetchSections(): Promise<void> {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        const res = await $fetch<SectionsResponse>(`${baseApiPath}/sections`);

        const validatedSections = res.sections.map((section) =>
          sectionSchema.parse(section),
        );

        this.setSections(validatedSections);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      }
    },
  },
});
