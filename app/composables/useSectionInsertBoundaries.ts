import {
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  type InjectionKey,
  type Ref,
} from "vue";
import { resolveActiveInsertBoundaries } from "~/utils/resolveActiveInsertBoundaries";

/**
 * Shared state for coordinating section insert boundaries on the home page.
 */
export interface SectionInsertBoundariesContext {
  /**
   * Insert target pinned to the top edge on mobile; null when none is active.
   */
  activeTopInsertAfter: Ref<number | null>;

  /**
   * Insert target pinned to the bottom edge on mobile; null when none is active.
   */
  activeBottomInsertAfter: Ref<number | null>;

  /**
   * Registers a seam element so scroll logic can track its position.
   */
  registerBoundary: (insertAfter: number, element: HTMLElement) => void;

  /**
   * Removes a seam element when its boundary component unmounts.
   */
  unregisterBoundary: (insertAfter: number) => void;
}

/**
 * Injection key for the home-page section insert boundary context.
 */
export const sectionInsertBoundariesKey: InjectionKey<SectionInsertBoundariesContext> =
  Symbol("sectionInsertBoundaries");

/**
 * Tracks section seam positions and exposes the two active mobile insert targets.
 */
export function provideSectionInsertBoundaries(): SectionInsertBoundariesContext {
  /**
   * Registered seam anchors keyed by the section order they follow.
   */
  const boundaryElements = shallowRef(new Map<number, HTMLElement>());

  /**
   * Mobile insert target chosen for the top fixed button.
   */
  const activeTopInsertAfter = ref<number | null>(null);

  /**
   * Mobile insert target chosen for the bottom fixed button.
   */
  const activeBottomInsertAfter = ref<number | null>(null);

  /**
   * Recomputes the two active insert targets from current seam positions.
   */
  const updateActiveBoundaries = () => {
    const metrics = Array.from(boundaryElements.value.entries()).map(
      ([insertAfter, element]) => ({
        insertAfter,
        top: element.getBoundingClientRect().top,
      }),
    );

    const next = resolveActiveInsertBoundaries(metrics, window.innerHeight);

    activeTopInsertAfter.value = next.activeTopInsertAfter;
    activeBottomInsertAfter.value = next.activeBottomInsertAfter;
  };

  const registerBoundary = (insertAfter: number, element: HTMLElement) => {
    boundaryElements.value.set(insertAfter, element);
    boundaryElements.value = new Map(boundaryElements.value);
    updateActiveBoundaries();
  };

  const unregisterBoundary = (insertAfter: number) => {
    boundaryElements.value.delete(insertAfter);
    boundaryElements.value = new Map(boundaryElements.value);
    updateActiveBoundaries();
  };

  onMounted(() => {
    updateActiveBoundaries();
    /**
     * Keep mobile targets in sync while the admin scrolls the home page.
     */
    window.addEventListener("scroll", updateActiveBoundaries, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveBoundaries, {
      passive: true,
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", updateActiveBoundaries);
    window.removeEventListener("resize", updateActiveBoundaries);
  });

  const context: SectionInsertBoundariesContext = {
    activeTopInsertAfter,
    activeBottomInsertAfter,
    registerBoundary,
    unregisterBoundary,
  };

  provide(sectionInsertBoundariesKey, context);

  return context;
}

/**
 * Reads the shared section insert boundary context.
 */
export function useSectionInsertBoundaries(): SectionInsertBoundariesContext {
  const context = inject(sectionInsertBoundariesKey);

  if (!context) {
    throw new Error(
      "useSectionInsertBoundaries must be used within provideSectionInsertBoundaries",
    );
  }

  return context;
}
