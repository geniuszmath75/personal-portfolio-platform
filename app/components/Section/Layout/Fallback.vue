<template>
  <div class="container h-10 mx-auto px-6 py-12 text-center">
    <p class="text-primary-500">New section soon: {{ section.type }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";

defineProps<{
  section: ValidatedSection;
}>();
</script>
