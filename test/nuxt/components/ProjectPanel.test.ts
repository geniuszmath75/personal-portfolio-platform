import { describe, expect, it } from "vitest";
import { renderWithNuxt } from "../../setup";
import ProjectPanel from "../../../app/components/ProjectPanel.vue";

describe("ProjectPanel", () => {
  it("should render default heading and classes correctly", () => {
    // Arrange: render component with no props (defaults)
    const { getByText } = renderWithNuxt(ProjectPanel);

    // Act: query DOM elements
    const heading = getByText("BASIC INFORMATION");
    const container = heading.closest("div")?.parentElement;

    // Assert: heading exists and default classes are applied
    expect(heading).toBeInTheDocument();
    expect(container).toHaveClass("w-auto");
    expect(heading).toBeVisible();
  });

  it("should render custom heading when prop provided", () => {
    // Arrange: render component with custom heading
    const { getByText } = renderWithNuxt(ProjectPanel, {
      props: { heading: "PROJECT DETAILS" },
    });

    // Act: find custom heading
    const heading = getByText("PROJECT DETAILS");

    // Assert: heading text updated
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("PROJECT DETAILS");
  });

  it("should render slot content properly", () => {
    // Arrange: provide slot content
    const { getByText } = renderWithNuxt(ProjectPanel, {
      slots: { default: "<p>Slot Content</p>" },
    });

    // Act: query slot content
    const slotEl = getByText("Slot Content");

    // Assert: slot content is visible
    expect(slotEl).toBeInTheDocument();
    expect(slotEl).toBeVisible();
  });

  describe("getWidthClass", () => {
    it.each([
      { fullWidth: false, expectedClass: "w-auto" },
      { fullWidth: true, expectedClass: "col-span-full" },
    ])(
      "should apply correct width class when fullWidth=$fullWidth",
      ({ fullWidth, expectedClass }) => {
        // Arrange: render with width prop
        const { getByRole } = renderWithNuxt(ProjectPanel, {
          props: { fullWidth },
        });

        // Act: find main container
        const panel = getByRole("heading").closest("div")?.parentElement;

        // Assert: width class matches expected
        expect(panel).toHaveClass(expectedClass);
      },
    );
  });

  describe("getTypeClass", () => {
    it.each([
      {
        type: "primary",
        expectedClass: "bg-primary-500 text-secondary-500",
      },
      {
        type: "secondary",
        expectedClass: "bg-secondary-500 text-primary-500",
      },
    ])(
      "should apply correct type class when type=$type",
      ({ type, expectedClass }) => {
        // Arrange: render component with given type
        const { getByRole } = renderWithNuxt(ProjectPanel, { props: { type } });

        // Act: get content div
        const content = getByRole("heading")?.parentElement?.nextElementSibling;

        // Assert: class is applied as expected
        expect(content).toHaveClass(expectedClass);
      },
    );
  });
});
