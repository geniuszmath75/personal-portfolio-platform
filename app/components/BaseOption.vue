<template>
  <option :value="value" :label="label">
    {{ label }}
  </option>
</template>
<script setup lang="ts">
import type { BaseOptionProps } from "~/types/components";

defineProps<BaseOptionProps>();
</script>
