import type { SectionsResponse, SectionResponse } from "~~/shared/types";
import { BlockKind, UploadCategory } from "~~/shared/types/enums";
import type {
  SectionMetadataFormState,
  SectionPendingImageState,
} from "~/types/sectionForm";
import { showErrorToast } from "~/utils/toastNotification";

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

    /**
     * Uploads a single image file for a section block.
     *
     * @param file - image file selected in the section builder
     * @returns public URL of the uploaded image or null on failure
     * @async
     */
    async uploadSectionImage(file: File): Promise<string | null> {
      const { baseApiPath } = useRuntimeConfig().public;

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await $fetch("/upload/image", {
          baseURL: baseApiPath,
          method: "POST",
          credentials: "include",
          body: formData,
          query: { category: UploadCategory.SECTIONS },
        });

        const validated = imageCreationResponseSchema.parse(res);
        return validated.data.url;
      } catch (error) {
        handleError(error, "Failed to upload section image");
        return null;
      }
    },

    /**
     * Uploads pending images and builds the create/update section request body.
     *
     * @param metadata - validated section metadata from step 1
     * @param blocks - draft blocks from the builder
     * @param pendingImages - image files deferred until submit, keyed by block index
     * @returns request payload, or null when image resolution fails
     * @async
     */
    async buildSectionWritePayload(
      metadata: SectionMetadataFormState,
      blocks: Block[],
      pendingImages: Map<number, SectionPendingImageState>,
    ): Promise<{
      slug: string;
      type: SectionMetadataFormState["type"];
      order: number;
      blocks: Block[];
      title?: string;
    } | null> {
      const resolvedBlocks = structuredClone(toRaw(blocks));

      // Upload deferred image files in parallel; reuse existing srcPath when no file is pending.
      const uploadTasks = Array.from(pendingImages.entries()).map(
        async ([index, pending]) => {
          if (!pending.file) {
            return { index, url: pending.srcPath ?? null };
          }

          const url = await this.uploadSectionImage(pending.file);
          return { index, url };
        },
      );

      const uploadResults = await Promise.all(uploadTasks);

      // Merge uploaded URLs back into image blocks at their original indices.
      for (const { index, url } of uploadResults) {
        if (!url) {
          showErrorToast("Failed to upload section image");
          return null;
        }

        const block = resolvedBlocks[index];

        if (block?.kind === BlockKind.IMAGE) {
          const pending = pendingImages.get(index);
          block.images[0] = {
            srcPath: url,
            altText: pending?.altText ?? block.images[0]?.altText ?? "",
          };
        }
      }

      // Catch image blocks that still have no srcPath after upload (e.g. never selected in editor).
      for (const block of resolvedBlocks) {
        if (
          block.kind === BlockKind.IMAGE &&
          !block.images[0]?.srcPath?.trim()
        ) {
          showErrorToast("Image block requires an uploaded image");
          return null;
        }
      }

      const trimmedTitle = metadata.title.trim();

      return {
        slug: metadata.slug.trim(),
        type: metadata.type,
        order: metadata.order,
        blocks: resolvedBlocks,
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
      };
    },

    /**
     * Uploads pending image blocks and creates a new section via POST /sections.
     *
     * @param metadata - validated section metadata from step 1
     * @param blocks - draft blocks from the builder
     * @param pendingImages - image files deferred until submit, keyed by block index
     * @returns true on success, false otherwise
     * @async
     */
    async createSection(
      metadata: SectionMetadataFormState,
      blocks: Block[],
      pendingImages: Map<number, SectionPendingImageState>,
    ): Promise<boolean> {
      const { baseApiPath } = useRuntimeConfig().public;

      try {
        const payload = await this.buildSectionWritePayload(
          metadata,
          blocks,
          pendingImages,
        );

        if (!payload) {
          return false;
        }

        await $fetch("/sections", {
          baseURL: baseApiPath,
          method: "POST",
          credentials: "include",
          body: payload,
        });

        return true;
      } catch (error) {
        handleError(error, "Failed to create section");
        return false;
      }
    },

    /**
     * Uploads pending image blocks and updates an existing section via PUT /sections/:id.
     *
     * @param sectionId - Mongo `_id` of the section to update
     * @param metadata - validated section metadata from step 1
     * @param blocks - draft blocks from the builder
     * @param pendingImages - image files deferred until submit, keyed by block index
     * @returns true on success, false otherwise
     * @async
     */
    async updateSection(
      sectionId: string,
      metadata: SectionMetadataFormState,
      blocks: Block[],
      pendingImages: Map<number, SectionPendingImageState>,
    ): Promise<boolean> {
      const { baseApiPath } = useRuntimeConfig().public;

      try {
        const payload = await this.buildSectionWritePayload(
          metadata,
          blocks,
          pendingImages,
        );

        if (!payload) {
          return false;
        }

        await $fetch(`/sections/${sectionId}`, {
          baseURL: baseApiPath,
          method: "PUT",
          credentials: "include",
          body: payload,
        });

        return true;
      } catch (error) {
        handleError(error, "Failed to update section");
        return false;
      }
    },
  },
});
