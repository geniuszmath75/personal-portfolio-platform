<template>
  <div class="flex flex-col">
    <SectionContent
      v-for="section in orderedSections"
      :key="section._id"
      :section="section"
    />
  </div>
</template>

<script setup lang="ts">
const sectionStore = useSectionsStore();
const { orderedSections } = storeToRefs(sectionStore);

await callOnce("sections", () => sectionStore.fetchSections());
</script>
