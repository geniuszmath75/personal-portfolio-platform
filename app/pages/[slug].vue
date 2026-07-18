<template>
  <div class="relative flex flex-col">
    <ClientOnly>
      <div
        v-if="isAdmin && sectionDetails"
        class="absolute right-4 top-4 z-20 md:right-8 md:top-8"
      >
        <SectionEditControl :slug="sectionDetails.slug" />
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
