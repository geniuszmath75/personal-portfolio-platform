<template>
  <div class="flex justify-center inset-0 text-secondary-500">
    <h1 v-show="user.email" class="">Hello, {{ user.email }}!</h1>
    <h1 v-show="!user.email">Cannot read 'user' cookie!</h1>
    <div class="absolute left-4 top-4">
      <NuxtLink to="/"> HOME </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
const user = useCookie("user", { default: () => ({ email: "", role: "" }) });
</script>
