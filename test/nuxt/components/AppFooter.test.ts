import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "../../setup";
import AppFooter from "../../../app/components/AppFooter.vue";

describe("AppFooter", () => {
  it("should render author name", () => {
    renderWithNuxt(AppFooter);

    expect(screen.getByText("Damian Judka")).toBeTruthy();
  });

  it("should render copyright icon", () => {
    renderWithNuxt(AppFooter);

    const copyrightIcon = document.body.querySelector(".i-mdi\\:copyright");
    expect(copyrightIcon).toBeTruthy();
  });

  it("renders year range correctly", () => {
    renderWithNuxt(AppFooter);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`2023 - ${currentYear}`)).toBeTruthy();
  });
});
