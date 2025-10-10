<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex items-center justify-center gap-4 flex-wrap">
      <Icon :name="icon" class="text-secondary-500 text-xl md:text-2xl" />
      <p class="md:text-lg text-center text-secondary-500 font-semibold">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    message?: string;
  }>(),
  {
    icon: "mdi:magnify-remove-outline",
    message: "No results found",
  },
);
</script>
