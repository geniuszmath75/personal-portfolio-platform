import { getAddableBlockKinds } from "~~/shared/config/sectionBuilder";
import { type ISectionType, BlockKind } from "~~/shared/types/enums";
import type { UploadFileInfo } from "~/types/components";
import type {
  SectionPendingImageState,
  SectionBlockEditorMode,
} from "~/types/sectionForm";
import { createEmptySectionBlock } from "~/utils/createEmptySectionBlock";
import { resolveSectionImageSrc } from "~/utils/resolveSectionImageSrc";
import { validateSectionBlockDraft } from "~/utils/validateSectionBlockDraft";
import type { InjectionKey } from "vue";

function normalizeBlockDraft(block: Block): Block {
  switch (block.kind) {
    case BlockKind.PARAGRAPH:
      return {
        ...block,
        paragraphs: block.paragraphs
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
      };
    case BlockKind.IMAGE:
      return {
        ...block,
        images: block.images.map((image) => ({
          srcPath: image.srcPath.trim(),
          altText: image.altText.trim(),
        })),
      };
    case BlockKind.BUTTON:
      return {
        ...block,
        buttons: block.buttons.map((button) => button.trim()).filter(Boolean),
      };
    case BlockKind.GROUP:
      return {
        ...block,
        header: block.header?.trim() || undefined,
        items: block.items
          .map((item) => ({
            icon: item.icon.trim(),
            label: item.label.trim(),
          }))
          .filter((item) => item.icon && item.label),
      };
    default:
      return block;
  }
}

function reindexPendingImagesAfterRemoval(
  pendingImages: Map<number, SectionPendingImageState>,
  removedIndex: number,
): Map<number, SectionPendingImageState> {
  const next = new Map<number, SectionPendingImageState>();

  for (const [index, value] of pendingImages) {
    if (index < removedIndex) {
      next.set(index, value);
    } else if (index > removedIndex) {
      next.set(index - 1, value);
    }
  }

  return next;
}

function swapPendingImages(
  pendingImages: Map<number, SectionPendingImageState>,
  fromIndex: number,
  toIndex: number,
): Map<number, SectionPendingImageState> {
  const next = new Map(pendingImages);
  const fromValue = next.get(fromIndex);
  const toValue = next.get(toIndex);

  if (fromValue) {
    next.set(toIndex, fromValue);
  } else {
    next.delete(toIndex);
  }

  if (toValue) {
    next.set(fromIndex, toValue);
  } else {
    next.delete(fromIndex);
  }

  return next;
}

function revokePendingPreview(pending: SectionPendingImageState | undefined) {
  if (pending?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(pending.previewUrl);
  }
}

