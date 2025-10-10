<template>
  <div
    class="flex flex-col bg-secondary-500 rounded-lg shadow-sm border border-secondary-500 overflow-hidden h-full"
    :class="[getWidthClass]"
  >
    <!-- Header -->
    <div class="bg-secondary-500 text-primary-500 py-2 px-4">
      <h3 class="text-lg md:text-xl text-center md:text-left font-bold">
        {{ heading }}
      </h3>
    </div>

    <!-- Content -->
    <div class="flex-1 p-4" :class="[getTypeClass]">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ProjectPanelProps } from "~/types/components";

const props = withDefaults(defineProps<ProjectPanelProps>(), {
  heading: "BASIC INFORMATION",
  fullWidth: false,
  type: "primary",
});

// CLASSES:

/**
 * Calculate CSS classes for ProjectPanel width
 */
const getWidthClass = computed(() => {
  return props.fullWidth ? "col-span-full" : "w-auto";
});

/**
 * Calculate CSS classes for ProjectPanel based on type prop
 */
const getTypeClass = computed(() => {
  switch (props.type) {
    case "secondary":
      return "bg-secondary-500 text-primary-500";
    default:
      return "bg-primary-500 text-secondary-500";
  }
});
</script>
