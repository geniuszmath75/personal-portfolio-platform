<template>
  <NuxtLink :to="editUrl" :class="linkClasses" :aria-label="ariaLabel">
    <Icon name="mdi:pencil" class="text-primary-500 text-2xl" />
  </NuxtLink>
</template>
<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const editUrl = computed(() => `/sections/${props.slug}/edit`);

const ariaLabel = computed(() => `Edit ${props.slug} section`);

const linkClasses =
  "flex h-12 w-12 items-center justify-center rounded-full bg-additional-500 text-primary-500 shadow-additional transition-all duration-200 ease-out hover:bg-additional-600";
</script>
