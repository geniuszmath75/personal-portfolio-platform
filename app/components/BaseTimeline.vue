<template>
  <div
    class="relative flex"
    :class="[getTimelineDirectionClasses, getTimelineSizeClasses]"
  >
    <slot />
  </div>
</template>
<script setup lang="ts">
import type { BaseTimelineProps } from "~/types/components";

const props = withDefaults(defineProps<BaseTimelineProps>(), {
  horizontal: false,
  itemPlacement: "left",
  size: "medium",
});

const { getTimelineSizeClasses, getTimelineDirectionClasses } =
  useTimeline(props);

/**
 * Provide timeline configuration to child components
 */
provide("BaseTimelineConfig", {
  horizontal: props.horizontal,
  itemPlacement: props.itemPlacement,
  size: props.size,
});
</script>
