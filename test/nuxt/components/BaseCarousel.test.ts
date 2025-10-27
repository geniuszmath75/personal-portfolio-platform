import { describe, expect, it, vi } from "vitest";
import { renderWithNuxt } from "../../setup";
import BaseCarousel from "../../../app/components/BaseCarousel.vue";
import { fireEvent } from "@testing-library/vue";
import { mount } from "@vue/test-utils";

vi.useFakeTimers();

describe("BaseCarousel", () => {
  it("should render default slot and navigation dots", () => {
    // Arrange: 3 slides in carousel, slot with 3 divs
    const { getAllByRole, getByText } = renderWithNuxt(BaseCarousel, {
      props: {
        totalElements: 3,
      },
      slots: {
        default: "<div>Slide 1</div><div>Slide 2</div><div>Slide 3</div>",
      },
    });

    // Assert: 3 dots and visible first slide
    expect(getAllByRole("button").length).toBe(3);
    expect(getByText("Slide 1")).toBeInTheDocument();
  });

  it("should show arrow buttons when showArrow=true", () => {
    // Arrange: 3 slides in carousel, arrows visible
    const { getAllByRole } = renderWithNuxt(BaseCarousel, {
      props: {
        totalElements: 3,
        showArrow: true,
      },
    });

    // Assert: 2 arrows + 3 dots
    const buttons = getAllByRole("button");
    expect(buttons.length).toBe(5);
  });

  it("should navigate to next slide when clicking right arrow", async () => {
    // Arrange: 3 slides in carousel, arrows visible
    const { container, getAllByRole } = renderWithNuxt(BaseCarousel, {
      props: {
        totalElements: 3,
        showArrow: true,
      },
      slots: {
        default: "<div>Slide 1</div><div>Slide 2</div><div>Slide 3</div>",
      },
    });

    // Second arrow
    const nextArrow = getAllByRole("button")[1];

    // Act: click next arrow
    await fireEvent.click(nextArrow);

    // Assert: first container style changed to translateX(-100%)
    const transformContainer = container.querySelector(
      ".flex.transition-transform",
    );
    expect(transformContainer?.getAttribute("style")).toContain(
      "translateX(-100%)",
    );
  });

  it("should navigate to prev slide when clicking left arrow", async () => {
    // Arrange: 3 slides in carousel, arrows visible
    const { container, getAllByRole } = renderWithNuxt(BaseCarousel, {
      props: {
        totalElements: 3,
        showArrow: true,
      },
      slots: {
        default: "<div>Slide 1</div><div>Slide 2</div><div>Slide 3</div>",
      },
    });

    // Prev arrow
    const prevArrow = getAllByRole("button")[0];

    // Act: click prev arrow
    await fireEvent.click(prevArrow);

    // Assert: first container style changed to translateX(-100%)
    const transformContainer = container.querySelector(
      ".flex.transition-transform",
    );
    expect(transformContainer?.getAttribute("style")).toContain(
      "translateX(-200%)",
    );
  });

  it("should navigate to selected slide when clicking a dot", async () => {
    // Arrange: 3 slides in carousel, dots visible
    const { getAllByRole } = renderWithNuxt(BaseCarousel, {
      props: {
        totalElements: 3,
        showDots: true,
      },
    });

    const dots = getAllByRole("button");

    // Act: click the last dot
    await fireEvent.click(dots[2]);

    // Assert: change bg-color for selected dot
    expect(dots[2].classList.contains("bg-secondary-500")).toBe(true);
  });

  it("should automatically advance slides when autoplay=true", async () => {
    // Arrange: 3 slides in carousel, autoplay turned on

    vi.spyOn(console, "warn").mockImplementation((msg) => {
      if (msg.includes("[Icon] failed to load icon")) return;
      console.warn(msg);
    });

    const wrapper = mount(BaseCarousel, {
      props: {
        totalElements: 3,
        autoplay: true,
      },
    });

    const vm = wrapper.vm;

    // Assert initial
    expect(vm.getCurrentIndex()).toBe(0);

    // Act: advance the time by 5 seconds (one autoplay cycle)
    vi.advanceTimersByTime(5000);
    expect(vm.getCurrentIndex()).toBe(1);

    // Act: next autoplay cycle
    vi.advanceTimersByTime(5000);
    expect(vm.getCurrentIndex()).toBe(2);

    wrapper.unmount();
  });

  it("should cycle back to last slide when prevElement called at index 0", () => {
    // Arrange: 3 slides in carousel
    const wrapper = mount(BaseCarousel, {
      props: {
        totalElements: 3,
      },
    });
    const vm = wrapper.vm;

    // Act
    vm.prevElement();

    // Assert
    expect(vm.getCurrentIndex()).toBe(2);

    wrapper.unmount();
  });

  it("should cycles to first slide after last one using nextElement", () => {
    // Arrange: 3 slides in carousel, defaultIndex is 2
    const wrapper = mount(BaseCarousel, {
      props: {
        totalElements: 3,
        defaultIndex: 2,
      },
    });
    const vm = wrapper.vm;

    // Act: click next element
    vm.nextElement();

    // Assert: slide index should change to 0
    expect(vm.getCurrentIndex()).toBe(0);

    wrapper.unmount();
  });

  it.each([
    ["top", "top-4"],
    ["bottom", "bottom-4"],
    ["left", "left-4"],
    ["right", "right-4"],
  ])(
    "applies correct classes for dotPlacement='%s'",
    async (placement, expectedClass) => {
      // Arrange: 3 slides in carousel, various dot placement
      const { container } = renderWithNuxt(BaseCarousel, {
        props: {
          dotPlacement: placement,
          totalElements: 3,
        },
      });

      // Assert: valid dots placement
      const dotsContainer = container.querySelector(".absolute.flex.gap-2");
      expect(dotsContainer?.className).toContain(expectedClass);
    },
  );
});
