import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import SectionEditControl from "~/components/Section/EditControl.vue";

describe("SectionEditControl", () => {
  it("should render edit link for the given section slug", () => {
    renderWithNuxt(SectionEditControl, {
      props: { slug: "hero" },
    });

    const link = screen.getByRole("link", { name: "Edit hero section" });

    expect(link).toHaveAttribute("href", "/sections/hero/edit");
  });
});
