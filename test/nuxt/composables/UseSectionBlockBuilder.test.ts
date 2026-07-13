import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mount } from "vue-composable-tester";
import { useSectionBlockBuilder } from "~/composables/useSectionBlockBuilder";
import * as validateSectionBlockDraftModule from "~/utils/validateSectionBlockDraft";
import { BlockKind, ISectionType } from "~~/shared/types/enums";
import type { UploadFileInfo } from "~/types/components";

const mockImageFile = new File(["img"], "hero.jpg", { type: "image/jpeg" });

function mockUploadInfo(
  overrides: Partial<UploadFileInfo> = {},
): UploadFileInfo[] {
  return [
    {
      id: "file-1",
      name: "hero.jpg",
      file: mockImageFile,
      status: "pending",
      percentage: null,
      url: null,
      thumbnailUrl: "blob:mock-preview",
      type: "image/jpeg",
      errorMessage: null,
      altText: "Hero image",
      ...overrides,
    },
  ];
}

function mountUseSectionBlockBuilder(
  initialBlocks: Block[] = [],
  sectionType = ISectionType.HERO,
) {
  const blocks = ref<Block[]>(structuredClone(initialBlocks));
  const type = ref(sectionType);

  const { result } = mount(() => useSectionBlockBuilder(blocks, type));

  return { result, blocks, type };
}

