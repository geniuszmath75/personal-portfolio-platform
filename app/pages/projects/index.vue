<template>
  <div class="bg-primary-500 py-20 px-8">
    <!-- Page title -->
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      Projects
    </h2>

    <!-- Projects grid -->
    <div class="grid gap-8 mx-auto sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
      <ProjectCard
        v-for="project in basicProjectInformation"
        :key="project._id"
        :project="project"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const projectStore = useProjectsStore();
const { basicProjectInformation } = storeToRefs(projectStore);

await callOnce("projects", () => projectStore.fetchProjects());
</script>
