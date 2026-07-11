import { describe, expect, it } from "vitest";
import { BlockKind } from "../../../shared/types/enums";
import { createEmptySectionBlock } from "../../../app/utils/createEmptySectionBlock";

describe("CreateEmptySectionBlock", () => {
  it("should create empty paragraph block draft", () => {
    expect(createEmptySectionBlock(BlockKind.PARAGRAPH)).toEqual({
      kind: BlockKind.PARAGRAPH,
      paragraphs: [""],
    });
  });

  it("should create empty image block draft", () => {
    expect(createEmptySectionBlock(BlockKind.IMAGE)).toEqual({
      kind: BlockKind.IMAGE,
      images: [{ srcPath: "", altText: "" }],
    });
  });
});
