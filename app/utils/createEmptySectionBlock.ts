import { BlockKind } from "../../shared/types/enums";

/**
 * Creates an empty draft block for the builder editor.
 */
export function createEmptySectionBlock(kind: BlockKind): Block {
  switch (kind) {
    case BlockKind.PARAGRAPH:
      return { kind: BlockKind.PARAGRAPH, paragraphs: [""] };
    case BlockKind.IMAGE:
      return {
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "", altText: "" }],
      };
    case BlockKind.BUTTON:
      return { kind: BlockKind.BUTTON, buttons: [""] };
    case BlockKind.GROUP:
      return {
        kind: BlockKind.GROUP,
        items: [{ icon: "", label: "" }],
      };
    default:
      throw new Error(`Unsupported block kind: ${kind satisfies never}`);
  }
}
