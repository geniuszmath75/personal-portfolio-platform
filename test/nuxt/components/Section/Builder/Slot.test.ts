import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { renderWithNuxt } from "~~/test/setup";
import Slot from "~/components/Section/Builder/Slot.vue";
import { BlockKind } from "~~/shared/types/enums";

function renderSlot(
  options: {
    kind?: BlockKind;
    label?: string;
    disabled?: boolean;
  } = {},
) {
  return renderWithNuxt(Slot, {
    props: {
      kind: options.kind ?? BlockKind.PARAGRAPH,
      label: options.label ?? "Paragraph",
      disabled: options.disabled,
    },
  });
}

describe("SectionBuilderSlot", () => {
  it("should render add button with label", () => {
    renderSlot({ kind: BlockKind.IMAGE, label: "Image" });

    expect(
      screen.getByRole("button", { name: "Add Image" }),
    ).toBeInTheDocument();
  });

  it("should emit add with block kind when clicked", async () => {
    const { emitted } = renderSlot({
      kind: BlockKind.BUTTON,
      label: "Button",
    });

    await fireEvent.click(screen.getByRole("button", { name: "Add Button" }));

    expect(emitted()).toHaveProperty("add");
    expect(emitted().add?.[0]).toEqual([BlockKind.BUTTON]);
  });

  it("should disable the add button when disabled prop is true", () => {
    renderSlot({ disabled: true });

    expect(
      screen.getByRole("button", { name: "Add Paragraph" }),
    ).toBeDisabled();
  });
});
