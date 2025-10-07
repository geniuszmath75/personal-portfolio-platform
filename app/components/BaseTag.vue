<template>
  <div
    class="flex items-center justify-center gap-2"
    :class="[getTypeClasses, getSizeClasses, getBorderClasses, getRoundedClass]"
  >
    <slot name="icon" />
    <span>
      <slot />
    </span>
  </div>
</template>
<script setup lang="ts">
import type { BaseTagProps } from "~/types/components";

const props = withDefaults(defineProps<BaseTagProps>(), {
  bordered: true,
  rounded: true,
  size: "medium",
  type: "default",
  dashed: false,
});

const { getBorderClasses, getRoundedClass, getSizeClasses, getTypeClasses } =
  useTag(props);
</script>
