import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia } from "pinia";
import { createTestPinia } from "~~/test/setup";
import { useSectionsStore } from "~/stores/sectionsStore";
import type { ValidatedSection } from "~/utils/validateSection";
import { BlockKind, ISectionType, UploadCategory } from "~~/shared/types/enums";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { ParagraphBlock } from "~~/shared/types";
import { showErrorToast } from "~/utils/toastNotification";

vi.mock("~/utils/toastNotification", () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

// Mock 'useRuntimeConfig'
mockNuxtImport("useRuntimeConfig", () => {
  return () => {
    return {
      public: {
        baseApiPath: "/api/v1",
      },
    };
  };
});

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
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({ sections: mockSections }),
    );

    await store.fetchSections();

    expect($fetch).toHaveBeenCalledWith("/api/v1/sections");
    expect(store.sections).toEqual(mockSections);
  });

  it("should 'fetchSections' handles errors gracefully", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await store.fetchSections();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch sections:",
      expect.any(Error),
    );
    expect(store.sections).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it("should 'fetchSection' set sectionDetails from API response", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockResolvedValue({ section: mockAboutSection }),
    );

    await store.fetchSection("about-me");

    expect($fetch).toHaveBeenCalledWith("/api/v1/sections/about-me");
    expect(store.sectionDetails).toEqual(mockAboutSection);
  });

  it("should 'fetchSection' handles errors gracefully", async () => {
    const store = useSectionsStore();

    // Mock $fetch
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await store.fetchSection("about-me");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch section details:",
      expect.any(Error),
    );
    expect(store.sectionDetails).toBeNull();

    consoleErrorSpy.mockRestore();
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

      vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(mockResponse));

      const result = await store.uploadSectionImage(mockFile);

      expect($fetch).toHaveBeenCalledWith("/upload/image", {
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

      vi.stubGlobal(
        "$fetch",
        vi.fn().mockRejectedValue(new Error("Upload failed")),
      );

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await store.uploadSectionImage(mockFile);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
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
        vi.stubGlobal(
          "$fetch",
          vi.fn().mockResolvedValue({ section: mockCreatedSection }),
        );

        const result = await store.createSection(
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect($fetch).toHaveBeenCalledWith(
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

        vi.stubGlobal(
          "$fetch",
          vi.fn().mockResolvedValue({ section: mockCreatedSection }),
        );

        await store.createSection(
          { ...mockMetadata, title: "  " },
          mockBlocks,
          new Map(),
        );

        expect($fetch).toHaveBeenCalledWith(
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
        vi.stubGlobal(
          "$fetch",
          vi.fn().mockResolvedValue({ section: mockCreatedSection }),
        );

        const result = await store.createSection(
          mockMetadata,
          blocks,
          pendingImages,
        );

        expect(result).toBe(true);
        expect(uploadSpy).not.toHaveBeenCalled();
        expect($fetch).toHaveBeenCalledWith(
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

        vi.stubGlobal(
          "$fetch",
          vi.fn().mockRejectedValue(new Error("Network error")),
        );

        const consoleErrorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const result = await store.createSection(
          mockMetadata,
          mockBlocks,
          new Map(),
        );

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });
    });
  });
});
