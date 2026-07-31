<template>
  <NuxtImg
    v-slot="{ src: resolvedSrc, isLoaded, imgAttrs }"
    :src="props.src"
    :preset="props.preset"
    :width="props.width"
    :height="props.height"
    :sizes="props.sizes"
    custom
  >
    <div class="relative overflow-hidden" :class="props.rootClass">
      <div
        v-show="!isLoaded"
        class="absolute inset-0 flex items-center justify-center bg-primary-600 animate-pulse"
        aria-hidden="true"
      >
        <Icon
          name="mdi:image-outline"
          class="text-secondary-500 text-5xl md:text-7xl opacity-60"
        />
      </div>

      <img
        v-bind="imgAttrs"
        :src="resolvedSrc"
        :alt="props.alt"
        :loading="props.loading"
        :class="[
          props.imgClass,
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
        ]"
      />
    </div>
  </NuxtImg>
</template>

<script setup lang="ts">
import type { AppImageProps } from "~/types/components";

/**
 * Optimized image with a pulsing placeholder (large image icon) while loading.
 * Wraps NuxtImg `custom` slot so layout classes stay on one root element.
 */
const props = withDefaults(defineProps<AppImageProps>(), {
  alt: "",
  rootClass: "",
  imgClass: "h-full w-full object-cover",
  loading: "lazy",
});
</script>
