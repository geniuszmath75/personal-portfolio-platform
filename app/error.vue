<template>
  <div
    class="error-page flex min-h-screen flex-col font-default bg-primary-500 text-secondary-500"
  >
    <header class="fixed inset-x-0 top-0 h-16 md:h-20">
      <div class="flex h-full items-center px-5 md:px-6">
        <button
          type="button"
          class="text-sm font-semibold md:text-base hover:text-secondary-300 transition-colors"
          @click="goHome"
        >
          HOME
        </button>
      </div>
    </header>

    <main
      class="m-auto flex w-full max-w-lg flex-col items-center px-6 py-24 text-center"
    >
      <h1
        class="error-code mb-3 font-accentTwo text-6xl font-bold tracking-tight text-additional-500 md:text-9xl"
      >
        {{ statusCode }}
      </h1>

      <h2 class="mb-3 text-2xl font-bold md:text-3xl">
        {{ title }}
      </h2>

      <p class="mb-10 max-w-md text-sm text-secondary-600 md:text-base">
        {{ description }}
      </p>

      <div
        class="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
      >
        <BaseBtn
          type="button"
          label="Go home"
          btn-style="additional"
          btn-size="default"
          class="sm:w-40"
          @click="goHome"
        />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(
  () => props.error?.status ?? props.error?.status ?? 500,
);

const title = computed(() => {
  switch (statusCode.value) {
    case 401:
      return "Sign in required";
    case 403:
      return "Access denied";
    case 404:
      return "Page not found";
    default:
      return "Something went wrong";
  }
});

const description = computed(() => {
  switch (statusCode.value) {
    case 401:
      return "You need to log in to continue.";
    case 403:
      return "You do not have permission to view this page.";
    case 404:
      return "The page you are looking for does not exist.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
});

const headEntry = useHead({
  title: () => `${statusCode.value} Page`,
});

const goHome = async () => {
  // Drop error title before leaving — otherwise Unhead keeps "404 Page"
  headEntry.dispose();
  await clearError({ redirect: "/" });
};
</script>

<style scoped>
.error-brand {
  animation: error-fade-up 0.45s ease-out both;
}

.error-code {
  animation: error-fade-up 0.45s ease-out 0.08s both;
}

h1,
p:not(.error-brand):not(.error-code),
div.flex {
  animation: error-fade-up 0.45s ease-out 0.16s both;
}

@keyframes error-fade-up {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
