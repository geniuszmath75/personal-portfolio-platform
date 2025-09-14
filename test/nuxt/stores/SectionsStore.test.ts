import { beforeEach, describe, expect, it, vi } from "vitest";
import { setActivePinia } from "pinia";
import { createTestPinia } from "../../setup";
import { useSectionsStore } from "../../../app/stores/sectionsStore";
import type { ISection } from "../../../shared/types";
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
  const mockSections: ISection[] = [
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

  beforeEach(() => {
    setActivePinia(createTestPinia());
  });

  it("should have default state", () => {
    const store = useSectionsStore();
    expect(store.sections).toEqual([]);
  });

  it("should 'setSections' updates state", () => {
    const store = useSectionsStore();

    store.setSections(mockSections);
    expect(store.sections).toEqual(mockSections);
  });

  it("should 'orderedSections' sorts sections by order", () => {
    const store = useSectionsStore();

    store.setSections(mockSections);
    const ordered = store.orderedSections.map((s: ISection) => s.title);

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
});
