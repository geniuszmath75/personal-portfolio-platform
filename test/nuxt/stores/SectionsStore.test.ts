import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import { setActivePinia } from "pinia";
import { createTestPinia } from "~~/test/setup";
import { useSectionsStore } from "~/stores/sectionsStore";
import type { ValidatedSection } from "~/utils/validateSection";
import { BlockKind, ISectionType, UploadCategory } from "~~/shared/types/enums";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { ParagraphBlock } from "~~/shared/types";
import { showErrorToast } from "~/utils/toastNotification";
import { handleError } from "~/utils/handleError";

vi.mock("~/utils/toastNotification", () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock("~/utils/handleError", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/utils/handleError")>();
  return {
    ...actual,
    handleError: vi.fn(),
  };
});

mockNuxtImport("useRuntimeConfig", (original) => {
  return () => {
    const config = original();
    return {
      ...config,
      public: {
        ...config.public,
        baseApiPath: "/api/v1",
      },
    };
  };
});

// Auto-imported `$fetch` is not the same binding as `globalThis.$fetch`,
// so vi.stubGlobal no longer works under Vitest / test-utils v4.
const { $fetchMock } = vi.hoisted(() => ({
  $fetchMock: vi.fn(),
}));

mockNuxtImport("$fetch", () => $fetchMock);

