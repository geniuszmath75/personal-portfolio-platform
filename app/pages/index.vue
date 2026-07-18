<template>
  <div class="flex flex-col">
    <ClientOnly>
      <Teleport to="body">
        <div
          v-if="isAdmin && orderedSections.length === 0"
          class="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center md:hidden"
        >
          <NuxtLink
            :to="buildSectionInsertCreateUrl()"
            :class="emptyPageLinkClasses"
            :aria-label="getSectionInsertAriaLabel()"
          >
            <Icon name="mdi:plus" class="text-3xl" />
          </NuxtLink>
        </div>
      </Teleport>

      <SectionInsertMobileControls
        v-if="isAdmin && orderedSections.length > 0"
        :top-insert-after="activeTopInsertAfter"
        :bottom-insert-after="activeBottomInsertAfter"
      />
    </ClientOnly>

    <template v-for="section in orderedSections" :key="section._id">
      <div class="relative">
        <ClientOnly>
          <div
            v-if="isAdmin"
            class="absolute right-4 bottom-4 z-20 md:right-8 md:bottom-8"
          >
            <SectionEditControl :slug="section.slug" />
          </div>
        </ClientOnly>
        <SectionContent :section="section" />
      </div>
      <ClientOnly>
        <SectionInsertBoundary v-if="isAdmin" :insert-after="section.order" />
      </ClientOnly>
    </template>
  </div>
</template>

<script setup lang="ts">
import { provideSectionInsertBoundaries } from "~/composables/useSectionInsertBoundaries";
import {
  buildSectionInsertCreateUrl,
  getSectionInsertAriaLabel,
} from "~/utils/buildSectionInsertCreateUrl";

const sectionStore = useSectionsStore();
const authStore = useAuthStore();
const { orderedSections } = storeToRefs(sectionStore);
const { isAdmin } = storeToRefs(authStore);

const { activeTopInsertAfter, activeBottomInsertAfter } =
  provideSectionInsertBoundaries();

const emptyPageLinkClasses =
  "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500 text-additional-500 shadow-primary transition-all duration-200 ease-out hover:bg-secondary-400";

await callOnce("sections", () => sectionStore.fetchSections());
</script>