describe("useSectionBlockBuilder", () => {
  describe("initial state", () => {
    it("should start with a closed editor and no saved blocks", () => {
      const { result } = mountUseSectionBlockBuilder();

      expect(result.editorOpen.value).toBe(false);
      expect(result.editorMode.value).toBe("add");
      expect(result.draftBlock.value).toBeNull();
      expect(result.editorError.value).toBe("");
      expect(result.hasMinimumBlocks.value).toBe(false);
      expect(result.addableBlockKinds.value).toEqual([
        BlockKind.PARAGRAPH,
        BlockKind.IMAGE,
        BlockKind.BUTTON,
      ]);
    });
  });

  describe("paragraph blocks", () => {
    it("should open add editor with an empty paragraph draft", () => {
      const { result } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.PARAGRAPH);

      expect(result.editorOpen.value).toBe(true);
      expect(result.editorMode.value).toBe("add");
      expect(result.draftBlock.value).toEqual({
        kind: BlockKind.PARAGRAPH,
        paragraphs: [""],
      });
    });

    it("should save a normalized paragraph block and close the editor", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.PARAGRAPH);
      result.draftBlock.value = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["  Hello world  ", "   "],
      };

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value).toEqual([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello world"] },
      ]);
      expect(result.editorOpen.value).toBe(false);
      expect(result.hasMinimumBlocks.value).toBe(true);
    });

    it("should keep validation errors in the editor when save fails", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.PARAGRAPH);
      result.draftBlock.value = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["   "],
      };

      expect(result.saveEditor()).toBe(false);
      expect(result.editorError.value).toBe(
        "At least one paragraph is required",
      );
      expect(blocks.value).toEqual([]);
      expect(result.editorOpen.value).toBe(true);
    });

    it("should not mutate the saved block when edit is cancelled", () => {
      const { result, blocks } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
      ]);

      result.openEditEditor(0);
      result.draftBlock.value = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Changed"],
      };
      result.closeEditor();

      expect(blocks.value[0]).toEqual({
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Hello"],
      });
    });

    it("should update an existing paragraph block on save", () => {
      const { result, blocks } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hello"] },
      ]);

      result.openEditEditor(0);
      result.draftBlock.value = {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Updated copy"],
      };

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value[0]).toEqual({
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Updated copy"],
      });
      expect(result.editorMode.value).toBe("edit");
    });
  });

  describe("addable block kinds", () => {
    it("should hide block kinds that reached the section type limit", () => {
      const { result } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Hero title"] },
      ]);

      expect(result.addableBlockKinds.value).toEqual([
        BlockKind.IMAGE,
        BlockKind.BUTTON,
      ]);
    });
  });

  describe("button blocks", () => {
    it("should save a normalized button block", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.BUTTON);
      result.draftBlock.value = {
        kind: BlockKind.BUTTON,
        buttons: ["  PROJECTS  ", "  ", "ABOUT"],
      };

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value).toEqual([
        { kind: BlockKind.BUTTON, buttons: ["PROJECTS", "ABOUT"] },
      ]);
    });
  });

  describe("group blocks", () => {
    it("should save a normalized group block", () => {
      const { result, blocks } = mountUseSectionBlockBuilder(
        [],
        ISectionType.SKILLS,
      );

      result.openAddEditor(BlockKind.GROUP);
      result.draftBlock.value = {
        kind: BlockKind.GROUP,
        header: "  Skills  ",
        items: [
          { icon: " mdi:code ", label: " TypeScript " },
          { icon: "  ", label: "Ignored" },
          { icon: "mdi:globe", label: "  " },
        ],
      };

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value).toEqual([
        {
          kind: BlockKind.GROUP,
          header: "Skills",
          items: [{ icon: "mdi:code", label: "TypeScript" }],
        },
      ]);
    });

    it("should drop an empty group header during normalization", () => {
      const { result, blocks } = mountUseSectionBlockBuilder(
        [],
        ISectionType.SKILLS,
      );

      result.openAddEditor(BlockKind.GROUP);
      result.draftBlock.value = {
        kind: BlockKind.GROUP,
        header: "   ",
        items: [{ icon: "mdi:code", label: "TypeScript" }],
      };

      expect(result.saveEditor()).toBe(true);

      const savedBlock = blocks.value[0];
      expect(savedBlock?.kind).toBe(BlockKind.GROUP);

      if (savedBlock?.kind !== BlockKind.GROUP) {
        throw new Error("Expected group block");
      }

      expect(savedBlock.header).toBeUndefined();
      expect(savedBlock.items).toEqual([
        { icon: "mdi:code", label: "TypeScript" },
      ]);
    });
  });

  describe("normalizeBlockDraft fallback", () => {
    it("should keep unsupported block kinds unchanged when validation passes", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();
      const unsupportedBlock = {
        kind: "UNKNOWN" as BlockKind,
        paragraphs: ["Legacy"],
      } as Block;

      vi.spyOn(
        validateSectionBlockDraftModule,
        "validateSectionBlockDraft",
      ).mockReturnValue(null);

      result.openAddEditor(BlockKind.PARAGRAPH);
      result.draftBlock.value = unsupportedBlock;

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value[0]).toEqual(unsupportedBlock);

      vi.restoreAllMocks();
    });
  });

  describe("block list operations", () => {
    it("should remove a block and close the editor when editing that block", () => {
      const { result, blocks } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      ]);

      result.openEditEditor(1);
      result.removeBlock(1);

      expect(blocks.value).toEqual([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
      ]);
      expect(result.editorOpen.value).toBe(false);
    });

    it("should move a block down in the list", () => {
      const { result, blocks } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      ]);

      result.moveBlock(0, "down");

      expect(blocks.value).toEqual([
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
        { kind: BlockKind.PARAGRAPH, paragraphs: ["First"] },
      ]);
    });

    it("should ignore move requests outside list bounds", () => {
      const { result, blocks } = mountUseSectionBlockBuilder([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Only block"] },
      ]);

      result.moveBlock(0, "up");

      expect(blocks.value).toEqual([
        { kind: BlockKind.PARAGRAPH, paragraphs: ["Only block"] },
      ]);
    });
  });

  describe("pending image blocks", () => {
    it("should save a pending image block without uploading immediately", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageChange(mockUploadInfo());

      expect(result.saveEditor()).toBe(true);
      expect(blocks.value).toEqual([
        {
          kind: BlockKind.IMAGE,
          images: [{ srcPath: "", altText: "Hero image" }],
        },
      ]);
      expect(result.pendingSectionImages.value.get(0)?.file?.name).toBe(
        "hero.jpg",
      );
      const previewBlock = result.blocksForPreview.value[0];
      expect(previewBlock?.kind).toBe(BlockKind.IMAGE);

      if (previewBlock?.kind !== BlockKind.IMAGE) {
        throw new Error("Expected image block in preview");
      }

      expect(previewBlock.images[0]?.srcPath).toMatch(/^blob:/);
    });

    it("should clear pending image draft state when the file is removed", () => {
      const { result } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageChange(mockUploadInfo());
      result.handleDraftImageChange([
        {
          ...mockUploadInfo()[0]!,
          status: "removed",
        },
      ]);

      expect(result.draftBlock.value).toEqual({
        kind: BlockKind.IMAGE,
        images: [{ srcPath: "", altText: "" }],
      });
      expect(result.saveEditor()).toBe(false);
      expect(result.editorError.value).toBe("Image is required");
    });

    it("should hydrate edit mode from a pending image file", () => {
      const { result } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageChange(mockUploadInfo());
      result.saveEditor();

      const savedPreviewUrl =
        result.pendingSectionImages.value.get(0)?.previewUrl;

      result.openEditEditor(0);

      expect(result.draftImageFileList.value).toHaveLength(1);
      expect(result.draftImageFileList.value[0]?.file?.name).toBe("hero.jpg");
      expect(result.draftImageFileList.value[0]?.status).toBe("pending");
      expect(result.draftImageFileList.value[0]?.thumbnailUrl).toBe(
        savedPreviewUrl,
      );
    });

    it("should hydrate edit mode from an already uploaded image path", () => {
      const { result } = mountUseSectionBlockBuilder([
        {
          kind: BlockKind.IMAGE,
          images: [
            {
              srcPath: "/uploads/sections/hero.png",
              altText: "Hero",
            },
          ],
        },
      ]);

      result.openEditEditor(0);

      expect(result.draftImageFileList.value).toHaveLength(1);
      expect(result.draftImageFileList.value[0]?.srcPath).toBe(
        "/uploads/sections/hero.png",
      );
      expect(result.draftImageFileList.value[0]?.altText).toBe("Hero");
      expect(result.draftBlock.value).toEqual({
        kind: BlockKind.IMAGE,
        images: [
          {
            srcPath: "/uploads/sections/hero.png",
            altText: "Hero",
          },
        ],
      });
    });

    it("should reindex pending images after block removal", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageChange(mockUploadInfo());
      result.saveEditor();

      blocks.value.push({
        kind: BlockKind.BUTTON,
        buttons: ["ABOUT"],
      });

      result.removeBlock(0);

      expect(result.pendingSectionImages.value.has(0)).toBe(false);
      expect(blocks.value).toEqual([
        { kind: BlockKind.BUTTON, buttons: ["ABOUT"] },
      ]);
    });

    it("should move pending image state together with its block", () => {
      const { result, blocks } = mountUseSectionBlockBuilder();

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageChange(mockUploadInfo());
      result.saveEditor();

      blocks.value.push({
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Subtitle"],
      });

      const pendingBeforeMove = result.pendingSectionImages.value.get(0);

      result.moveBlock(0, "down");

      expect(blocks.value[0]?.kind).toBe(BlockKind.PARAGRAPH);
      expect(blocks.value[1]?.kind).toBe(BlockKind.IMAGE);
      expect(result.pendingSectionImages.value.get(1)?.file?.name).toBe(
        pendingBeforeMove?.file?.name,
      );
      expect(result.pendingSectionImages.value.has(0)).toBe(false);
    });

    it("should persist controlled file list updates in the editor", () => {
      const { result } = mountUseSectionBlockBuilder();
      const nextFileList = mockUploadInfo({ id: "controlled-file" });

      result.openAddEditor(BlockKind.IMAGE);
      result.handleDraftImageFileListUpdate(nextFileList);

      expect(result.draftImageFileList.value).toEqual(nextFileList);
    });
  });
});
