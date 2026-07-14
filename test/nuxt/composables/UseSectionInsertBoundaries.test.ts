import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "vue-composable-tester";
import {
  provideSectionInsertBoundaries,
  useSectionInsertBoundaries,
  type SectionInsertBoundariesContext,
} from "~/composables/useSectionInsertBoundaries";

function createBoundaryElement(top: number): HTMLElement {
  const element = document.createElement("div");

  element.getBoundingClientRect = vi.fn(
    () =>
      ({
        top,
        bottom: top + 1,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect,
  );

  return element;
}

describe("useSectionInsertBoundaries", () => {
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalInnerHeight,
    });
    vi.restoreAllMocks();
  });

  it("should throw when used outside provideSectionInsertBoundaries", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    expect(() => mount(() => useSectionInsertBoundaries())).toThrow(
      "useSectionInsertBoundaries must be used within provideSectionInsertBoundaries",
    );

    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    expect(String(consoleWarnSpy.mock.calls[0]?.[0])).toContain(
      'injection "Symbol(sectionInsertBoundaries)" not found',
    );
    expect(String(consoleWarnSpy.mock.calls[1]?.[0])).toContain(
      "Unhandled error during execution of setup function",
    );

    consoleWarnSpy.mockRestore();
  });

  it("should expose the provided context through inject", () => {
    let providedContext: SectionInsertBoundariesContext | undefined;

    const { result } = mount(() => useSectionInsertBoundaries(), {
      provider: () => {
        providedContext = provideSectionInsertBoundaries();
      },
    });

    expect(result).toBe(providedContext);
  });

  it("should keep active targets null before any boundary is registered", () => {
    const { result } = mount(() => provideSectionInsertBoundaries());

    expect(result.activeTopInsertAfter.value).toBeNull();
    expect(result.activeBottomInsertAfter.value).toBeNull();
  });

  it("should resolve active top and bottom boundaries after registration", () => {
    const { result } = mount(() => provideSectionInsertBoundaries());

    result.registerBoundary(1, createBoundaryElement(-100));
    result.registerBoundary(2, createBoundaryElement(800));

    expect(result.activeTopInsertAfter.value).toBe(1);
    expect(result.activeBottomInsertAfter.value).toBe(2);
  });

  it("should expose only bottom target when a single boundary is below center", () => {
    const { result } = mount(() => provideSectionInsertBoundaries());

    result.registerBoundary(1, createBoundaryElement(500));

    expect(result.activeTopInsertAfter.value).toBeNull();
    expect(result.activeBottomInsertAfter.value).toBe(1);
  });

  it("should clear top target after boundary unregistration", () => {
    const { result } = mount(() => provideSectionInsertBoundaries());

    result.registerBoundary(1, createBoundaryElement(-100));
    result.registerBoundary(2, createBoundaryElement(800));
    result.unregisterBoundary(1);

    expect(result.activeTopInsertAfter.value).toBeNull();
    expect(result.activeBottomInsertAfter.value).toBe(2);
  });

  it("should recalculate active targets on scroll", () => {
    const element = createBoundaryElement(800);
    const { result } = mount(() => provideSectionInsertBoundaries());

    result.registerBoundary(1, element);

    expect(result.activeTopInsertAfter.value).toBeNull();
    expect(result.activeBottomInsertAfter.value).toBe(1);

    vi.mocked(element.getBoundingClientRect).mockReturnValue({
      top: -100,
      bottom: -99,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: -100,
      toJSON: () => ({}),
    } as DOMRect);

    window.dispatchEvent(new Event("scroll"));

    expect(result.activeTopInsertAfter.value).toBe(1);
    expect(result.activeBottomInsertAfter.value).toBeNull();
  });

  it("should recalculate active targets on resize", () => {
    const element = createBoundaryElement(250);
    const { result } = mount(() => provideSectionInsertBoundaries());

    result.registerBoundary(1, element);

    expect(result.activeTopInsertAfter.value).toBe(1);
    expect(result.activeBottomInsertAfter.value).toBeNull();

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 400,
    });

    window.dispatchEvent(new Event("resize"));

    expect(result.activeTopInsertAfter.value).toBeNull();
    expect(result.activeBottomInsertAfter.value).toBe(1);
  });

  it("should remove scroll and resize listeners on unmount", () => {
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = mount(() => provideSectionInsertBoundaries());

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    expect(removeListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });
});
