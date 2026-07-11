import { BlockKind } from "../../shared/types/enums";

export const SECTION_BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  [BlockKind.PARAGRAPH]: "Paragraph",
  [BlockKind.IMAGE]: "Image",
  [BlockKind.BUTTON]: "Button",
  [BlockKind.GROUP]: "Group",
};

/**
 * Returns a short summary for a block in the builder list.
 */
export function getSectionBlockSummary(block: Block): string {
  switch (block.kind) {
    case BlockKind.PARAGRAPH:
      return (
        block.paragraphs.find((paragraph) => paragraph.trim()) ??
        "Empty paragraph"
      );
    case BlockKind.IMAGE:
      return (
        block.images[0]?.altText || block.images[0]?.srcPath || "Empty image"
      );
    case BlockKind.BUTTON:
      return block.buttons.join(", ") || "Empty button";
    case BlockKind.GROUP:
      return (
        block.header ||
        block.items.map((item) => item.label).join(", ") ||
        "Empty group"
      );
    default:
      return "Block";
  }
}
