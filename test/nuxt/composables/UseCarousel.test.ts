import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CarouselComposableProps } from "../../../app/types/components";
import { useCarousel } from "../../../app/composables/useCarousel";
import { mount } from "vue-composable-tester";

vi.useFakeTimers();

describe("useCarousel", () => {
  let testCarouselProps: CarouselComposableProps;

  beforeEach(() => {
    testCarouselProps = {
      defaultIndex: 0,
      totalElements: 3,
      dotPlacement: "bottom",
      showArrow: false,
      showDots: true,
      autoplay: false,
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe("initialization and base state", () => {
    it("should initialize internalIndex from defaultIndex", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));
      expect(result.internalIndex.value).toBe(0);
    });
  });

  describe("COMPUTED: dotPlacementClasses", () => {
    it.each([
      {
        placement: "top",
        expected: "top-4 left-1/2 transform -translate-x-1/2",
      },
      {
        placement: "bottom",
        expected: "bottom-4 left-1/2 transform -translate-x-1/2",
      },
      {
        placement: "left",
        expected: "left-4 top-1/2 transform -translate-y-1/2 flex-col",
      },
      {
        placement: "right",
        expected: "right-4 top-1/2 transform -translate-y-1/2 flex-col",
      },
    ] as const)(
      "should return correct dotPlacementClasses for $placement placement",
      ({ placement, expected }) => {
        const { result } = mount(() =>
          useCarousel({
            ...testCarouselProps,
            dotPlacement: placement,
          }),
        );
        expect(result.dotPlacementClasses.value).toBe(expected);
      },
    );

    it.each([
      {
        placement: "top",
        expected: "left-0 top-1/2 justify-between w-full",
      },
      {
        placement: "bottom",
        expected: "left-0 top-1/2 justify-between w-full",
      },
      {
        placement: "left",
        expected: "right-4 bottom-4",
      },
      {
        placement: "right",
        expected: "right-4 bottom-4",
      },
    ] as const)(
      "should return correct arrowPlacementClasses for $placement placement",
      ({ placement, expected }) => {
        const { result } = mount(() =>
          useCarousel({
            ...testCarouselProps,
            dotPlacement: placement,
          }),
        );
        expect(result.arrowPlacementClasses.value).toBe(expected);
      },
    );
  });

  describe("COMPUTED: carouselTransformStyle", () => {
    it("should compute correct transform style based on internalIndex", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));
      result.internalIndex.value = 2;
      expect(result.carouselTransformStyle.value).toEqual({
        transform: "translateX(-200%)",
      });
    });
  });

  describe("METHOD: getDotClass", () => {
    it("should return correct dot class for active and inactive dots", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));
      result.internalIndex.value = 1;

      expect(result.getDotClass(1)).toBe("bg-secondary-500");
      expect(result.getDotClass(0)).toBe("bg-primary-400");
    });
  });

  describe("METHOD: goToElement", () => {
    it("should set index correctly when goToElement is called with valid index", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));
      result.goToElement(2);
      expect(result.internalIndex.value).toBe(2);
    });

    it("should ignore invalid indices in goToElement", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));

      result.internalIndex.value = 1;
      result.goToElement(-1);
      expect(result.internalIndex.value).toBe(1);

      result.goToElement(5);
      expect(result.internalIndex.value).toBe(1);
    });
  });

  describe("METHOD: prevElement / nextElement", () => {
    it("should rotate correctly with prevElement()", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));

      result.internalIndex.value = 0;
      result.prevElement();

      expect(result.internalIndex.value).toBe(2); // wrap around
    });

    it("should rotate correctly with nextElement()", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));

      result.internalIndex.value = 2;
      result.nextElement();

      expect(result.internalIndex.value).toBe(0); // wrap around
    });
  });

  describe("METHOD: getCurrentIndex", () => {
    it("should return current internal index", () => {
      const { result } = mount(() => useCarousel(testCarouselProps));
      result.internalIndex.value = 5;
      expect(result.getCurrentIndex()).toBe(5);
    });
  });

  describe("AUTOPLAY", () => {
    it("should start autoplay interval on mount if autoplay=true and totalElements>1", () => {
      const { result } = mount(() =>
        useCarousel({
          ...testCarouselProps,
          autoplay: true,
          totalElements: 3,
        }),
      );

      expect(result.internalIndex.value).toBe(0);

      vi.advanceTimersByTime(5000);
      expect(result.internalIndex.value).toBe(1);

      vi.advanceTimersByTime(10000);
      expect(result.internalIndex.value).toBe(0);
    });

    it("should not start autoplay if totalElements<=1", () => {
      const { result } = mount(() =>
        useCarousel({
          ...testCarouselProps,
          autoplay: true,
          totalElements: 1,
        }),
      );
      vi.advanceTimersByTime(10000);
      expect(result.internalIndex.value).toBe(0);
    });

    it("should clear interval on unmount", () => {
      const clearSpy = vi.spyOn(global, "clearInterval");

      const { result, unmount } = mount(() =>
        useCarousel({
          ...testCarouselProps,
          autoplay: true,
          totalElements: 3,
        }),
      );

      // Act: run autoplay
      vi.advanceTimersByTime(5000);
      expect(result.internalIndex.value).toBe(1);

      // Act: unmount - should call clearInterval
      unmount();

      // Assert: clearInterval called once
      expect(clearSpy).toHaveBeenCalledTimes(1);
      clearSpy.mockRestore();
    });
  });
});
