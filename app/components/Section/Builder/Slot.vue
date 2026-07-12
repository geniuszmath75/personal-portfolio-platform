<template>
  <div
    class="rounded-xl border border-dashed border-secondary-700 bg-primary-600/40 p-4 text-center"
  >
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg border border-secondary-500 px-4 py-2 text-sm font-semibold text-secondary-500 transition-colors hover:border-additional-500 hover:text-additional-500 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      @click="emit('add', kind)"
    >
      <Icon name="mdi:plus" class="text-lg" />
      Add {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { BlockKind } from "~~/shared/types/enums";
import type { SectionBuilderSlotProps } from "~/types/sectionForm";

defineProps<SectionBuilderSlotProps>();

const emit = defineEmits<{
  add: [kind: BlockKind];
}>();
</script>
