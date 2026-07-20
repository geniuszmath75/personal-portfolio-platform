<template>
  <NuxtLink :to="editUrl" :aria-label="ariaLabel">
    <BaseBtn label="Edit Section" btn-size="large">
      <template #icon>
        <Icon
          name="mdi:pencil"
          class="absolute left-2 text-secondary-500 text-2xl"
        />
      </template>
    </BaseBtn>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const editUrl = computed(() => `/sections/${props.slug}/edit`);

const ariaLabel = computed(() => `Edit ${props.slug} section`);
</script>
