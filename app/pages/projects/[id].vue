<template>
  <div class="bg-primary-500 min-h-screen py-20 px-16">
    <!-- Project title -->
    <h2
      class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
    >
      {{ projectDetails?.title }}
    </h2>

    <!-- Image carousel -->
    <BaseCarousel
      :show-arrow="isArrowVisible"
      :total-elements="imageList.length"
    >
      <!-- Project images -->
      <img
        v-for="(image, i) in imageList"
        :key="'img-' + i"
        class="w-full h-96 shrink-0 object-cover"
        :src="image.srcPath"
        :alt="image.altText"
      />
    </BaseCarousel>

    <!-- Project info panel grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 items-stretch gap-8 mt-12">
      <ProjectPanel>
        <div
          class="flex justify-center flex-wrap lg:flex-nowrap h-full w-full gap-6"
        >
          <!-- Project timeline -->
          <BaseTimeline horizontal>
            <BaseTimelineItem
              title="START"
              type="info"
              :time="formattedStartDate"
            >
              <template #icon>
                <Icon
                  name="material-symbols:start"
                  class="text-primary-500 text-xl"
                />
              </template>
            </BaseTimelineItem>
            <BaseTimelineItem
              title="END"
              type="success"
              :time="isEndDateExists ? formattedEndDate : null"
              :content="!isEndDateExists ? 'Unknown' : undefined"
              is-last
            >
              <template #icon>
                <Icon
                  name="material-symbols:sports-score"
                  class="text-primary-500 text-xl"
                />
              </template>
            </BaseTimelineItem>
          </BaseTimeline>

          <!-- Project status / source tags -->
          <div class="flex items-center justify-center flex-wrap gap-2">
            <BaseTag :type="getProjectStatusProperties.type">
              <template #icon>
                <Icon
                  :name="getProjectStatusProperties.icon"
                  class="text-2xl text-primary-500"
                />
              </template>
              {{ getProjectStatusProperties.status }}
            </BaseTag>
            <BaseTag>
              <template #icon>
                <Icon
                  :name="getProjectSourceProperties.icon"
                  class="text-2xl text-primary-500"
                />
              </template>
              {{ getProjectSourceProperties.source }}
            </BaseTag>
          </div>
        </div>
      </ProjectPanel>

      <!-- Technologies panel -->
      <ProjectPanel heading="TECHNOLOGIES">
        <div
          class="flex justify-center md:justify-start items-center flex-wrap w-full gap-6"
        >
          <BaseTag
            v-for="technology in projectDetails?.technologies"
            :key="'tag-' + technology"
            type="primary"
            dashed
          >
            {{ technology }}
          </BaseTag>
        </div>
      </ProjectPanel>

      <!-- External links panel -->
      <ProjectPanel heading="LINKS">
        <div
          v-if="!isLinkListEmpty"
          class="flex h-full justify-center flex-wrap items-center gap-4"
        >
          <NuxtLink
            v-for="(linkProperties, i) in linkPropertiesList"
            :key="'link' + i"
            :to="linkProperties.url"
            target="_blank"
            class="flex justify-center items-center p-2 bg-secondary-500 rounded-xl gap-3 hover:shadow-secondaryTwo hover:bg-secondary-400"
          >
            <Icon
              :name="linkProperties.icon"
              class="text-primary-500 text-2xl"
            />
            <span class="text-primary-500">{{ linkProperties.label }}</span>
          </NuxtLink>
        </div>
        <NoResults v-else message="No links available" />
      </ProjectPanel>

      <!-- Gained experience panel -->
      <ProjectPanel heading="GAINED EXPERIENCE">
        <div class="ml-4">
          <ul class="list-disc">
            <li class="text-secondary-500 text-sm md:text-base">
              First experience
            </li>
            <li class="text-secondary-500 text-sm md:text-base">
              Second experience
            </li>
            <li class="text-secondary-500 text-sm md:text-base">
              Third experience
            </li>
          </ul>
        </div>
      </ProjectPanel>

      <!-- Project description panel -->
      <ProjectPanel heading="PROJECT DESCRIPTION" full-width type="secondary">
        <p class="text-sm md:text-base text-justify">
          {{ projectDetails?.longDescription }}
        </p>
      </ProjectPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
const projectStore = useProjectsStore();
const {
  projectDetails,
  imageList,
  formattedStartDate,
  formattedEndDate,
  getProjectStatusProperties,
  getProjectSourceProperties,
  linkPropertiesList,
} = storeToRefs(projectStore);

/**
 * Determines if carousel arrows should be shown (only when more than one image
 * exists)
 */
const isArrowVisible = computed(() => imageList.value.length > 1);

/**
 * Checks whether the project has a defined end date
 */
const isEndDateExists = computed(() => formattedEndDate.value !== null);

/**
 * Returns true if no valid links are available for this project
 */
const isLinkListEmpty = computed(() => linkPropertiesList.value.length === 0);

const projectId = useRouteParam("id");

await callOnce("project", () => projectStore.fetchProject(projectId), {
  mode: "navigation",
});
</script>