describe("sectionsStore", () => {
  const mockParagraphBlock: ParagraphBlock = {
    kind: BlockKind.PARAGRAPH,
    paragraphs: ["Section content"],
  };

  const mockSections: ValidatedSection[] = [
    {
      _id: "1",
      slug: "hero",
      title: "Hero",
      blocks: [mockParagraphBlock],
      type: ISectionType.HERO,
      order: 2,
    },
    {
      _id: "2",
      slug: "skills",
      title: "Skills",
      blocks: [
        {
          kind: BlockKind.GROUP,
          header: "Skills",
          items: [{ icon: "icon-vue.svg", label: "Vue" }],
        },
      ],
      type: ISectionType.SKILLS,
      order: 3,
    },
    {
      _id: "3",
      slug: "contact",
      title: "Contact",
      blocks: [
        {
          kind: BlockKind.BUTTON,
          buttons: ["Email me"],
        },
      ],
      type: ISectionType.CONTACT,
      order: 1,
    },
  ];

  const mockAboutSection: ValidatedSection = {
    _id: "4",
    slug: "about",
    title: "About me",
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["About me description"],
      },
    ],
    type: ISectionType.ABOUT_ME,
    order: 4,
  };

  beforeEach(() => {
    setActivePinia(createTestPinia());
    $fetchMock.mockReset();
    vi.mocked(handleError).mockClear();
  });

  it("should have default state", () => {
    const store = useSectionsStore();
    expect(store.sections).toEqual([]);
    expect(store.sectionDetails).toBeNull();
  });

  it("should 'setSections' updates state", () => {
    const store = useSectionsStore();

    store.setSections(mockSections);
    expect(store.sections).toEqual(mockSections);
  });

  it("should 'setSectionDetails' updates state", () => {
    const store = useSectionsStore();

    store.setSectionDetails(mockAboutSection);
    expect(store.sectionDetails).toEqual(mockAboutSection);
  });

  it("should 'orderedSections' sorts sections by order", () => {
    const store = useSectionsStore();

    store.setSections(mockSections);
    const ordered = store.orderedSections.map((s: ValidatedSection) => s.title);

    expect(ordered).toEqual(["Contact", "Hero", "Skills"]);
  });

  it("should 'fetchSections' set sections from API response", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    $fetchMock.mockResolvedValue({ sections: mockSections });

    await store.fetchSections();

    expect($fetchMock).toHaveBeenCalledWith("/api/v1/sections");
    expect(store.sections).toEqual(mockSections);
  });

  it("should 'fetchSections' handles errors gracefully", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    $fetchMock.mockRejectedValue(new Error("Network error"));

    await store.fetchSections();

    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Failed to fetch sections",
    );
    expect(store.sections).toEqual([]);
  });

  it("should 'fetchSection' set sectionDetails from API response", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    $fetchMock.mockResolvedValue({ section: mockAboutSection });

    await store.fetchSection("about-me");

    expect($fetchMock).toHaveBeenCalledWith("/api/v1/sections/about-me");
    expect(store.sectionDetails).toEqual(mockAboutSection);
  });

  it("should 'fetchSection' handles network errors gracefully", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    $fetchMock.mockRejectedValue(new Error("Network error"));

    await store.fetchSection("about-me");

    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Failed to fetch section details",
    );
    expect(store.sectionDetails).toBeNull();
  });

  it("should 'fetchSection' rethrow HTTP errors as fatal page errors", async () => {
    const store = useSectionsStore();
    const httpError = {
      statusCode: 404,
      data: { message: "Section with slug 'missing' not found." },
    };

    $fetchMock.mockRejectedValue(httpError);

    await expect(store.fetchSection("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(handleError).not.toHaveBeenCalled();
    expect(store.sectionDetails).toBeNull();
  });

  describe("getBlockElementsByKind", () => {
    it("should return undefined when sectionDetails is null", () => {
      const store = useSectionsStore();
      store.sectionDetails = null;

      const result = store.getBlockElementsByKind(BlockKind.IMAGE);
      expect(result).toBeUndefined();
    });

    it("should return block element matching the specified kind", () => {
      const store = useSectionsStore();
      const mockBlock: ParagraphBlock = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Hello"],
      };
      store.sectionDetails = {
        _id: "4",
        order: 1,
        slug: "about-me",
        type: ISectionType.ABOUT_ME,
        blocks: [mockBlock],
      };

      const result = store.getBlockElementsByKind(BlockKind.PARAGRAPH);
      expect(result).toEqual(mockBlock);
    });

    it("should return undefined when kind does not match any block", () => {
      const store = useSectionsStore();
      const mockBlock: ParagraphBlock = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Hello"],
      };
      store.sectionDetails = {
        _id: "4",
        order: 1,
        slug: "about-me",
        type: ISectionType.ABOUT_ME,
        blocks: [mockBlock],
      };

      const result = store.getBlockElementsByKind(BlockKind.IMAGE);
      expect(result).toBeUndefined();
    });
  });

  describe("uploadSectionImage", () => {
    const mockFile = new File(["content"], "section.png", {
      type: "image/png",
    });
    const mockUrl = "/uploads/sections/section.png";
    const mockResponse = {
      success: true,
      data: {
        url: mockUrl,
        filename: "section.png",
        size: 1024,
        mimetype: "image/png",
      },
    };

    it("should upload file and return URL on success", async () => {
      const store = useSectionsStore();

      $fetchMock.mockResolvedValue(mockResponse);

      const result = await store.uploadSectionImage(mockFile);

      expect($fetchMock).toHaveBeenCalledWith("/upload/image", {
        baseURL: "/api/v1",
        method: "POST",
        credentials: "include",
        body: expect.any(FormData),
        query: { category: UploadCategory.SECTIONS },
      });
      expect(result).toBe(mockUrl);
    });

    it("should return null on failure", async () => {
      const store = useSectionsStore();

      $fetchMock.mockRejectedValue(new Error("Upload failed"));

      const result = await store.uploadSectionImage(mockFile);

      expect(result).toBeNull();
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        "Failed to upload section image",
      );
    });

    describe("createSection", () => {
      const mockMetadata = {
        title: "New Hero",
        slug: "new-hero",
        type: ISectionType.HERO,
        order: 2,
      };

      const mockBlocks: Block[] = [
        {
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["Hello"],
        },
      ];

      const mockCreatedSection: ValidatedSection = {
        _id: "new-id",
        slug: "new-hero",
        title: "New Hero",
        type: ISectionType.HERO,
        order: 2,
        blocks: mockBlocks,
      };

      it("should clone deeply reactive blocks when building the write payload", async () => {
        const store = useSectionsStore();
        const reactiveBlocks = reactive([
          {
            kind: BlockKind.PARAGRAPH,
            paragraphs: ["Hello from reactive state"],
          },
        ]) as Block[];

        $fetchMock.mockResolvedValue({ section: mockCreatedSection });

        const result = await store.createSection(
          mockMetadata,
          reactiveBlocks,
          new Map(),
        );

        expect(result).toBe(true);
        expect($fetchMock).toHaveBeenCalledWith(
          "/sections",
          expect.objectContaining({
            body: expect.objectContaining({
              blocks: [
                {
                  kind: BlockKind.PARAGRAPH,
                  paragraphs: ["Hello from reactive state"],
                },
              ],
            }),
          }),
        );
      });

      it("should upload pending images and create section successfully", async () => {
        const store = useSectionsStore();
        const imageFile = new File(["content"], "hero.png", {
          type: "image/png",
        });
        const blocks: Block[] = [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "", altText: "Hero image" }],
          },
        ];
        const pendingImages = new Map([
          [
            0,
            {
              file: imageFile,
              altText: "Hero image",
            },
          ],
        ]);

        vi.spyOn(store, "uploadSectionImage").mockResolvedValue(
          "/uploads/sections/hero.png",
        );
        $fetchMock.mockResolvedValue({ section: mockCreatedSection });

        const result = await store.createSection(
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect($fetchMock).toHaveBeenCalledWith(
          "/sections",
          expect.objectContaining({
            baseURL: "/api/v1",
            method: "POST",
            credentials: "include",
            body: {
              title: "New Hero",
              slug: "new-hero",
              type: ISectionType.HERO,
              order: 2,
              blocks: [
                {
                  kind: BlockKind.IMAGE,
                  images: [
                    {
                      srcPath: "/uploads/sections/hero.png",
                      altText: "Hero image",
                    },
                  ],
                },
              ],
            },
          }),
        );
      });

      it("should omit empty title from payload", async () => {
        const store = useSectionsStore();

        $fetchMock.mockResolvedValue({ section: mockCreatedSection });

        await store.createSection(
          { ...mockMetadata, title: "  " },
          mockBlocks,
          new Map(),
        );

        expect($fetchMock).toHaveBeenCalledWith(
          "/sections",
          expect.objectContaining({
            body: expect.not.objectContaining({ title: expect.anything() }),
          }),
        );
      });

      it("should reuse existing srcPath when pending image has no file", async () => {
        const store = useSectionsStore();
        const blocks: Block[] = [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "", altText: "Existing image" }],
          },
        ];
        const pendingImages = new Map([
          [
            0,
            {
              file: null,
              altText: "Existing image",
              srcPath: "/uploads/sections/existing.png",
            },
          ],
        ]);

        const uploadSpy = vi.spyOn(store, "uploadSectionImage");
        $fetchMock.mockResolvedValue({ section: mockCreatedSection });

        const result = await store.createSection(
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect(uploadSpy).not.toHaveBeenCalled();
        expect($fetchMock).toHaveBeenCalledWith(
          "/sections",
          expect.objectContaining({
            body: expect.objectContaining({
              blocks: [
                {
                  kind: BlockKind.IMAGE,
                  images: [
                    {
                      srcPath: "/uploads/sections/existing.png",
                      altText: "Existing image",
                    },
                  ],
                },
              ],
            }),
          }),
        );
      });

      it("should return false when image block has no srcPath after resolution", async () => {
        const store = useSectionsStore();
        const blocks: Block[] = [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "", altText: "Missing image" }],
          },
        ];

        const result = await store.createSection(
          mockMetadata,
          blocks,
          new Map(),
        );

        expect(result).toBe(false);
        expect(showErrorToast).toHaveBeenCalledWith(
          "Image block requires an uploaded image",
        );
      });

      it("should return false when image upload fails", async () => {
        const store = useSectionsStore();
        const pendingImages = new Map([
          [
            0,
            {
              file: new File(["content"], "hero.png", { type: "image/png" }),
              altText: "Hero image",
            },
          ],
        ]);

        vi.spyOn(store, "uploadSectionImage").mockResolvedValue(null);

        const result = await store.createSection(
          mockMetadata,
          [
            {
              kind: BlockKind.IMAGE,
              images: [{ srcPath: "", altText: "Hero image" }],
            },
          ],
          pendingImages,
        );

        expect(result).toBe(false);
      });

      it("should handle API errors gracefully", async () => {
        const store = useSectionsStore();

        $fetchMock.mockRejectedValue(new Error("Network error"));

        const result = await store.createSection(
          mockMetadata,
          mockBlocks,
          new Map(),
        );

        expect(result).toBe(false);
        expect(handleError).toHaveBeenCalledWith(
          expect.any(Error),
          "Failed to create section",
        );
      });
    });

    describe("updateSection", () => {
      const mockMetadata = {
        title: "Updated Hero",
        slug: "updated-hero",
        type: ISectionType.HERO,
        order: 2,
      };

      const mockBlocks: Block[] = [
        {
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["Hello"],
        },
      ];

      const mockUpdatedSection: ValidatedSection = {
        _id: "section-id",
        slug: "updated-hero",
        title: "Updated Hero",
        type: ISectionType.HERO,
        order: 2,
        blocks: mockBlocks,
      };

      it("should upload pending images and update section successfully", async () => {
        const store = useSectionsStore();
        const imageFile = new File(["content"], "hero.png", {
          type: "image/png",
        });
        const blocks: Block[] = [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "", altText: "Hero image" }],
          },
        ];
        const pendingImages = new Map([
          [
            0,
            {
              file: imageFile,
              altText: "Hero image",
            },
          ],
        ]);

        vi.spyOn(store, "uploadSectionImage").mockResolvedValue(
          "/uploads/sections/hero.png",
        );
        $fetchMock.mockResolvedValue({ section: mockUpdatedSection });

        const result = await store.updateSection(
          "section-id",
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect($fetchMock).toHaveBeenCalledWith(
          "/sections/section-id",
          expect.objectContaining({
            baseURL: "/api/v1",
            method: "PUT",
            credentials: "include",
            body: {
              title: "Updated Hero",
              slug: "updated-hero",
              type: ISectionType.HERO,
              order: 2,
              blocks: [
                {
                  kind: BlockKind.IMAGE,
                  images: [
                    {
                      srcPath: "/uploads/sections/hero.png",
                      altText: "Hero image",
                    },
                  ],
                },
              ],
            },
          }),
        );
      });

      it("should reuse existing srcPath when pending image has no file", async () => {
        const store = useSectionsStore();
        const blocks: Block[] = [
          {
            kind: BlockKind.IMAGE,
            images: [{ srcPath: "", altText: "Existing image" }],
          },
        ];
        const pendingImages = new Map([
          [
            0,
            {
              file: null,
              altText: "Existing image",
              srcPath: "/uploads/sections/existing.png",
            },
          ],
        ]);

        const uploadSpy = vi.spyOn(store, "uploadSectionImage");
        $fetchMock.mockResolvedValue({ section: mockUpdatedSection });

        const result = await store.updateSection(
          "section-id",
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect(uploadSpy).not.toHaveBeenCalled();
        expect($fetchMock).toHaveBeenCalledWith(
          "/sections/section-id",
          expect.objectContaining({
            body: expect.objectContaining({
              blocks: [
                {
                  kind: BlockKind.IMAGE,
                  images: [
                    {
                      srcPath: "/uploads/sections/existing.png",
                      altText: "Existing image",
                    },
                  ],
                },
              ],
            }),
          }),
        );
      });

      it("should return false when image upload fails", async () => {
        const store = useSectionsStore();
        const pendingImages = new Map([
          [
            0,
            {
              file: new File(["content"], "hero.png", { type: "image/png" }),
              altText: "Hero image",
            },
          ],
        ]);

        vi.spyOn(store, "uploadSectionImage").mockResolvedValue(null);

        const result = await store.updateSection(
          "section-id",
          mockMetadata,
          [
            {
              kind: BlockKind.IMAGE,
              images: [{ srcPath: "", altText: "Hero image" }],
            },
          ],
          pendingImages,
        );

        expect(result).toBe(false);
      });

      it("should handle API errors gracefully", async () => {
        const store = useSectionsStore();

        $fetchMock.mockRejectedValue(new Error("Network error"));

        const result = await store.updateSection(
          "section-id",
          mockMetadata,
          mockBlocks,
          new Map(),
        );

        expect(result).toBe(false);
        expect(handleError).toHaveBeenCalledWith(
          expect.any(Error),
          "Failed to update section",
        );
      });
    });
  });
});
