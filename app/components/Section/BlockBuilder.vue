<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <SectionBuilderPreviewShell :metadata="metadata" :blocks="blocks" />

    <section class="space-y-4" aria-label="Add blocks">
      <h3
        class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
      >
        Add blocks
      </h3>

      <div
        v-if="addableBlockKinds.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <SectionBuilderSlot
          v-for="kind in addableBlockKinds"
          :key="kind"
          :kind="kind"
          :label="SECTION_BLOCK_KIND_LABELS[kind]"
          :disabled="disabled || editorOpen"
          @add="openAddEditor"
        />
      </div>

      <p v-else class="text-sm text-secondary-700">
        All allowed blocks for this section type have been added.
      </p>
    </section>

    <section class="space-y-4" aria-label="Section blocks">
      <h3
        class="text-lg font-semibold text-secondary-600 uppercase tracking-wider border-b border-primary-400 pb-2"
      >
        Blocks
      </h3>

      <p v-if="blocks.length === 0" class="text-sm text-secondary-700">
        Add at least one block before submitting the section.
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="(block, index) in blocks"
          :key="`${block.kind}-${index}`"
          class="flex flex-col gap-3 rounded-xl border border-secondary-700 bg-primary-600 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-bold text-secondary-500">
              {{ SECTION_BLOCK_KIND_LABELS[block.kind] }}
            </p>
            <p class="text-sm text-secondary-700 line-clamp-2">
              {{ getSectionBlockSummary(block) }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <BaseBtn
              type="button"
              label="Up"
              btn-style="secondary"
              btn-size="small"
              :is-disabled="disabled || editorOpen || index === 0"
              @click="moveBlock(index, 'up')"
            />
            <BaseBtn
              type="button"
              label="Down"
              btn-style="secondary"
              btn-size="small"
              :is-disabled="
                disabled || editorOpen || index === blocks.length - 1
              "
              @click="moveBlock(index, 'down')"
            />
            <BaseBtn
              type="button"
              label="Edit"
              btn-style="secondary"
              btn-size="small"
              :is-disabled="disabled"
              @click="openEditEditor(index)"
            />
            <BaseBtn
              type="button"
              label="Remove"
              btn-style="secondary"
              btn-size="small"
              :is-disabled="disabled || editorOpen"
              @click="removeBlock(index)"
            />
          </div>
        </li>
      </ul>

      <p
        v-if="!hasMinimumBlocks"
        class="text-sm text-additional-500 font-semibold"
      >
        At least one block is required.
      </p>
    </section>

    <SectionBuilderBlockEditorDrawer
      v-model="draftBlock"
      :open="editorOpen"
      :mode="editorMode"
      :error="editorError"
      :disabled="disabled"
      :is-uploading-image="isUploadingImage"
      :upload-image="uploadDraftImage"
      @close="closeEditor"
      @save="saveEditor"
    />
  </div>
</template>

<script setup lang="ts">
import type { SectionBlockBuilderProps } from "~/types/sectionForm";
import {
  getSectionBlockSummary,
  SECTION_BLOCK_KIND_LABELS,
} from "~/utils/sectionBlockLabels";

const blocks = defineModel<Block[]>("blocks", { required: true });

const props = defineProps<SectionBlockBuilderProps>();

const sectionType = computed(() => props.metadata.type);

const {
  addableBlockKinds,
  hasMinimumBlocks,
  editorOpen,
  editorMode,
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
} = useSectionBlockBuilder(blocks, sectionType);
</script>
