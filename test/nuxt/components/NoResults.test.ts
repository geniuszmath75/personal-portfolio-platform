import { describe, expect, it } from "vitest";
import NoResults from "../../../app/components/NoResults.vue";
import { renderWithNuxt } from "../../setup";

describe("NoResults", () => {
  it("should render with default props", () => {
    // Arrange: render component with no props
    const { container, getByText } = renderWithNuxt(NoResults);

    // Act: locate text and icon elements
    const message = getByText("No results found");
    const icon = container.querySelector(".i-mdi\\:magnify-remove-outline");

    // Assert: ensure default message and icon classes exist
    expect(message).toBeInTheDocument();
    expect(icon).toBeTruthy();
    expect(message.className).toContain("text-secondary-500");
  });

  it("should render custom icon and message when props are provided", () => {
    // Arrange: render component with custom props
    const customMessage = "No items matched your search";
    const customIcon = "mdi:alert";

    const { container, getByText } = renderWithNuxt(NoResults, {
      props: {
        message: customMessage,
        icon: customIcon,
      },
    });

    // Act: find custom message and icon
    const message = getByText(customMessage);
    const icon = container.querySelector(".i-mdi\\:alert");

    // Assert: ensure custom values are displayed correctly
    expect(message).toBeInTheDocument();
    expect(icon).toBeTruthy();
  });
});
