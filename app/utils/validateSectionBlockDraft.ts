import { BlockKind } from "../../shared/types/enums";

/**
 * Validates a block draft before it is saved in the builder.
 *
 * @returns error message when invalid, otherwise null
 */
export function validateSectionBlockDraft(block: Block): string | null {
  switch (block.kind) {
    case BlockKind.PARAGRAPH: {
      const hasContent = block.paragraphs.some((paragraph) => paragraph.trim());
      return hasContent ? null : "At least one paragraph is required";
    }
    case BlockKind.IMAGE: {
      const image = block.images[0];
      if (!image?.srcPath.trim()) {
        return "Image upload is required";
      }
      if (!image.altText.trim()) {
        return "Alt text is required";
      }
      return null;
    }
    case BlockKind.BUTTON: {
      const hasLabel = block.buttons.some((button) => button.trim());
      return hasLabel ? null : "At least one button label is required";
    }
    case BlockKind.GROUP: {
      const hasItem = block.items.some(
        (item) => item.icon.trim() && item.label.trim(),
      );
      return hasItem
        ? null
        : "At least one group item with icon and label is required";
    }
    default:
      return "Unsupported block type";
  }
}
