<template>
  <div class="space-y-4">
    <div v-for="(_, index) in block.buttons" :key="index" class="space-y-2">
      <label class="block text-sm font-bold text-secondary-500">
        Button label {{ index + 1 }}
      </label>
      <div class="flex justify-center items-center gap-3">
        <BaseInput
          :id="`button-label-${index}`"
          v-model="block.buttons[index]"
          :is-disabled="disabled"
          name="buttonLabel"
          placeholder="PROJECTS"
        />
        <button
          v-if="block.buttons.length > 1"
          type="button"
          class="relative flex justify-center items-center text-secondary-500 hover:text-additional-500 transition-colors shrink-0"
          @click="removeButton(index)"
        >
          <Icon name="mdi:close" class="text-xl" />
        </button>
      </div>
    </div>

    <BaseBtn
      type="button"
      label="Add button"
      btn-style="secondary"
      btn-size="small"
      :is-disabled="disabled"
      @click="addButton"
    />
  </div>
</template>

<script setup lang="ts">
import type { BlockKind } from "~~/shared/types/enums";

const block = defineModel<Extract<Block, { kind: BlockKind.BUTTON }>>({
  required: true,
});

defineProps<{
  disabled?: boolean;
}>();

const addButton = () => {
  block.value.buttons.push("");
};

const removeButton = (index: number) => {
  block.value.buttons.splice(index, 1);
};
</script>
