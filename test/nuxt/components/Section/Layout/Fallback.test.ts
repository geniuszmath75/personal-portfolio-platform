import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import Fallback from "~/components/Section/Layout/Fallback.vue";

describe("SectionLayoutFallback", () => {
  it("renders fallback message for unknown section type", () => {
    const section = {
      type: "UNKNOWN",
      order: 4,
      blocks: [],
    };

    renderWithNuxt(Fallback, { props: { section } });

    expect(screen.getByText("New section soon: UNKNOWN")).toBeTruthy();
  });
});
