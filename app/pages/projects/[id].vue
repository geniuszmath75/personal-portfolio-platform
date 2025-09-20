<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <h1>{{ `Project with ID = ${projectId}` }}</h1>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const projectId = computed(() => route.params.id);
</script>
