<template>
  <div class="flex flex-col">
    <section
      v-if="sectionDetails"
      class="flex items-center py-20 md:min-h-screen w-full bg-primary-500"
    >
      <div
        class="container mx-auto flex flex-col items-center justify-center px-8 text-center"
      >
        <!-- About Me title -->
        <div class="my-12">
          <h2 class="text-2xl text-secondary-500 font-bold md:text-4xl">
            {{ sectionDetails?.title }}
          </h2>
        </div>

        <!-- About Me Section -->
        <div
          class="max-w-3xl lg:max-w-6xl flex flex-col lg:flex-row shadow-secondaryOne"
        >
          <!-- Left side: tags and paragraphs -->
          <div
            class="flex flex-col w-full lg:w-2/3 p-6 space-y-6 order-2 lg:order-1"
          >
            <!-- Tags -->
            <div
              v-if="tagsBlock"
              class="flex gap-4 flex-wrap items-center justify-center"
            >
              <BaseTag v-for="(tag, i) in tagsBlock?.items" :key="'tag-' + i">
                <template #icon>
                  <Icon :name="tag.icon" class="text-2xl" />
                </template>
                {{ tag.label }}
              </BaseTag>
            </div>

            <div v-if="paragraphsBlock" class="flex flex-col gap-4">
              <!-- Paragraphs -->
              <h3 class="text-secondary-500 text-lg md:text-xl font-bold">
                {{ paragraphsBlock.paragraphs[0] }}
              </h3>
              <p
                v-for="(paragraph, i) in paragraphs"
                :key="'paragraph-' + i"
                class="text-secondary-500 text-left md:text-justify text-sm md:text-base"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>

          <!-- Right side: image -->
          <div
            v-if="imagesBlock"
            class="flex justify-center lg:justify-end w-full lg:w-1/3 order-1 lg:order-2 mt-4 lg:mt-0"
          >
            <div
              class="w-64 h-64 rounded-full overflow-hidden border-4 border-secondary-500 lg:w-full lg:h-auto lg:rounded-none lg:border-none"
            >
              <img
                :src="'/images/' + imagesBlock.images[0]?.srcPath"
                :alt="imagesBlock?.images[0]?.altText"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <LoadingAnimation v-else label="Loading..." />
  </div>
</template>
<script setup lang="ts">
const sectionsStore = useSectionsStore();
const { sectionDetails } = storeToRefs(sectionsStore);

/**
 * Return block with tags
 */
const tagsBlock = computed(() =>
  sectionsStore.getBlockElementsByKind(BlockKind.GROUP),
);

/**
 * Return block with paragraphs
 */
const paragraphsBlock = computed(() =>
  sectionsStore.getBlockElementsByKind(BlockKind.PARAGRAPH),
);

/**
 * Return all paragraphs except the first one (which is used as a subtitle)
 */
const paragraphs = computed(() =>
  paragraphsBlock.value?.paragraphs.filter((_, index) => index > 0),
);

/**
 * Return block with images
 */
const imagesBlock = computed(() =>
  sectionsStore.getBlockElementsByKind(BlockKind.IMAGE),
);

/**
 * Get slug identifiying the ABOUT ME section
 */
const slug = useRouteParam("slug");

await callOnce("section", () => sectionsStore.fetchSection(slug));
</script>
