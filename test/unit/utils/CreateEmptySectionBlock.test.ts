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

  it("should create empty button block draft", () => {
    expect(createEmptySectionBlock(BlockKind.BUTTON)).toEqual({
      kind: BlockKind.BUTTON,
      buttons: [""],
    });
  });

  it("should create empty group block draft", () => {
    expect(createEmptySectionBlock(BlockKind.GROUP)).toEqual({
      kind: BlockKind.GROUP,
      items: [{ icon: "", label: "" }],
    });
  });

  it("should throw for unsupported block kinds", () => {
    expect(() => createEmptySectionBlock("UNKNOWN" as BlockKind)).toThrowError(
      "Unsupported block kind: UNKNOWN",
    );
  });
});
