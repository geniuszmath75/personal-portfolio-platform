<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-bold text-secondary-500 mb-2">
        Group header
        <span class="text-secondary-700 font-normal ml-1">(optional)</span>
      </label>
      <BaseInput
        id="group-header"
        v-model="headerInput"
        :is-disabled="disabled"
        name="groupHeader"
        placeholder="Frontend"
      />
    </div>

    <div
      v-for="(item, index) in block.items"
      :key="index"
      class="relative space-y-3 rounded-lg border border-secondary-700 p-4"
    >
      <label class="block text-sm font-bold text-secondary-500">
        Item {{ index + 1 }}
      </label>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-secondary-500 mb-2">
            Icon
          </label>
          <BaseInput
            :id="`group-icon-${index}`"
            v-model="item.icon"
            :is-disabled="disabled"
            name="groupIcon"
            placeholder="mdi:vuejs"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-secondary-500 mb-2">
            Label
          </label>
          <BaseInput
            :id="`group-label-${index}`"
            v-model="item.label"
            :is-disabled="disabled"
            name="groupLabel"
            placeholder="Vue.js"
          />
        </div>
      </div>

      <button
        v-if="block.items.length > 1"
        type="button"
        class="absolute top-1 right-3 flex justify-center items-center text-additional-500 bg-transparent hover:text-primary-500 hover:bg-additional-500 rounded-full transition-colors shrink-0"
        @click="removeItem(index)"
      >
        <Icon name="mdi:close" class="text-2xl" />
      </button>
    </div>

    <BaseBtn
      type="button"
      label="Add item"
      btn-style="secondary"
      btn-size="small"
      :is-disabled="disabled"
      @click="addItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { BlockKind } from "~~/shared/types/enums";

const block = defineModel<Extract<Block, { kind: BlockKind.GROUP }>>({
  required: true,
});

defineProps<{
  disabled?: boolean;
}>();

const headerInput = computed({
  get: () => block.value.header ?? "",
  set: (value: string) => {
    block.value.header = value.trim() ? value : undefined;
  },
});

const addItem = () => {
  block.value.items.push({ icon: "", label: "" });
};

const removeItem = (index: number) => {
  block.value.items.splice(index, 1);
};
</script>
