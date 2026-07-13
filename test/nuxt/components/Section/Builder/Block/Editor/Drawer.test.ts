import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { ref } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import Drawer from "~/components/Section/Builder/Block/Editor/Drawer.vue";
import { BlockKind } from "~~/shared/types/enums";
import type { SectionBlockEditorMode } from "~/types/sectionForm";

function renderDrawer(
  options: {
    open?: boolean;
    mode?: SectionBlockEditorMode;
    error?: string;
    disabled?: boolean;
    draftBlock?: Block | null;
  } = {},
) {
  const draftBlock = ref<Block | null>(
    options.draftBlock === undefined
      ? { kind: BlockKind.PARAGRAPH, paragraphs: [""] }
      : options.draftBlock,
  );

  const onImageFileListUpdate = vi.fn();
  const onImageChange = vi.fn();

  const view = renderWithNuxt(Drawer, {
    props: {
      modelValue: draftBlock.value,
      open: options.open ?? true,
      mode: options.mode ?? "add",
      error: options.error ?? "",
      disabled: options.disabled ?? false,
      imageFileList: [],
      onImageFileListUpdate,
      onImageChange,
      "onUpdate:modelValue": (value: Block | null) => {
        draftBlock.value = value;
      },
    },
  });

  return {
    draftBlock,
    onImageFileListUpdate,
    onImageChange,
    ...view,
  };
}

describe("SectionBuilderBlockEditorDrawer", () => {
  it("should not render when the drawer is closed", () => {
    renderDrawer({ open: false });

    expect(screen.queryByLabelText("Block editor")).not.toBeInTheDocument();
  });

  it("should not render when draft block is null", () => {
    renderDrawer({ draftBlock: null });

    expect(screen.queryByLabelText("Block editor")).not.toBeInTheDocument();
  });

  it("should render add mode title and paragraph editor", () => {
    renderDrawer({ mode: "add" });

    expect(screen.getByText("Add Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
  });

  it("should render edit mode title for button blocks", () => {
    renderDrawer({
      mode: "edit",
      draftBlock: { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
    });

    expect(screen.getByText("Edit Button")).toBeInTheDocument();
    expect(screen.getByText("Button label 1")).toBeInTheDocument();
  });

  it("should render group editor for group blocks", () => {
    renderDrawer({
      draftBlock: {
        kind: BlockKind.GROUP,
        items: [{ icon: "", label: "" }],
      },
    });

    expect(screen.getByText("Add Group")).toBeInTheDocument();
    expect(screen.getByText("Group header")).toBeInTheDocument();
  });

  it("should show validation error message", () => {
    renderDrawer({ error: "At least one paragraph is required" });

    expect(
      screen.getByText("At least one paragraph is required"),
    ).toBeInTheDocument();
  });

  it("should emit close when cancel is clicked", async () => {
    const { emitted } = renderDrawer();

    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(emitted()).toHaveProperty("close");
  });

  it("should emit close when close icon is clicked", async () => {
    const { emitted } = renderDrawer();

    await fireEvent.click(screen.getByLabelText("Close block editor"));

    expect(emitted()).toHaveProperty("close");
  });

  it("should emit save when save block is clicked", async () => {
    const { emitted } = renderDrawer();

    await fireEvent.click(screen.getByRole("button", { name: "Save block" }));

    expect(emitted()).toHaveProperty("save");
  });

  it("should disable actions when disabled prop is true", () => {
    renderDrawer({ disabled: true });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save block" })).toBeDisabled();
    expect(screen.getByPlaceholderText("Enter paragraph text")).toBeDisabled();
  });
});
