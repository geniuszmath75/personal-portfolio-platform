import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import SectionInsertMobileControls from "~/components/Section/InsertMobileControls.vue";

describe("SectionInsertMobileControls", () => {
  it("should render fixed top and bottom links when both targets are active", () => {
    renderWithNuxt(SectionInsertMobileControls, {
      props: {
        topInsertAfter: 1,
        bottomInsertAfter: 2,
      },
    });

    expect(
      screen.getByRole("link", { name: "Insert section after order 1" }),
    ).toHaveAttribute("href", "/sections/create?placement=home&insertAfter=1");

    expect(
      screen.getByRole("link", { name: "Insert section after order 2" }),
    ).toHaveAttribute("href", "/sections/create?placement=home&insertAfter=2");
  });

  it("should render only bottom link when top target is null", () => {
    renderWithNuxt(SectionInsertMobileControls, {
      props: {
        topInsertAfter: null,
        bottomInsertAfter: 1,
      },
    });

    expect(
      screen.getByRole("link", { name: "Insert section after order 1" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: "Insert section after order 2" }),
    ).toBeNull();
  });
});
