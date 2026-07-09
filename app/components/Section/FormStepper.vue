<template>
  <div class="max-w-3xl mx-auto mb-8 flex justify-center items-center gap-4">
    <div class="flex justify-center items-center flex-col gap-2">
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500"
        :class="step === 1 ? 'bg-secondary-500' : 'bg-additional-500'"
      >
        <span
          v-if="step === 1"
          class="text-sm font-semibold uppercase tracking-wider text-primary-500"
        >
          1.
        </span>
        <Icon v-else name="mdi:check" class="text-primary-500 text-2xl" />
      </div>
      <span
        class="text-sm font-semibold uppercase tracking-wider transition-colors duration-500"
        :class="step === 1 ? 'text-secondary-500' : 'text-secondary-700'"
      >
        Metadata
      </span>
    </div>

    <div class="relative w-20 h-0.5 bg-secondary-700 overflow-hidden rounded">
      <div
        class="absolute inset-0 bg-additional-500 origin-left transition-transform duration-500 ease-out"
        :class="step === 2 ? 'scale-x-100' : 'scale-x-0'"
      />
    </div>

    <div class="flex justify-center items-center flex-col gap-2">
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-500"
        :class="step === 1 ? 'bg-secondary-700' : 'bg-secondary-500'"
      >
        <span
          class="text-sm font-semibold uppercase tracking-wider text-primary-500"
        >
          2.
        </span>
      </div>
      <span
        class="text-sm font-semibold uppercase tracking-wider transition-colors duration-500"
        :class="step === 1 ? 'text-secondary-700' : 'text-secondary-500'"
      >
        Blocks
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  step: 1 | 2;
}>();
</script>
