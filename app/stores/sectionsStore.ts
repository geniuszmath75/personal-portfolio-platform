import type { SectionsResponse, SectionResponse } from "~~/shared/types";

export const useSectionsStore = defineStore("sections", {
  state: () => {
    return {
      /**
       * List of main page sections
       */
      sections: [] as ValidatedSection[],

      /**
       * Details of a single section
       */
      sectionDetails: null as ValidatedSection | null,
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
    /**
     * Update sections list
     * @param sectionsArray - updated list of sections
     */
    setSections(sectionsArray: ValidatedSection[]): void {
      this.sections = sectionsArray;
    },

    /**
     * Update selected section details
     * @param section - updated section details
     */
    setSectionDetails(section: ValidatedSection): void {
      this.sectionDetails = section;
    },

    /**
     * Retrieves block elements of a specific kind from section
     * details
     * @param kind - kind of block elements to retrieve
     * @returns block elements of the specified kind, or undefined
     * if not found
     */
    getBlockElementsByKind<K extends BlockKind>(
      kind: K,
    ): Extract<Block, { kind: K }> | undefined {
      const blocks = this.sectionDetails?.blocks ?? [];
      return blocks.find(
        (b): b is Extract<Block, { kind: K }> => b.kind === kind,
      );
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

    /**
     * Fetches a single section by slug and sets the response to 'sectionDetails' state
     * @param slug - slug of the section to fetch
     * @async
     */
    async fetchSection(slug: string): Promise<void> {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        const res = await $fetch<SectionResponse>(
          `${baseApiPath}/sections/${slug}`,
        );

        const validatedSection = sectionSchema.parse(res.section);

        this.setSectionDetails(validatedSection);
      } catch (error) {
        console.error("Failed to fetch section details:", error);
      }
    },
  },
});
