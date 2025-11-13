<template>
  <section
    :class="[
      'flex items-center py-20 md:min-h-screen w-full',
      section.order % 2 === 0 ? 'bg-secondary-500' : 'bg-primary-500',
    ]"
  >
    <!-- HERO SECTION -->
    <div
      v-if="section.type === 'HERO'"
      class="container mx-auto flex flex-col md:flex-row items-center justify-center px-6 py-12 text-center space-y-6"
    >
      <!-- Left column: text + buttons -->
      <div class="flex-1 flex flex-col items-center justify-center space-y-6">
        <!-- Paragraphs -->
        <div class="flex flex-col items-center space-y-4 mt-4 md:mt-0">
          <template
            v-for="(block, i) in section?.blocks.filter(
              (b) => b.kind === 'PARAGRAPH',
            )"
            :key="'p-' + i"
          >
            <h1
              class="text-4xl md:text-5xl lg:text-6xl text-center font-bold text-secondary-500 font-default"
            >
              {{ block.paragraphs[0] }}
            </h1>
            <p
              v-for="(text, j) in block.paragraphs.filter((_, i) => i > 0)"
              :key="'p-' + i + '-' + j"
              class="text-secondary-500 text-xl"
            >
              {{ text }}
            </p>
          </template>
        </div>

        <!-- Buttons -->
        <div class="flex flex-wrap justify-center gap-4">
          <template
            v-for="(block, i) in section?.blocks.filter(
              (b) => b.kind === 'BUTTON',
            )"
            :key="'btn-' + i"
          >
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

      <!-- Right column: image -->
      <div class="flex-1 flex justify-center">
        <template
          v-for="(block, i) in section?.blocks.filter(
            (b) => b.kind === 'IMAGE',
          )"
          :key="'img-' + i"
        >
          <img
            v-for="(img, j) in block.images"
            :key="'img-' + i + '-' + j"
            :src="'/images/' + img.srcPath"
            :alt="img.altText"
            class="max-w-[70%] md:max-w-80 lg:max-w-lg rounded-2xl shadow-lg shadow-primary-400"
          />
        </template>
      </div>
    </div>

    <!-- SKILLS SECTION -->
    <div
      v-else-if="section.type === 'SKILLS'"
      class="container mx-auto flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <!-- Section title -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold md:text-4xl">
          {{ section.title }}
        </h2>
      </div>

      <!-- Paragraphs -->
      <div class="mb-8">
        <template
          v-for="(block, i) in section.blocks.filter(
            (b) => b.kind === 'PARAGRAPH',
          )"
          :key="'p-' + i"
        >
          <p
            v-for="(text, j) in block.paragraphs"
            :key="'p-' + i + '-' + j"
            class="text-primary-500 text-lg md:text-xl"
          >
            {{ text }}
          </p>
        </template>
      </div>

      <!-- Skill groups grid -->
      <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        <div
          v-for="(block, i) in section.blocks.filter((b) => b.kind === 'GROUP')"
          :key="'group-' + i"
          class="rounded-2xl shadow-primary bg-secondary-500 p-4 flex flex-col items-center"
        >
          <!-- Card header -->
          <div class="min-w-56 text-center bg-primary-500 px-6 rounded-lg mb-4">
            <h3 class="text-lg md:text-xl font-bold text-secondary-500">
              {{ block.header }}
            </h3>
          </div>

          <!-- Items (icons + labels) -->
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

    <!-- CONTACT SECTION -->
    <div
      v-else-if="section.type === 'CONTACT'"
      class="container mx-auto flex flex-col justify-center items-center px-6 py-12 text-center"
    >
      <!-- Section title -->
      <div class="mb-8">
        <h2
          class="text-2xl font-default text-secondary-500 font-bold md:text-4xl"
        >
          {{ section.title }}
        </h2>
      </div>

      <!-- Paragraphs -->
      <div class="mb-8 space-y-4">
        <template
          v-for="(block, i) in section.blocks.filter(
            (b) => b.kind === 'PARAGRAPH',
          )"
          :key="'p-' + i"
        >
          <p
            v-for="(text, j) in block.paragraphs"
            :key="'p-' + i + '-' + j"
            class="text-secondary-500 text-lg md:text-xl"
          >
            {{ text }}
          </p>
        </template>
      </div>

      <!-- Contact details groups -->
      <div class="flex flex-col items-center mt-12 space-y-8">
        <template
          v-for="(block, i) in section.blocks.filter((b) => b.kind === 'GROUP')"
          :key="'group-' + i"
        >
          <!-- Email + phone -->
          <div class="flex flex-col items-start justify-center">
            <div
              v-for="(item, j) in block.items.filter(
                (i) => !i.label.startsWith('http'),
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

          <!-- Social links -->
          <div class="flex items-center justify-center">
            <NuxtLink
              v-for="(item, j) in block.items.filter((i) =>
                i.label.startsWith('https'),
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

    <!-- Not implemented sections -->
    <div v-else class="container h-10 mx-auto px-6 py-12 text-center">
      <p class="text-primary-500">New section soon: {{ section.type }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ValidatedSection } from "~~/app/utils/validateSection";
import { checkItemColSpan } from "~/utils/checkItemColSpan";

const { section } = defineProps<{
  section: ValidatedSection;
}>();
</script>
