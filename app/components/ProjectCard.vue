<template>
  <div
    class="flex flex-col shadow-secondaryOne rounded-2xl h-[37rem] hover:md:scale-105 hover:md:text-[105%] md:transition md:duration-200"
  >
    <!-- Project main image -->
    <div class="flex-shrink-0 h-1/2 w-full">
      <img
        :src="project.mainImage.srcPath"
        :alt="project.mainImage.altText"
        class="w-full h-full object-cover rounded-tl-2xl rounded-tr-2xl"
      />
    </div>

    <!-- Card content -->
    <div class="flex flex-col flex-grow justify-between p-4">
      <!-- Project title -->
      <h3 class="text-secondary-500 text-lg md:text-xl font-bold text-center">
        {{ project.title }}
      </h3>

      <!-- Technologies -->
      <div class="flex flex-wrap justify-center gap-2 mt-3">
        <div
          v-for="(technology, i) in project.technologies"
          :key="'technology-' + i"
          class="px-3 py-1 rounded-2xl border border-dashed border-secondary-500 text-secondary-500 text-xs md:text-sm"
        >
          <span class="text-secondary-500">{{ technology }}</span>
        </div>
      </div>

      <!-- Short description -->
      <p
        class="text-secondary-500 text-sm md:text-base text-center mt-4 md:flex-grow"
      >
        {{ project.shortDescription }}
      </p>

      <!-- Button -->
      <div class="mt-6">
        <button
          class="w-full py-2 rounded-2xl bg-additional-500 text-sm md:text-base text-primary-500 font-semibold hover:bg-additional-600 transition"
          @click="moveToProjectPage(project._id)"
        >
          Check details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BasicProjectInformation } from "~~/shared/types";

const router = useRouter();

const { project } = defineProps<{
  project: BasicProjectInformation;
}>();

const moveToProjectPage = (resourceId: string): void => {
  router.push(`/projects/${resourceId}`);
};
</script>
