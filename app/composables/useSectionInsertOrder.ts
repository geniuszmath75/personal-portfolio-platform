import { computed, type ComputedRef, type Ref } from "vue";
import type { SectionPlacement } from "~~/shared/config/sectionBuilder";

/**
 * Suggests a default section order from placement context and existing sections.
 */
export function useSectionInsertOrder(
  placement: Ref<SectionPlacement>,
  insertAfter: Ref<number | null>,
  orderedSections: ComputedRef<ValidatedSection[]>,
) {
  const suggestedOrder = computed(() => {
    if (placement.value === "home" && insertAfter.value !== null) {
      return insertAfter.value + 1;
    }

    const orders = orderedSections.value.map((section) => section.order);

    if (orders.length === 0) {
      return 1;
    }

    return Math.max(...orders) + 1;
  });

  return { suggestedOrder };
}
