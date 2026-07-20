<template>
  <div class="relative flex flex-col">
    <ClientOnly>
      <div
        v-if="isAdmin && sectionDetails"
        class="absolute right-4 bottom-4 z-20"
      >
        <SectionEditControl
          class="hidden md:block"
          :slug="sectionDetails.slug"
        />
        <SectionEditMobileControl
          class="fixed right-4 bottom-4 md:hidden"
          :slug="sectionDetails.slug"
        />
      </div>
    </ClientOnly>

    <SectionLayoutAboutMe v-if="sectionDetails" :section="sectionDetails" />
    <LoadingAnimation v-else label="Loading..." />
  </div>
</template>

<script setup lang="ts">
const sectionsStore = useSectionsStore();
const authStore = useAuthStore();
const { sectionDetails } = storeToRefs(sectionsStore);
const { isAdmin } = storeToRefs(authStore);

const slug = useRouteParam("slug");

await callOnce("section", () => sectionsStore.fetchSection(slug), {
  mode: "navigation",
});
</script>
