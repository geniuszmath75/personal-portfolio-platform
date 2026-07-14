<template>
  <Teleport to="body">
    <div
      v-if="topInsertAfter !== null"
      class="pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center md:hidden"
    >
      <NuxtLink
        :to="buildSectionInsertCreateUrl(topInsertAfter)"
        :class="linkClasses"
        :aria-label="getSectionInsertAriaLabel(topInsertAfter)"
      >
        <Icon name="mdi:plus" class="text-3xl" />
      </NuxtLink>
    </div>

    <div
      v-if="bottomInsertAfter !== null"
      class="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center md:hidden"
    >
      <NuxtLink
        :to="buildSectionInsertCreateUrl(bottomInsertAfter)"
        :class="linkClasses"
        :aria-label="getSectionInsertAriaLabel(bottomInsertAfter)"
      >
        <Icon name="mdi:plus" class="text-3xl" />
      </NuxtLink>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { SectionInsertMobileControlsProps } from "~/types/sectionForm";
import {
  buildSectionInsertCreateUrl,
  getSectionInsertAriaLabel,
} from "~/utils/buildSectionInsertCreateUrl";

defineProps<SectionInsertMobileControlsProps>();

const linkClasses =
  "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500 text-additional-500 shadow-primary transition-all duration-200 ease-out hover:bg-secondary-400";
</script>
