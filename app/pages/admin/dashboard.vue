<template>
  <div
    class="absolute inset-0 flex items-center justify-center bg-primary-500 text-center"
  >
    <h1 v-show="data?.message" class="text-2xl text-secondary-500">
      {{ `${data?.message}!` }}
    </h1>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["02-admin"],
});

const { data } = await useFetch<{ message: string }>(
  "/api/v1/admin/dashboard",
  {
    credentials: "include",
  },
);
</script>
