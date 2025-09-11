<template>
  <div class="h-16 md:h-20 w-full bg-primary-500">
    <div class="h-full flex justify-center">
      <div class="flex items-center justify-center space-x-2">
        <Icon name="mdi:copyright" class="text-secondary-500" />
        <span class="text-secondary-500 font-semibold text-sm md:text-base">
          Damian Judka
        </span>
        <span class="text-secondary-500 font-semibold text-sm md:text-base">{{
          "2023 - " + getCurrentYear()
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const getCurrentYear = () => new Date().getFullYear();
</script>
