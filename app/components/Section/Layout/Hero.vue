<template>
  <div
    class="container mx-auto flex flex-col md:flex-row items-center justify-center px-6 py-12 text-center space-y-6"
  >
    <div class="flex-1 flex flex-col items-center justify-center space-y-6">
      <div class="flex flex-col items-center space-y-4 mt-4 md:mt-0">
        <template v-for="(block, i) in paragraphBlocks" :key="'p-' + i">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl text-center font-bold text-secondary-500 font-default"
          >
            {{ block.paragraphs[0] }}
          </h1>
          <p
            v-for="(text, j) in block.paragraphs.filter(
              (_, index) => index > 0,
            )"
            :key="'p-' + i + '-' + j"
            class="text-secondary-500 text-xl"
          >
            {{ text }}
          </p>
        </template>
      </div>

      <div class="flex flex-wrap justify-center gap-4">
        <template v-for="(block, i) in buttonBlocks" :key="'btn-' + i">
          <NuxtLink
            v-for="(btn, j) in block.buttons"
            :key="'btn-' + i + '-' + j"
            :to="btn === 'PROJECTS' ? '/projects' : '/about-me'"
            :class="
              'px-5 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition duration-500 rounded-lg ' +
              (j === 0
                ? 'text-primary-500 bg-additional-500 hover:bg-additional-600'
                : 'text-additional-500 border-2 bg-transparent border-additional-500 hover:bg-additional-500 hover:text-primary-500')
            "
          >
            {{ btn }}
          </NuxtLink>
        </template>
      </div>
    </div>

    <div class="flex-1 flex justify-center">
      <template v-for="(block, i) in imageBlocks" :key="'img-' + i">
        <img
          v-for="(img, j) in block.images"
          :key="'img-' + i + '-' + j"
          :src="resolveSectionImageSrc(img.srcPath)"
          :alt="img.altText"
          class="max-w-[70%] md:max-w-80 lg:max-w-lg rounded-2xl shadow-lg shadow-primary-400"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { BlockKind } from "~~/shared/types/enums";
import { resolveSectionImageSrc } from "~/utils/resolveSectionImageSrc";

const { section } = defineProps<{
  section: ValidatedSection;
}>();

const paragraphBlocks = computed(() =>
  section.blocks.filter((block) => block.kind === BlockKind.PARAGRAPH),
);

const buttonBlocks = computed(() =>
  section.blocks.filter((block) => block.kind === BlockKind.BUTTON),
);

const imageBlocks = computed(() =>
  section.blocks.filter((block) => block.kind === BlockKind.IMAGE),
);
</script>
