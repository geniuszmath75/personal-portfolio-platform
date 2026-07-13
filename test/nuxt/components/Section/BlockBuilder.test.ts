import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/vue";
import { ref } from "vue";
import { renderWithNuxt } from "~~/test/setup";
import BlockBuilder from "~/components/Section/BlockBuilder.vue";
import { BlockKind, ISectionType } from "~~/shared/types/enums";
import type { SectionMetadataFormState } from "~/types/sectionForm";

function makeMetadata(
  overrides?: Partial<SectionMetadataFormState>,
): SectionMetadataFormState {
  return {
    title: "",
    slug: "",
    type: ISectionType.HERO,
    order: 1,
    ...overrides,
  };
}

function renderBlockBuilder(
  options: {
    blocks?: Block[];
    metadata?: Partial<SectionMetadataFormState>;
    disabled?: boolean;
  } = {},
) {
  const blocks = ref<Block[]>(structuredClone(options.blocks ?? []));

  const view = renderWithNuxt(BlockBuilder, {
    props: {
      blocks: blocks.value,
      metadata: makeMetadata(options.metadata),
      disabled: options.disabled,
      "onUpdate:blocks": (value: Block[]) => {
        blocks.value = value;
      },
    },
  });

  return { blocks, ...view };
}

async function saveParagraphBlock(text: string) {
  await fireEvent.click(screen.getByRole("button", { name: "Add Paragraph" }));

  const textarea = screen.getByPlaceholderText(
    "Enter paragraph text",
  ) as HTMLTextAreaElement;
  textarea.value = text;
  textarea.dispatchEvent(new Event("input"));

  await fireEvent.click(screen.getByRole("button", { name: "Save block" }));
}

describe("SectionBlockBuilder", () => {
  it("should render builder sections and empty state", () => {
    renderBlockBuilder();

    expect(screen.getByText("Live preview")).toBeInTheDocument();
    expect(screen.getByLabelText("Add blocks")).toBeInTheDocument();
    expect(screen.getByLabelText("Section blocks")).toBeInTheDocument();
    expect(
      screen.getByText("Add at least one block before submitting the section."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("At least one block is required."),
    ).toBeInTheDocument();
  });

  it("should render add slots for hero section types", () => {
    renderBlockBuilder();

    expect(
      screen.getByRole("button", { name: "Add Paragraph" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Image" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Button" }),
    ).toBeInTheDocument();
  });

  it("should open the drawer and save a paragraph block", async () => {
    const { blocks } = renderBlockBuilder();

    await saveParagraphBlock("Hello hero");

    expect(blocks.value).toEqual([
      { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello hero"] },
    ]);
    expect(
      screen.getByRole("heading", { name: "Hello hero" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Section blocks")).getByText("Hello hero"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Block editor")).not.toBeInTheDocument();
  });

  it("should show saved block summary in the blocks list", async () => {
    renderBlockBuilder();

    await saveParagraphBlock("Hero title");

    const blocksSection = screen.getByLabelText("Section blocks");
    expect(within(blocksSection).getByText("Paragraph")).toBeInTheDocument();
    expect(within(blocksSection).getByText("Hero title")).toBeInTheDocument();
  });

  it("should hide add slots when all hero blocks are added", () => {
    renderBlockBuilder({
      blocks: [
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hero title"] },
        {
          kind: BlockKind.IMAGE,
          images: [
            {
              srcPath: "/uploads/sections/hero.png",
              altText: "Hero image",
            },
          ],
        },
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      ],
    });

    expect(
      screen.getByText(
        "All allowed blocks for this section type have been added.",
      ),
    ).toBeInTheDocument();
  });

  it("should remove a saved block from the list", async () => {
    const { blocks } = renderBlockBuilder();

    await saveParagraphBlock("Hero title");

    const blocksSection = screen.getByLabelText("Section blocks");
    await fireEvent.click(
      within(blocksSection).getByRole("button", { name: "Remove" }),
    );

    expect(blocks.value).toEqual([]);
    expect(
      screen.getByText("Add at least one block before submitting the section."),
    ).toBeInTheDocument();
  });

  it("should move a block down in the list", async () => {
    const { blocks } = renderBlockBuilder({
      blocks: [
        { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      ],
    });

    const blocksSection = screen.getByLabelText("Section blocks");
    await fireEvent.click(
      within(blocksSection).getAllByRole("button", { name: "Down" })[0]!,
    );

    expect(blocks.value).toEqual([
      { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
    ]);
  });

  it("should disable builder actions when disabled prop is true", async () => {
    renderBlockBuilder({ disabled: true });

    expect(
      screen.getByRole("button", { name: "Add Paragraph" }),
    ).toBeDisabled();
  });
});
