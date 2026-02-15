<template>
  <header class="p-4 text-secondary-500">
    <h2 class="text-2xl md:text-4xl text-center">{{ title }}</h2>
  </header>
</template>
<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
