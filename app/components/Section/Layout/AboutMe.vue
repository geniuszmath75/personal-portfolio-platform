<template>
  <section
    class="flex items-center py-20 md:min-h-screen w-full bg-primary-500"
  >
    <div
      class="container mx-auto flex flex-col items-center justify-center px-8 text-center"
    >
      <div class="my-12">
        <h2 class="text-2xl text-secondary-500 font-bold md:text-4xl">
          {{ section.title }}
        </h2>
      </div>

      <div
        class="max-w-3xl lg:max-w-6xl flex flex-col lg:flex-row shadow-secondaryOne"
      >
        <div
          class="flex flex-col w-full lg:w-2/3 p-6 space-y-6 order-2 lg:order-1"
        >
          <div
            v-if="tagsBlock"
            class="flex gap-4 flex-wrap items-center justify-center"
          >
            <BaseTag v-for="(tag, i) in tagsBlock.items" :key="'tag-' + i">
              <template #icon>
                <Icon :name="tag.icon" class="text-2xl" />
              </template>
              {{ tag.label }}
            </BaseTag>
          </div>

          <div v-if="paragraphsBlock" class="flex flex-col gap-4">
            <h3 class="text-secondary-500 text-lg md:text-xl font-bold">
              {{ paragraphsBlock.paragraphs[0] }}
            </h3>
            <p
              v-for="(paragraph, i) in bodyParagraphs"
              :key="'paragraph-' + i"
              class="text-secondary-500 text-left md:text-justify text-sm md:text-base"
            >
              {{ paragraph }}
            </p>
          </div>
        </div>

        <div
          v-if="imagesBlock"
          class="flex justify-center lg:justify-end w-full lg:w-1/3 order-1 lg:order-2 mt-4 lg:mt-0"
        >
          <div
            class="w-64 h-64 rounded-full overflow-hidden border-4 border-secondary-500 lg:w-full lg:h-auto lg:rounded-none lg:border-none"
          >
            <img
              :src="
                resolveSectionImageSrc(imagesBlock.images[0]?.srcPath ?? '')
              "
              :alt="imagesBlock.images[0]?.altText"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { BlockKind } from "~~/shared/types/enums";
import { resolveSectionImageSrc } from "~/utils/resolveSectionImageSrc";

const { section } = defineProps<{
  section: ValidatedSection;
}>();

const tagsBlock = computed(() =>
  section.blocks.find((block) => block.kind === BlockKind.GROUP),
);

const paragraphsBlock = computed(() =>
  section.blocks.find((block) => block.kind === BlockKind.PARAGRAPH),
);

const bodyParagraphs = computed(
  () => paragraphsBlock.value?.paragraphs.filter((_, index) => index > 0) ?? [],
);

const imagesBlock = computed(() =>
  section.blocks.find((block) => block.kind === BlockKind.IMAGE),
);
</script>
