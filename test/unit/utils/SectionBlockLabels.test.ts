import { describe, expect, it } from "vitest";
import { BlockKind } from "../../../shared/types/enums";
import {
  getSectionBlockSummary,
  SECTION_BLOCK_KIND_LABELS,
} from "../../../app/utils/sectionBlockLabels";

describe("SectionBlockLabels", () => {
  it("should expose labels for all block kinds", () => {
    expect(SECTION_BLOCK_KIND_LABELS[BlockKind.PARAGRAPH]).toBe("Paragraph");
  });

  it("should summarize button labels", () => {
    expect(
      getSectionBlockSummary({
        kind: BlockKind.BUTTON,
        buttons: ["PROJECTS", "ABOUT ME"],
      }),
    ).toBe("PROJECTS, ABOUT ME");
  });
});
