import { describe, expect, it } from "vitest";
import { ref, computed } from "vue";
import { useSectionInsertOrder } from "../../../app/composables/useSectionInsertOrder";
import { ISectionType } from "../../../shared/types/enums";

describe("useSectionInsertOrder", () => {
  const createSection = (order: number): ValidatedSection => ({
    _id: `id-${order}`,
    slug: `section-${order}`,
    order,
    type: ISectionType.HERO,
    blocks: [],
  });

  it("should suggest insertAfter + 1 for home placement with insertAfter", () => {
    const placement = ref<SectionPlacement>("home");
    const insertAfter = ref<number | null>(2);
    const orderedSections = computed(() => [
      createSection(1),
      createSection(2),
      createSection(3),
    ]);

    const { suggestedOrder } = useSectionInsertOrder(
      placement,
      insertAfter,
      orderedSections,
    );

    expect(suggestedOrder.value).toBe(3);
  });

  it("should suggest max order + 1 when insertAfter is not provided", () => {
    const placement = ref<SectionPlacement>("home");
    const insertAfter = ref<number | null>(null);
    const orderedSections = computed(() => [
      createSection(1),
      createSection(4),
    ]);

    const { suggestedOrder } = useSectionInsertOrder(
      placement,
      insertAfter,
      orderedSections,
    );

    expect(suggestedOrder.value).toBe(5);
  });

  it("should suggest 1 when there are no existing sections", () => {
    const placement = ref<SectionPlacement>("standalone");
    const insertAfter = ref<number | null>(null);
    const orderedSections = computed(() => []);

    const { suggestedOrder } = useSectionInsertOrder(
      placement,
      insertAfter,
      orderedSections,
    );

    expect(suggestedOrder.value).toBe(1);
  });
});
