import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { useSectionsStore } from "../../../app/stores/sectionsStore";
import type { ValidatedSection } from "../../../app/utils/validateSection";
import { ISectionType } from "../../../shared/types/enums";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

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
  const mockSections: ValidatedSection[] = [
    {
      _id: "1",
      slug: "hero",
      title: "Hero",
      blocks: [],
      type: ISectionType.HERO,
      order: 2,
    },
    {
      _id: "2",
      slug: "skills",
      title: "Skills",
      blocks: [],
      type: ISectionType.SKILLS,
      order: 3,
    },
    {
      _id: "3",
      slug: "contact",
      title: "Contact",
      blocks: [],
      type: ISectionType.CONTACT,
      order: 1,
    },
  ];

  const mockAboutSection: ValidatedSection = {
    _id: "4",
    slug: "about",
    title: "About me",
    blocks: [],
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

      const result = store.getBlockElementsByKind("IMAGE");
      expect(result).toBeUndefined();
    });

    it("should return block element matching the specified kind", () => {
      const store = useSectionsStore();
      const mockBlock = { kind: "PARAGRAPH", paragraphs: ["Hello"] };
      store.sectionDetails = { blocks: [mockBlock] };

      const result = store.getBlockElementsByKind("PARAGRAPH");
      expect(result).toEqual(mockBlock);
    });

    it("should return undefined when kind does not match any block", () => {
      const store = useSectionsStore();
      const mockBlock = { kind: "PARAGRAPH", paragraphs: ["Hello"] };
      store.sectionDetails = { blocks: [mockBlock] };

      const result = store.getBlockElementsByKind("IMAGE");
      expect(result).toBeUndefined();
    });
  });
});
