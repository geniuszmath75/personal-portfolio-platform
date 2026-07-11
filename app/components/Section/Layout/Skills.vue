<template>
  <div
    class="container mx-auto flex flex-col items-center justify-center px-6 py-12 text-center"
  >
    <div class="mb-8">
      <h2
        class="text-2xl font-bold md:text-4xl"
        :class="getSectionTextColorClass(section.order)"
      >
        {{ section.title }}
      </h2>
    </div>

    <div class="mb-8">
      <template v-for="(block, i) in paragraphBlocks" :key="'p-' + i">
        <p
          v-for="(text, j) in block.paragraphs"
          :key="'p-' + i + '-' + j"
          class="text-lg md:text-xl"
          :class="getSectionTextColorClass(section.order)"
        >
          {{ text }}
        </p>
      </template>
    </div>

    <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
      <div
        v-for="(block, i) in groupBlocks"
        :key="'group-' + i"
        class="rounded-2xl shadow-primary bg-secondary-500 p-4 flex flex-col items-center"
      >
        <div class="min-w-56 text-center bg-primary-500 px-6 rounded-lg mb-4">
          <h3 class="text-lg md:text-xl font-bold text-secondary-500">
            {{ block.header }}
          </h3>
        </div>

        <div class="grid grid-cols-12 w-full gap-4">
          <div
            v-for="(item, j) in block.items"
            :key="'item-' + i + '-' + j"
            :class="[
              'flex flex-col items-center justify-center space-y-1 md:px-10 md:py-3 md:',
              checkItemColSpan(j, block.items.length),
            ]"
          >
            <Icon
              :name="item.icon"
              class="text-additional-500 lg:text-5xl md:text-4xl text-3xl"
            />
            <span class="text-primary-500 font-medium">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { BlockKind } from "~~/shared/types/enums";
import { checkItemColSpan } from "~/utils/checkItemColSpan";

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
