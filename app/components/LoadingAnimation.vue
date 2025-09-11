<template>
  <div
    v-show="loading"
    class="fixed flex justify-center inset-0 bg-primary-500 z-[9999]"
  >
    <div class="flex flex-col justify-center items-center animate-pulse">
      <Icon
        name="mdi:loading"
        class="animate-spin text-additional-500 text-6xl"
      />
      <span class="text-secondary-500 text-3xl">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loadingStore = useLoadingStore();
const { loading, label } = storeToRefs(loadingStore);

// Global middleware: start loading spinner before each route
addRouteMiddleware(
  "global-loader",
  () => {
    loadingStore.startLoading();
  },
  { global: true },
);

// Nuxt hook: stop loading spinner after page is rendered
nuxtApp.hook("page:finish", () => {
  loadingStore.finishLoading();
});
</script>
