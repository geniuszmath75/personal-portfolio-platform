<template>
  <div
    class="container mx-auto flex flex-col justify-center items-center px-6 py-12 text-center"
  >
    <div class="mb-8">
      <h2
        class="text-2xl font-default text-secondary-500 font-bold md:text-4xl"
      >
        {{ section.title }}
      </h2>
    </div>

    <div class="mb-8 space-y-4">
      <template v-for="(block, i) in paragraphBlocks" :key="'p-' + i">
        <p
          v-for="(text, j) in block.paragraphs"
          :key="'p-' + i + '-' + j"
          class="text-secondary-500 text-lg md:text-xl"
        >
          {{ text }}
        </p>
      </template>
    </div>

    <div class="flex flex-col items-center mt-12 space-y-8">
      <template v-for="(block, i) in groupBlocks" :key="'group-' + i">
        <div class="flex flex-col items-start justify-center">
          <div
            v-for="(item, j) in block.items.filter(
              (item) => !item.label.startsWith('http'),
            )"
            :key="'item-' + i + '-' + j"
            class="flex items-center gap-4"
          >
            <Icon
              :name="item.icon"
              class="text-additional-500 lg:text-4xl md:text-3xl text-2xl"
            />
            <span class="text-secondary-500 text-md md:text-lg">
              {{ item.label }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-center">
          <NuxtLink
            v-for="(item, j) in block.items.filter((item) =>
              item.label.startsWith('https'),
            )"
            :key="'item-' + i + '-' + j"
            :to="item.label"
            target="_blank"
          >
            <Icon
              :name="item.icon"
              class="text-secondary-500 hover:text-additional-500 transition-all duration-200 lg:text-4xl md:text-3xl text-2xl"
            />
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { BlockKind } from "~~/shared/types/enums";

const { section } = defineProps<{
  section: ValidatedSection;
}>();

const paragraphBlocks = computed(() =>
  section.blocks.filter((block) => block.kind === BlockKind.PARAGRAPH),
);

const groupBlocks = computed(() =>
  section.blocks.filter((block) => block.kind === BlockKind.GROUP),
);
</script>
