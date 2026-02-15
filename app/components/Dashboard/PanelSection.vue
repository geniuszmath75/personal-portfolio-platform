<template>
  <div
    :class="['flex p-4 gap-4 shadow-secondaryTwo rounded-xl', containerClass]"
  >
    <div :class="['flex-1', contentClass]">
      <slot />
    </div>

    <div
      v-if="$slots.actions"
      class="flex items-end justify-center lg:justify-end"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    containerClass?: string;
    contentClass?: string;
  }>(),
  {
    containerClass: "flex-col lg:flex-row",
    contentClass: "",
  },
);
</script>
