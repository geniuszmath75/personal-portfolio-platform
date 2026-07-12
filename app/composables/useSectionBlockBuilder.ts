import { getAddableBlockKinds } from "~~/shared/config/sectionBuilder";
import { type ISectionType, BlockKind } from "~~/shared/types/enums";
import { createEmptySectionBlock } from "~/utils/createEmptySectionBlock";
import { validateSectionBlockDraft } from "~/utils/validateSectionBlockDraft";
import type { SectionBlockEditorMode } from "~/types/sectionForm";

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

export function useSectionBlockBuilder(
  blocks: Ref<Block[]>,
  sectionType: Ref<ISectionType>,
) {
  const sectionsStore = useSectionsStore();

  const editorOpen = ref(false);
  const editorMode = ref<SectionBlockEditorMode>("add");
  const editorIndex = ref<number | null>(null);
  const draftBlock = ref<Block | null>(null);
  const editorError = ref("");
  const isUploadingImage = ref(false);

  const addableBlockKinds = computed(() =>
    getAddableBlockKinds(sectionType.value, blocks.value),
  );

  const hasMinimumBlocks = computed(() => blocks.value.length >= 1);

  /**
   * Opens the editor for a new block of the given kind.
   */
  const openAddEditor = (kind: BlockKind) => {
    editorMode.value = "add";
    editorIndex.value = null;
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
    draftBlock.value = block;
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

    const validationError = validateSectionBlockDraft(draftBlock.value);

    if (validationError) {
      editorError.value = validationError;
      return false;
    }

    const normalizedBlock = normalizeBlockDraft(draftBlock.value);

    if (editorMode.value === "add" || editorIndex.value === null) {
      blocks.value.push(normalizedBlock);
    } else {
      blocks.value[editorIndex.value] = normalizedBlock;
    }

    closeEditor();
    return true;
  };

  /**
   * Removes a block from the list by index.
   */
  const removeBlock = (index: number) => {
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
  };

  /**
   * Uploads a section image and stores the returned public URL in the draft.
   */
  const uploadDraftImage = async (file: File): Promise<string | null> => {
    isUploadingImage.value = true;

    try {
      return await sectionsStore.uploadSectionImage(file);
    } finally {
      isUploadingImage.value = false;
    }
  };

  return {
    addableBlockKinds,
    hasMinimumBlocks,
    editorOpen,
    editorMode,
    editorIndex,
    draftBlock,
    editorError,
    isUploadingImage,
    openAddEditor,
    openEditEditor,
    closeEditor,
    saveEditor,
    removeBlock,
    moveBlock,
    uploadDraftImage,
  };
}
