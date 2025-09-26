<template>
  <div
    class="flex w-full flex-col justify-center items-center col-span-full animate-pulse"
  >
    <Icon
      name="mdi:loading"
      class="animate-spin text-additional-500 text-6xl"
    />
    <span class="text-center text-secondary-500 text-3xl">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
const { label } = defineProps<{
  label: string;
}>();
</script>
