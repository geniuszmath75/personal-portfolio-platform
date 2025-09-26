<template>
  <div
    v-show="loading"
    class="fixed flex justify-center inset-0 bg-primary-500 z-[9999]"
  >
    <LoadingAnimation :label="label" />
  </div>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loadingStore = useLoadingStore();
const { loading, label } = storeToRefs(loadingStore);

// Global middleware: start loading spinner before each route
addRouteMiddleware(
  "global-loader",
  (from, to) => {
    // run only if there are no query params and new path is different from the current one
    if (!Object.keys(to.query).length && from.path !== to.path) {
      loadingStore.startLoading();
    }
  },
  { global: true },
);

// Nuxt hook: stop loading spinner after page is rendered
nuxtApp.hook("page:finish", () => {
  loadingStore.finishLoading();
});
</script>
