<template>
  <input
    :id="id"
    v-model="inputValue"
    :type="type"
    :name="name"
    :disabled="isDisabled"
    :class="[
      'w-full px-4 py-3 bg-primary-600 border-2 rounded-lg text-secondary-500 placeholder-secondary-700 focus:outline-none  transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      invalidInputClasses,
    ]"
    :placeholder="placeholder"
  />
</template>
<script setup lang="ts">
import type { BaseInputProps } from "~/types/components";

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: "text",
  placeholder: undefined,
  isValid: true,
  isDisabled: false,
});

const inputValue = defineModel<string>({ default: "" });

/**
 * Computed classes for invalid input state
 */
const invalidInputClasses = computed(() => {
  return props.isValid
    ? "border-secondary-700 focus:border-secondary-300"
    : "border-additional-500 focus:border-additional-500";
});
</script>
