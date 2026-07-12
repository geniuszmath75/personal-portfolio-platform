<template>
  <div class="space-y-4">
    <div
      v-for="(paragraph, index) in block.paragraphs"
      :key="index"
      class="space-y-2"
    >
      <label class="block text-sm font-bold text-secondary-500">
        Paragraph {{ index + 1 }}
      </label>
      <div class="flex justify-center items-center gap-3">
        <BaseTextarea
          :id="`paragraph-${index}`"
          v-model="block.paragraphs[index]"
          :disabled="disabled"
          :rows="3"
          placeholder="Enter paragraph text"
        />
        <button
          v-if="block.paragraphs.length > 1"
          type="button"
          class="relative flex justify-center items-center text-secondary-500 hover:text-additional-500 transition-colors shrink-0"
          @click="removeParagraph(index)"
        >
          <Icon name="mdi:close" class="text-xl" />
        </button>
      </div>
    </div>

    <BaseBtn
      type="button"
      label="Add paragraph"
      btn-style="secondary"
      btn-size="small"
      :is-disabled="disabled"
      @click="addParagraph"
    />
  </div>
</template>

<script setup lang="ts">
import type { BlockKind } from "~~/shared/types/enums";

const block = defineModel<Extract<Block, { kind: BlockKind.PARAGRAPH }>>({
  required: true,
});

defineProps<{
  disabled?: boolean;
}>();

const addParagraph = () => {
  block.value.paragraphs.push("");
};

const removeParagraph = (index: number) => {
  block.value.paragraphs.splice(index, 1);
};
</script>
