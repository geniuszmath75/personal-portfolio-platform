<template>
  <div class="space-y-2">
    <h3 class="text-lg md:text-xl text-secondary-500">{{ label }}</h3>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
