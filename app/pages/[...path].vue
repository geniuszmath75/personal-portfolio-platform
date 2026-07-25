<script setup lang="ts">
/**
 * Catch-all for unmatched paths
 *
 * Must NOT share the route param name `slug` with pages/[slug].vue —
 * that collides route names (NUXT_B4004) and steals single-segment URLs.
 */
definePageMeta({
  name: "catch-all-404",
});

throw createError({
  statusCode: 404,
  statusMessage: "Not Found",
  message: "Page not found",
  fatal: true,
});
</script>

<template>
  <div />
</template>
