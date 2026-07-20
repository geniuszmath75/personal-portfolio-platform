import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import SectionEditMobileControl from "~/components/Section/EditMobileControl.vue";

describe("SectionEditMobileControl", () => {
  it("should render mobile FAB edit link for the given section slug", () => {
    renderWithNuxt(SectionEditMobileControl, {
      props: { slug: "hero" },
    });

    const link = screen.getByRole("link", { name: "Edit hero section" });

    expect(link).toHaveAttribute("href", "/sections/hero/edit");
    expect(link).toHaveClass("rounded-full", "h-12", "w-12");
  });
});
