<template>
  <div class="flex flex-col">
    <SectionLayoutAboutMe v-if="sectionDetails" :section="sectionDetails" />
    <LoadingAnimation v-else label="Loading..." />
  </div>
</template>

<script setup lang="ts">
const sectionsStore = useSectionsStore();
const { sectionDetails } = storeToRefs(sectionsStore);

const slug = useRouteParam("slug");

await callOnce("section", () => sectionsStore.fetchSection(slug));
</script>
