<template>
  <div
    class="relative flex items-center gap-4"
    :class="[getTimelineItemPlacementClasses]"
  >
    <!--Dot / Icon -->
    <div
      class="relative flex items-center justify-center rounded-full border-2 shadow-secondaryTwo after:absolute"
      :class="[getDotTypeClasses, getLineConnectorClasses, getDotSizeClasses]"
    >
      <slot name="icon" />
    </div>

    <!-- Content -->
    <div class="flex flex-col max-w-36" :class="[getContentAlignmentClasses]">
      <h4 v-if="title" class="font-semibold text-secondary-500">
        {{ title }}
      </h4>
      <time v-if="time" class="text-sm text-secondary-700">
        {{ time }}
      </time>
      <p v-if="content" class="text-sm text-secondary-500">
        {{ content }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  BaseTimelineItemProps,
  BaseTimelineProps,
} from "~/types/components";

const props = withDefaults(defineProps<BaseTimelineItemProps>(), {
  content: undefined,
  time: undefined,
  title: undefined,
  type: "default",
  isLast: false,
});

/**
 * Inject timeline configuration from parent component
 */
const timelineConfig = inject<BaseTimelineProps>("BaseTimelineConfig", {
  horizontal: false,
  itemPlacement: "left",
  size: "medium",
});

const {
  getDotTypeClasses,
  getDotSizeClasses,
  getContentAlignmentClasses,
  getLineConnectorClasses,
  getTimelineItemPlacementClasses,
} = useTimelineItem(props, timelineConfig);
</script>
