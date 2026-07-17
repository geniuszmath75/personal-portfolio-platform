import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "vue-composable-tester";
import { setActivePinia } from "pinia";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import type { LocationQuery } from "vue-router";
import { useSectionForm } from "~/composables/useSectionForm";
import { useSectionsStore } from "~/stores/sectionsStore";
import { createTestPinia } from "~~/test/setup";
import { BlockKind, ISectionType } from "~~/shared/types/enums";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { showErrorToast, showSuccessToast } from "~/utils/toastNotification";
import { handleError } from "~/utils/handleError";

const createMockRoute = (
  query: LocationQuery,
  params: Record<string, string> = {},
) => ({ query, params });

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() =>
    createMockRoute({
      placement: "home",
      insertAfter: "1",
    }),
  ),
}));

mockNuxtImport("navigateTo", () => navigateToMock);
mockNuxtImport("useRoute", () => useRouteMock);

vi.mock("~/utils/toastNotification", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("~/utils/handleError", () => ({
  handleError: vi.fn(),
}));

const createSection = (
  overrides: Partial<ValidatedSection> = {},
): ValidatedSection => ({
  _id: "section-id",
  slug: "hero",
  order: 1,
  type: ISectionType.HERO,
  blocks: [],
  ...overrides,
});

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
    sectionsStore.setSections([createSection()]);

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

  it("should mark field as touched and expose validation state via touchField", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value.slug = "a";
    result.touchField("slug");
    await nextTick();

    expect(result.isSlugInvalid.value).toBe(true);
    expect(result.slugErrors.value.length).toBeGreaterThan(0);
  });

  it("should sync metadata order when suggested order changes", async () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "home",
      }),
    );

    const { result } = mount(() => useSectionForm());
    await flushPromises();

    expect(result.metadata.value.order).toBe(1);

    sectionsStore.setSections([createSection({ order: 5 })]);
    await nextTick();

    expect(result.suggestedOrder.value).toBe(6);
    expect(result.metadata.value.order).toBe(6);
  });

  it("should stop syncing order after markOrderAsEdited is called", async () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "home",
      }),
    );

    const { result } = mount(() => useSectionForm());
    await flushPromises();

    const orderBeforeManualEdit = result.metadata.value.order;
    result.markOrderAsEdited();

    sectionsStore.setSections([createSection({ order: 5 })]);
    await nextTick();

    expect(result.suggestedOrder.value).toBe(6);
    expect(result.metadata.value.order).toBe(orderBeforeManualEdit);
  });

  it("should not reset type during initial placement watch when default type is valid", () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "home",
      }),
    );

    const { result } = mount(() => useSectionForm());

    expect(result.metadata.value.type).toBe(ISectionType.HERO);
  });

  it("should reset section type when placement no longer supports it", async () => {
    const { result } = mount(() => useSectionForm());

    expect(result.metadata.value.type).toBe(ISectionType.HERO);

    result.placement.value = "standalone";
    await nextTick();

    expect(result.metadata.value.type).toBe(ISectionType.ABOUT_ME);
  });

  it("should load metadata and blocks from an existing section", () => {
    const { result } = mount(() => useSectionForm());
    const section = createSection({
      title: "About me",
      slug: "about-me",
      type: ISectionType.ABOUT_ME,
      order: 7,
      blocks: [
        {
          kind: BlockKind.PARAGRAPH,
          paragraphs: ["Hello"],
        },
      ],
    });

    result.loadFromSection(section);

    expect(result.metadata.value).toEqual({
      title: "About me",
      slug: "about-me",
      type: ISectionType.ABOUT_ME,
      order: 7,
    });
    expect(result.blocks.value).toEqual(section.blocks);
  });

  it("should preserve loaded order after suggested order changes", async () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "home",
      }),
    );

    const { result } = mount(() => useSectionForm());
    result.loadFromSection(
      createSection({
        slug: "loaded-section",
        order: 7,
      }),
    );

    sectionsStore.setSections([createSection({ order: 10 })]);
    await nextTick();

    expect(result.suggestedOrder.value).toBe(11);
    expect(result.metadata.value.order).toBe(7);
  });

  it("should submit section and redirect to home on success", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value = {
      title: "Hero",
      slug: "hero-copy",
      type: ISectionType.HERO,
      order: 2,
    };
    result.blocks.value = [
      { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
    ];
    result.step.value = 2;

    vi.spyOn(sectionsStore, "createSection").mockResolvedValue(true);

    await result.submitCreateSection();
    await flushPromises();

    expect(sectionsStore.createSection).toHaveBeenCalledWith(
      result.metadata.value,
      result.blocks.value,
      expect.any(Map),
    );
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Section created successfully!",
    );
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(result.isSubmitting.value).toBe(false);
  });

  it("should redirect standalone sections to slug route on success", async () => {
    useRouteMock.mockImplementation(() =>
      createMockRoute({
        placement: "standalone",
      }),
    );

    const { result } = mount(() => useSectionForm());

    result.metadata.value = {
      title: "About",
      slug: "about-copy",
      type: ISectionType.ABOUT_ME,
      order: 1,
    };
    result.blocks.value = [
      { kind: BlockKind.PARAGRAPH, paragraphs: ["About me"] },
    ];
    result.step.value = 2;

    vi.spyOn(sectionsStore, "createSection").mockResolvedValue(true);

    await result.submitCreateSection();
    await flushPromises();

    expect(navigateToMock).toHaveBeenCalledWith("/about-copy");
  });

  it("should not submit when no blocks are present", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value = {
      title: "Hero",
      slug: "hero-copy",
      type: ISectionType.HERO,
      order: 2,
    };
    result.blocks.value = [];
    result.step.value = 2;
    vi.spyOn(sectionsStore, "createSection").mockResolvedValue(true);

    await result.submitCreateSection();

    expect(sectionsStore.createSection).not.toHaveBeenCalled();
    expect(showErrorToast).toHaveBeenCalledWith(
      "Add at least one block before submitting",
    );
  });

  it("should not submit when block editor is open", async () => {
    const { result } = mount(() => useSectionForm());

    result.metadata.value = {
      title: "Hero",
      slug: "hero-copy",
      type: ISectionType.HERO,
      order: 2,
    };
    result.blocks.value = [
      { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
    ];
    result.step.value = 2;
    result.editorOpen.value = true;
    vi.spyOn(sectionsStore, "createSection").mockResolvedValue(true);

    await result.submitCreateSection();

    expect(sectionsStore.createSection).not.toHaveBeenCalled();
    expect(showErrorToast).toHaveBeenCalledWith(
      "Close the block editor before submitting",
    );
  });

  it("should handle createSection errors via handleError", async () => {
    const { result } = mount(() => useSectionForm());
    const error = new Error("Create failed");

    result.metadata.value = {
      title: "Hero",
      slug: "hero-copy",
      type: ISectionType.HERO,
      order: 2,
    };
    result.blocks.value = [
      { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
    ];
    result.step.value = 2;

    vi.spyOn(sectionsStore, "createSection").mockRejectedValue(error);

    await result.submitCreateSection();
    await flushPromises();

    expect(handleError).toHaveBeenCalledWith(error, "Failed to create section");
    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result.isSubmitting.value).toBe(false);
  });

  it("should not navigate when createSection returns false", async () => {
    const { result } = mount(() => useSectionForm());

    result.blocks.value = [
      { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
    ];
    result.step.value = 2;

    vi.spyOn(sectionsStore, "createSection").mockResolvedValue(false);

    await result.submitCreateSection();
    await flushPromises();

    expect(showSuccessToast).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  describe("edit mode", () => {
    const existingSection = createSection({
      _id: "section-id",
      title: "Hero",
      slug: "hero",
      type: ISectionType.HERO,
      order: 3,
      blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] }],
    });

    beforeEach(() => {
      useRouteMock.mockImplementation(() =>
        createMockRoute({}, { slug: "hero" }),
      );
      vi.spyOn(sectionsStore, "fetchSection").mockImplementation(async () => {
        sectionsStore.setSectionDetails(existingSection);
      });
    });

    it("should hydrate form from fetched section on mount", async () => {
      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(sectionsStore.fetchSection).toHaveBeenCalledWith("hero");
      expect(result.sectionId.value).toBe("section-id");
      expect(result.placement.value).toBe("home");
      expect(result.metadata.value).toEqual({
        title: "Hero",
        slug: "hero",
        type: ISectionType.HERO,
        order: 3,
      });
      expect(result.blocks.value).toEqual(existingSection.blocks);
    });

    it("should set standalone placement when editing an about-me section", async () => {
      const aboutSection = createSection({
        _id: "about-id",
        slug: "about",
        type: ISectionType.ABOUT_ME,
        order: 1,
        blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: ["About"] }],
      });

      useRouteMock.mockImplementation(() =>
        createMockRoute({}, { slug: "about" }),
      );
      vi.spyOn(sectionsStore, "fetchSection").mockImplementation(async () => {
        sectionsStore.setSectionDetails(aboutSection);
      });

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(result.placement.value).toBe("standalone");
      expect(result.metadata.value.type).toBe(ISectionType.ABOUT_ME);
    });

    it("should not warn about duplicate type for the section being edited", async () => {
      sectionsStore.setSections([existingSection]);

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(result.showDuplicateTypeWarning.value).toBe(false);
    });

    it("should still warn when another home section already has the selected type", async () => {
      sectionsStore.setSections([
        existingSection,
        createSection({
          _id: "other-hero",
          slug: "hero-2",
          type: ISectionType.HERO,
          order: 4,
        }),
      ]);

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(result.showDuplicateTypeWarning.value).toBe(true);
    });

    it("should not overwrite loaded order with suggested order", async () => {
      sectionsStore.setSections([createSection({ order: 10 })]);

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(result.suggestedOrder.value).toBe(11);
      expect(result.metadata.value.order).toBe(3);
    });

    it("should submit update and redirect to home on success", async () => {
      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      result.step.value = 2;
      vi.spyOn(sectionsStore, "updateSection").mockResolvedValue(true);

      await result.submitUpdateSection();
      await flushPromises();

      expect(sectionsStore.updateSection).toHaveBeenCalledWith(
        "section-id",
        result.metadata.value,
        result.blocks.value,
        expect.any(Map),
      );
      expect(showSuccessToast).toHaveBeenCalledWith(
        "Section updated successfully!",
      );
      expect(navigateToMock).toHaveBeenCalledWith("/");
      expect(result.isSubmitting.value).toBe(false);
    });

    it("should redirect standalone sections to slug route on update success", async () => {
      const aboutSection = createSection({
        _id: "about-id",
        slug: "about",
        type: ISectionType.ABOUT_ME,
        order: 1,
        blocks: [{ kind: BlockKind.PARAGRAPH, paragraphs: ["About"] }],
      });

      useRouteMock.mockImplementation(() =>
        createMockRoute({}, { slug: "about" }),
      );
      vi.spyOn(sectionsStore, "fetchSection").mockImplementation(async () => {
        sectionsStore.setSectionDetails(aboutSection);
      });

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      result.metadata.value.slug = "about-updated";
      result.step.value = 2;
      vi.spyOn(sectionsStore, "updateSection").mockResolvedValue(true);

      await result.submitUpdateSection();
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith("/about-updated");
    });

    it("should not submit update when section id is missing", async () => {
      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      result.sectionId.value = null;
      result.step.value = 2;
      vi.spyOn(sectionsStore, "updateSection").mockResolvedValue(true);

      await result.submitUpdateSection();

      expect(sectionsStore.updateSection).not.toHaveBeenCalled();
      expect(showErrorToast).toHaveBeenCalledWith("Section id is missing");
    });

    it("should handle updateSection errors via handleError", async () => {
      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      const error = new Error("Update failed");
      result.step.value = 2;
      vi.spyOn(sectionsStore, "updateSection").mockRejectedValue(error);

      await result.submitUpdateSection();
      await flushPromises();

      expect(handleError).toHaveBeenCalledWith(
        error,
        "Failed to update section",
      );
      expect(showSuccessToast).not.toHaveBeenCalled();
      expect(navigateToMock).not.toHaveBeenCalled();
      expect(result.isSubmitting.value).toBe(false);
    });

    it("should toast when section fails to load", async () => {
      vi.spyOn(sectionsStore, "fetchSection").mockResolvedValue();
      sectionsStore.sectionDetails = null;

      const { result } = mount(() => useSectionForm({ mode: "edit" }));
      await flushPromises();

      expect(showErrorToast).toHaveBeenCalledWith("Failed to load section");
      expect(result.sectionId.value).toBeNull();
    });
  });
});
