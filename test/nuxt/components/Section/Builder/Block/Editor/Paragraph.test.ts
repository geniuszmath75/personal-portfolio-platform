import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import { ref } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import ParagraphEditor from "~/components/Section/Builder/Block/Editor/Paragraph.vue";
import { BlockKind } from "~~/shared/types/enums";

function renderParagraphEditor(
  options: {
    paragraphs?: string[];
    disabled?: boolean;
  } = {},
) {
  const block = ref<Extract<Block, { kind: BlockKind.PARAGRAPH }>>({
    kind: BlockKind.PARAGRAPH,
    paragraphs: options.paragraphs ?? [""],
  });

  renderWithNuxt(ParagraphEditor, {
    props: {
      modelValue: block.value,
      disabled: options.disabled,
      "onUpdate:modelValue": (
        value: Extract<Block, { kind: BlockKind.PARAGRAPH }>,
      ) => {
        block.value = value;
      },
    },
  });

  return { block };
}

describe("SectionBuilderBlockEditorParagraph", () => {
  it("should render paragraph fields", () => {
    renderParagraphEditor({ paragraphs: ["Hello world"] });

    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter paragraph text")).toHaveValue(
      "Hello world",
    );
  });

  it("should add another paragraph field", async () => {
    const { block } = renderParagraphEditor();

    await fireEvent.click(
      screen.getByRole("button", { name: "Add paragraph" }),
    );

    expect(block.value.paragraphs).toHaveLength(2);
    expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
  });

  it("should remove a paragraph field when more than one exists", async () => {
    const { block } = renderParagraphEditor({
      paragraphs: ["First", "Second"],
    });

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => !button.textContent?.includes("Add paragraph"));

    await fireEvent.click(removeButtons[0]!);

    expect(block.value.paragraphs).toEqual(["Second"]);
  });

  it("should disable actions when disabled prop is true", () => {
    renderParagraphEditor({ disabled: true });

    expect(
      screen.getByRole("button", { name: "Add paragraph" }),
    ).toBeDisabled();
    expect(screen.getByPlaceholderText("Enter paragraph text")).toBeDisabled();
  });
});
