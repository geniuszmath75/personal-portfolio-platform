<template>
  <select
    :id="id"
    v-model="selected"
    :name="name"
    :disabled="isDisabled"
    :class="[
      'w-full px-4 py-3 bg-primary-600 border-2 rounded-lg text-secondary-500',
      'focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      invalidClasses,
    ]"
  >
    <slot />
  </select>
</template>
<script setup lang="ts">
import type { BaseSelectProps } from "~/types/components";

const props = withDefaults(defineProps<BaseSelectProps>(), {
  isValid: true,
  isDisabled: false,
});

const selected = defineModel<string>({ default: "" });

const invalidClasses = computed(() =>
  props.isValid
    ? "border-secondary-700 focus:border-secondary-300"
    : "border-additional-500 focus:border-additional-500",
);
</script>
