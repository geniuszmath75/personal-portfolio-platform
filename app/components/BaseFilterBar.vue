<template>
  <div
    class="flex items-center justify-center md:justify-end my-12 max-w-7xl mx-auto"
  >
    <!-- Limit selector -->
    <div
      class="inline-flex items-center justify-center p-2 space-x-2 bg-secondary-500"
    >
      <!-- Render one button for each available variant -->
      <button
        v-for="variant in variants"
        :key="'limit-variant-' + variant"
        :class="[
          'px-3 py-1 cursor-pointer rounded-lg',
          currentLimit === variant
            ? 'bg-additional-500'
            : 'bg-secondary-500 hover:bg-secondary-600',
        ]"
        @click="changeLimit(variant)"
      >
        <span class="text-primary-500 font-semibold">{{ variant }}</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * Two-way binding for selected limit value
 */
const currentLimit = defineModel<number>("limit");

/**
 * List of available limit options
 */
defineProps<{
  variants: number[];
}>();

/**
 * Update current limit when user selects a variant
 *
 * @param variant - selected limit's variant
 */
const changeLimit = (variant: number) => {
  currentLimit.value = variant;
};
</script>
