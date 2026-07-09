import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import FormStepper from "~/components/Section/FormStepper.vue";

function renderFormStepper(step: 1 | 2) {
  return renderWithNuxt(FormStepper, {
    props: { step },
  });
}

describe("FormStepper.vue", () => {
  it("should render step labels", () => {
    renderFormStepper(1);

    expect(screen.getByText("Metadata")).toBeInTheDocument();
    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });

  it("should show step 1 indicator on the first step", () => {
    const { container } = renderFormStepper(1);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(container.querySelector('[class*="mdi:check"]')).toBeNull();

    const connector = container.querySelector(".origin-left");
    expect(connector).toHaveClass("scale-x-0");
    expect(connector).not.toHaveClass("scale-x-100");
  });

  it("should show completed step 1 state on the second step", () => {
    const { container } = renderFormStepper(2);

    expect(screen.queryByText("1.")).not.toBeInTheDocument();
    expect(container.querySelector('[class*="mdi:check"]')).toBeInTheDocument();

    const connector = container.querySelector(".origin-left");
    expect(connector).toHaveClass("scale-x-100");
    expect(connector).not.toHaveClass("scale-x-0");
  });

  it("should apply active styles to the current step", () => {
    const { container } = renderFormStepper(1);

    const stepCircles = container.querySelectorAll(".rounded-full");
    expect(stepCircles[0]).toHaveClass("bg-secondary-500");
    expect(stepCircles[1]).toHaveClass("bg-secondary-700");

    expect(screen.getByText("Metadata")).toHaveClass("text-secondary-500");
    expect(screen.getByText("Blocks")).toHaveClass("text-secondary-700");
  });

  it("should apply active styles to step 2 on the second step", () => {
    const { container } = renderFormStepper(2);

    const stepCircles = container.querySelectorAll(".rounded-full");
    expect(stepCircles[0]).toHaveClass("bg-additional-500");
    expect(stepCircles[1]).toHaveClass("bg-secondary-500");

    expect(screen.getByText("Metadata")).toHaveClass("text-secondary-700");
    expect(screen.getByText("Blocks")).toHaveClass("text-secondary-500");
  });
});
