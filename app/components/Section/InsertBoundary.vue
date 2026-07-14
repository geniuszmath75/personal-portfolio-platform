<template>
  <div ref="sentinelRef" class="group relative z-20 h-0">
    <div
      class="absolute inset-x-0 top-1/2 hidden h-10 -translate-y-1/2 items-center justify-center md:flex"
    >
      <NuxtLink
        :to="createUrl"
        :class="desktopLinkClasses"
        :aria-label="ariaLabel"
      >
        <Icon name="mdi:plus" class="text-3xl" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  buildSectionInsertCreateUrl,
  getSectionInsertAriaLabel,
} from "~/utils/buildSectionInsertCreateUrl";
import { useSectionInsertBoundaries } from "~/composables/useSectionInsertBoundaries";

const props = defineProps<{
  insertAfter: number;
}>();

/**
 * Anchor at the seam between sections; its screen position drives mobile insert targeting.
 */
const sentinelRef = ref<HTMLElement | null>(null);
const { registerBoundary, unregisterBoundary } = useSectionInsertBoundaries();

const createUrl = computed(() =>
  buildSectionInsertCreateUrl(props.insertAfter),
);

const ariaLabel = computed(() => getSectionInsertAriaLabel(props.insertAfter));

const desktopLinkClasses =
  "pointer-events-none flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500 text-additional-500 opacity-0 shadow-primary transition-all duration-200 ease-out scale-90 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:scale-100 hover:bg-secondary-400";

onMounted(() => {
  if (sentinelRef.value) {
    registerBoundary(props.insertAfter, sentinelRef.value);
  }
});

onBeforeUnmount(() => {
  unregisterBoundary(props.insertAfter);
});
</script>
