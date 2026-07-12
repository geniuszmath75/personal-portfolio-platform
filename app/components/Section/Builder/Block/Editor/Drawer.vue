<template>
  <section
    v-if="open && draftBlock"
    class="rounded-xl border border-additional-500 bg-primary-600 p-6 space-y-6"
    aria-label="Block editor"
  >
    <div class="flex items-center justify-between gap-4">
      <h3 class="text-lg font-semibold text-secondary-500">
        {{ mode === "add" ? "Add" : "Edit" }} {{ blockLabel }}
      </h3>
      <button
        type="button"
        class="text-secondary-700 hover:text-secondary-500"
        aria-label="Close block editor"
        @click="emit('close')"
      >
        <Icon name="mdi:close" class="text-2xl" />
      </button>
    </div>

    <SectionBuilderBlockEditorParagraph
      v-if="draftBlock.kind === BlockKind.PARAGRAPH"
      v-model="draftBlock"
      :disabled="disabled"
    />
    <SectionBuilderBlockEditorButton
      v-else-if="draftBlock.kind === BlockKind.BUTTON"
      v-model="draftBlock"
      :disabled="disabled"
    />
    <SectionBuilderBlockEditorGroup
      v-else-if="draftBlock.kind === BlockKind.GROUP"
      v-model="draftBlock"
      :disabled="disabled"
    />

    <p v-if="error" class="text-sm text-additional-500 font-semibold">
      {{ error }}
    </p>

    <div class="flex flex-col md:flex-row justify-end gap-3">
      <BaseBtn
        type="button"
        label="Cancel"
        btn-style="additional-transparent"
        btn-size="small"
        :is-disabled="disabled"
        @click="emit('close')"
      />
      <BaseBtn
        type="button"
        label="Save block"
        btn-size="small"
        :is-disabled="disabled || isUploadingImage"
        @click="emit('save')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { BlockKind } from "~~/shared/types/enums";
import { SECTION_BLOCK_KIND_LABELS } from "~/utils/sectionBlockLabels";
import type { SectionBlockEditorDrawerProps } from "~/types/sectionForm";

const draftBlock = defineModel<Block | null>({ required: true });

defineProps<SectionBlockEditorDrawerProps>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const blockLabel = computed(() => {
  if (!draftBlock.value) {
    return "block";
  }

  return SECTION_BLOCK_KIND_LABELS[draftBlock.value.kind];
});
</script>
