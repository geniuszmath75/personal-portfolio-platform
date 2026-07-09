import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "vue-composable-tester";
import { setActivePinia } from "pinia";
import type { LocationQuery } from "vue-router";
import { useSectionForm } from "~/composables/useSectionForm";
import { useSectionsStore } from "~/stores/sectionsStore";
import { createTestPinia } from "~~/test/setup";
import { ISectionType } from "~~/shared/types/enums";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const createMockRoute = (query: LocationQuery) => ({ query });

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() =>
    createMockRoute({
      placement: "home",
      insertAfter: "1",
    }),
  ),
}));

mockNuxtImport("useRoute", () => useRouteMock);

describe("useSectionForm composable", () => {
  let sectionsStore: ReturnType<typeof useSectionsStore>;

  beforeEach(() => {
    setActivePinia(createTestPinia());
    sectionsStore = useSectionsStore();
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "home",
        insertAfter: "1",
      }),
    );
    vi.spyOn(sectionsStore, "fetchSections").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize metadata from route query and placement", () => {
    const { result } = mount(() => useSectionForm());

    expect(result.placement.value).toBe("home");
    expect(result.insertAfter.value).toBe(1);
    expect(result.metadata.value.type).toBe(ISectionType.HERO);
    expect(result.step.value).toBe(1);
  });

  it("should expose standalone type options for standalone placement", () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "standalone",
      }),
    );

    const { result } = mount(() => useSectionForm());

    expect(result.typeOptions.value).toEqual([
      { value: ISectionType.ABOUT_ME, label: "About Me" },
    ]);
    expect(result.metadata.value.type).toBe(ISectionType.ABOUT_ME);
  });

  it("should warn when duplicate home section type is selected", () => {
    sectionsStore.setSections([
      {
        _id: "hero-id",
        slug: "hero",
        order: 1,
        type: ISectionType.HERO,
        blocks: [],
      },
    ]);

    const { result } = mount(() => useSectionForm());

    expect(result.showDuplicateTypeWarning.value).toBe(true);
  });

  it("should advance to step 2 when metadata is valid", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value.slug = "new-hero";
    result.metadata.value.order = 2;

    const isValid = await result.continueToBlockBuilder();

    expect(isValid).toBe(true);
    expect(result.step.value).toBe(2);
  });

  it("should stay on step 1 when metadata is invalid", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value.slug = "a";
    result.metadata.value.order = 2;

    const isValid = await result.continueToBlockBuilder();

    expect(isValid).toBe(false);
    expect(result.step.value).toBe(1);
  });
});
