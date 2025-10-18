<template>
  <div class="relative mx-auto max-w-[50rem] overflow-hidden">
    <!-- Default slot -->
    <div
      class="flex transition-transform duration-200 will-change-transform"
      :style="carouselTransformStyle"
    >
      <slot />
    </div>

    <!-- Arrow navigation -->
    <div v-if="showArrow" class="absolute flex gap-2 right-4 bottom-4 px-4">
      <slot
        name="arrow"
        :total="totalElements"
        :current-index="internalIndex"
        :go-to-element="goToElement"
        :prev-element="prevElement"
        :next-element="nextElement"
      >
        <button
          class="flex items-center bg-primary-500 text-secondary-500 p-2 rounded-xl hover:bg-primary-300"
          @click="prevElement"
        >
          <Icon name="mdi:arrow-left" class="text-secondary-500" />
        </button>
        <button
          class="flex items-center bg-primary-500 text-secondary-500 p-2 rounded-xl hover:bg-primary-400"
          @click="nextElement"
        >
          <Icon name="mdi:arrow-right" class="text-secondary-500" />
        </button>
      </slot>
    </div>

    <!-- Dots navigation -->
    <div v-if="showDots" :class="['absolute flex gap-2', dotPlacementClasses]">
      <slot
        name="dots"
        :total="totalElements"
        :current-index="internalIndex"
        :go-to-element="goToElement"
      >
        <button
          v-for="i in totalElements"
          :key="i"
          class="w-3 h-3 rounded-full hover:bg-secondary-500"
          :class="getDotClass(i - 1)"
          @click="goToElement(i - 1)"
        />
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { BaseCarouselProps } from "~/types/components";

const props = withDefaults(defineProps<BaseCarouselProps>(), {
  defaultIndex: 0,
  totalElements: 1,
  showArrow: false,
  showDots: true,
  autoplay: false,
  dotPlacement: "bottom",
});

const {
  internalIndex,
  dotPlacementClasses,
  carouselTransformStyle,
  getDotClass,
  goToElement,
  prevElement,
  nextElement,
  getCurrentIndex,
} = useCarousel(props);

/**
 * Expose public methods for parent components
 */
defineExpose({
  goToElement,
  prevElement,
  nextElement,
  getCurrentIndex,
});
</script>
