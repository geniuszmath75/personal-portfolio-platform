<template>
  <textarea
    :id="id"
    v-model="inputValue"
    :disabled="isDisabled"
    rows="6"
    :placeholder="placeholder"
    :class="[
      'w-full px-4 py-3 bg-primary-600 border-2 rounded-lg text-secondary-500',
      'placeholder-secondary-700 focus:outline-none transition-all resize-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      invalidClasses,
    ]"
  />
</template>
<script setup lang="ts">
import type { BaseTextareaProps } from "~/types/components";

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  rows: 6,
  isValid: true,
  isDisabled: false,
});

const inputValue = defineModel<string>({ default: "" });

const invalidClasses = computed(() =>
  props.isValid
    ? "border-secondary-700 focus:border-secondary-300"
    : "border-additional-500 focus:border-additional-500",
);
</script>
