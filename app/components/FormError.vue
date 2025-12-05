<template>
  <div class="relative">
    <slot />

    <div v-for="error in errors" :key="error.$uid" class="flex py-2 gap-2">
      <!-- Error icon -->
      <Icon
        name="material-symbols:error-outline"
        class="text-2xl text-additional-500 font-semibold"
      />

      <!-- Input error message -->
      <div class="text-secondary-500 font-semibold">{{ error.$message }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ErrorObject } from "@vuelidate/core";

defineProps<{
  errors: ErrorObject[];
}>();
</script>
