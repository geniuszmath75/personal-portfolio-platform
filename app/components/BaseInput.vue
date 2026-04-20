<template>
  <input
    :id="id"
    v-model="inputValue"
    :type="type"
    :name="name"
    :min="resolvedMin"
    :max="resolvedMax"
    :disabled="isDisabled"
    :class="[
      'w-full px-4 py-3 bg-primary-600 border-2 rounded-lg text-secondary-500 placeholder-secondary-700 focus:outline-none  transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      type === 'date' ? 'date-input' : '',
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
 * For type="date": if min/max are not provided, default to -+10 years from today.
 * For other types: pass through min/max as-is (undefined if not set).
 */
const resolvedMin = computed(() => {
  if (props.type !== "date") return props.min;
  if (props.min !== undefined) return props.min;
  const d = new Date();
  d.setFullYear(d.getFullYear() - 10);
  return d.toISOString().slice(0, 10);
});

const resolvedMax = computed(() => {
  if (props.type !== "date") return props.max;
  if (props.max !== undefined) return props.max;
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d.toISOString().slice(0, 10);
});

/**
 * Computed classes for invalid input state
 */
const invalidInputClasses = computed(() => {
  return props.isValid
    ? "border-secondary-700 focus:border-secondary-300"
    : "border-additional-500 focus:border-additional-500";
});
</script>

<style scoped>
/**
 * Styles for the date input calendar picker
 */
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.6);
  cursor: pointer;
}
</style>