export function useSectionBlockBuilder(
  blocks: Ref<Block[]>,
  sectionType: Ref<ISectionType>,
) {
  const editorOpen = ref(false);
  const editorMode = ref<SectionBlockEditorMode>("add");
  const editorIndex = ref<number | null>(null);
  const draftBlock = ref<Block | null>(null);
  const editorError = ref("");
  const draftImageFileList = ref<UploadFileInfo[]>([]);
  const draftPendingImage = ref<SectionPendingImageState | null>(null);
  const pendingSectionImages = ref<Map<number, SectionPendingImageState>>(
    new Map(),
  );

  const addableBlockKinds = computed(() =>
    getAddableBlockKinds(sectionType.value, blocks.value),
  );

  const hasMinimumBlocks = computed(() => blocks.value.length >= 1);

  const blocksForPreview = computed(() =>
    blocks.value.map((block, index) => {
      if (block.kind !== BlockKind.IMAGE) {
        return block;
      }

      const pending = pendingSectionImages.value.get(index);

      if (!pending?.previewUrl) {
        return block;
      }

      return {
        ...block,
        images: [
          {
            srcPath: pending.previewUrl,
            altText: block.images[0]?.altText ?? pending.altText,
          },
        ],
      };
    }),
  );

  const clearDraftImageState = () => {
    draftImageFileList.value = [];
    draftPendingImage.value = null;
  };

  const hydrateDraftImageState = (block: Block, index: number) => {
    if (block.kind !== BlockKind.IMAGE) {
      return;
    }

    const pending = pendingSectionImages.value.get(index);
    const image = block.images[0];

    if (pending?.file) {
      draftImageFileList.value = [
        {
          id: crypto.randomUUID(),
          name: pending.file.name,
          file: pending.file,
          status: "pending",
          percentage: null,
          url: null,
          thumbnailUrl: pending.previewUrl ?? URL.createObjectURL(pending.file),
          type: pending.file.type || null,
          errorMessage: null,
          altText: pending.altText,
        },
      ];
      draftPendingImage.value = {
        file: pending.file,
        altText: pending.altText,
        previewUrl: pending.previewUrl,
      };
      return;
    }

    if (image?.srcPath) {
      const resolvedSrc = resolveSectionImageSrc(image.srcPath);

      draftImageFileList.value = [
        {
          id: crypto.randomUUID(),
          name: image.altText || "image",
          file: null,
          status: "finished",
          percentage: 100,
          thumbnailUrl: resolvedSrc,
          url: resolvedSrc,
          srcPath: image.srcPath,
          altText: image.altText,
          type: null,
          errorMessage: null,
        },
      ];
      draftPendingImage.value = {
        file: null,
        altText: image.altText,
        srcPath: image.srcPath,
      };
      return;
    }

    clearDraftImageState();
  };

  /**
   * Persists image FileUpload state in controlled mode.
   */
  const handleDraftImageFileListUpdate = (files: UploadFileInfo[]) => {
    draftImageFileList.value = files;
  };

  /**
   * Syncs pending image selection from FileUpload @change.
   */
  const handleDraftImageChange = (files: UploadFileInfo[]) => {
    const file = files[0];

    if (!file || file.status === "removed") {
      draftPendingImage.value = null;

      if (draftBlock.value?.kind === BlockKind.IMAGE) {
        draftBlock.value.images[0] = { srcPath: "", altText: "" };
      }

      return;
    }

    if (file.status === "error") {
      draftPendingImage.value = null;
      return;
    }

    draftPendingImage.value = {
      file: file.file,
      altText: file.altText.trim(),
      ...(!file.file && file.srcPath ? { srcPath: file.srcPath } : {}),
    };

    if (draftBlock.value?.kind === BlockKind.IMAGE) {
      draftBlock.value.images[0] = {
        srcPath: file.file ? "" : (file.srcPath ?? ""),
        altText: file.altText.trim(),
      };
    }
  };

  /**
   * Opens the editor for a new block of the given kind.
   */
  const openAddEditor = (kind: BlockKind) => {
    editorMode.value = "add";
    editorIndex.value = null;
    clearDraftImageState();
    draftBlock.value = createEmptySectionBlock(kind);
    editorError.value = "";
    editorOpen.value = true;
  };

  /**
   * Opens the editor for an existing block.
   */
  const openEditEditor = (index: number) => {
    const block = blocks.value[index];

    if (!block) {
      return;
    }

    editorMode.value = "edit";
    editorIndex.value = index;
    clearDraftImageState();
    draftBlock.value = JSON.parse(JSON.stringify(toRaw(block))) as Block;
    hydrateDraftImageState(draftBlock.value, index);
    editorError.value = "";
    editorOpen.value = true;
  };

  /**
   * Closes the block editor without saving changes.
   */
  const closeEditor = () => {
    editorOpen.value = false;
    editorIndex.value = null;
    draftBlock.value = null;
    editorError.value = "";
    clearDraftImageState();
  };

  /**
   * Persists the current draft block into the blocks list.
   *
   * @returns true when the draft was saved
   */
  const saveEditor = (): boolean => {
    if (!draftBlock.value) {
      return false;
    }

    const hasPendingImageFile =
      draftBlock.value.kind === BlockKind.IMAGE &&
      Boolean(draftPendingImage.value?.file);

    const validationError = validateSectionBlockDraft(draftBlock.value, {
      hasPendingImageFile,
    });

    if (validationError) {
      editorError.value = validationError;
      return false;
    }

    const normalizedBlock = normalizeBlockDraft(draftBlock.value);
    const targetIndex =
      editorMode.value === "add" || editorIndex.value === null
        ? blocks.value.length
        : editorIndex.value;

    if (editorMode.value === "add" || editorIndex.value === null) {
      blocks.value.push(normalizedBlock);
    } else {
      blocks.value[editorIndex.value] = normalizedBlock;
    }

    if (normalizedBlock.kind === BlockKind.IMAGE) {
      const pending = draftPendingImage.value;
      const nextPending = new Map(pendingSectionImages.value);
      const existingPending = nextPending.get(targetIndex);

      if (pending?.file) {
        revokePendingPreview(existingPending);
        nextPending.set(targetIndex, {
          file: pending.file,
          altText: pending.altText,
          previewUrl: URL.createObjectURL(pending.file),
        });
        blocks.value[targetIndex] = {
          ...normalizedBlock,
          images: [{ srcPath: "", altText: pending.altText }],
        };
      } else if (pending?.srcPath) {
        revokePendingPreview(existingPending);
        nextPending.delete(targetIndex);
      } else {
        revokePendingPreview(existingPending);
        nextPending.delete(targetIndex);
      }

      pendingSectionImages.value = nextPending;
    }

    closeEditor();
    return true;
  };

  /**
   * Removes a block from the list by index.
   */
  const removeBlock = (index: number) => {
    revokePendingPreview(pendingSectionImages.value.get(index));
    pendingSectionImages.value = reindexPendingImagesAfterRemoval(
      pendingSectionImages.value,
      index,
    );
    blocks.value.splice(index, 1);

    if (editorIndex.value === index) {
      closeEditor();
    }
  };

  /**
   * Moves a block up or down in the list.
   */
  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= blocks.value.length) {
      return;
    }

    const updated = [...blocks.value];
    const moved = updated.splice(index, 1)[0];

    if (!moved) {
      return;
    }

    updated.splice(targetIndex, 0, moved);
    blocks.value = updated;
    pendingSectionImages.value = swapPendingImages(
      pendingSectionImages.value,
      index,
      targetIndex,
    );
  };

  return {
    addableBlockKinds,
    hasMinimumBlocks,
    blocksForPreview,
    pendingSectionImages,
    editorOpen,
    editorMode,
    editorIndex,
    draftBlock,
    editorError,
    draftImageFileList,
    openAddEditor,
    openEditEditor,
    closeEditor,
    saveEditor,
    removeBlock,
    moveBlock,
    handleDraftImageFileListUpdate,
    handleDraftImageChange,
  };
}

export type SectionBlockBuilderContext = ReturnType<
  typeof useSectionBlockBuilder
>;

/**
 * Injection key for sharing block builder state between the form and builder UI.
 */
export const sectionBlockBuilderKey: InjectionKey<SectionBlockBuilderContext> =
  Symbol("sectionBlockBuilder");
