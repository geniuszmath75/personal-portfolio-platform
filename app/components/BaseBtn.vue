<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="[
      'relative flex justify-center items-center transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ',
      btnStyleClasses,
      btnSizeClasses,
    ]"
  >
    <Icon
      v-show="isDisabled"
      name="mdi:loading"
      class="absolute left-2 text-secondary-500 animate-spin text-2xl"
    />
    <slot name="icon" />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import type { BaseBtnProps } from "~/types/components";

const props = withDefaults(defineProps<BaseBtnProps>(), {
  type: "submit",
  isDisabled: false,
  btnStyle: "additional",
  btnSize: "default",
  iconName: null,
});

/**
 * Computed classes for button styles based on btnStyle prop
 */
const btnStyleClasses = computed(() => {
  switch (props.btnStyle) {
    case "secondary":
      return "bg-secondary-500 text-primary-500 rounded-3xl hover:bg-secondary-600 focus:ring-secondary-500 focus:ring-offset-primary-500 disabled:hover:bg-secondary-500 focus:ring-2 focus:ring-offset-2 shadow-primary";
    case "tab--active":
      return "text-additional-500 border-additional-500";
    case "tab--inactive":
      return "text-secondary-500 border-secondary-500";
    case "login--logout":
      return "bg-additional-500 text-primary-500 rounded-3xl hover:bg-additional-600 focus:ring-additional-500 focus:ring-offset-primary-500 focus:ring-2 focus:ring-offset-2 shadow-primary";
    case "mobile--login--logout":
      return "bg-additional-500 text-primary-500 hover:bg-additional-600 focus:ring-additional-500 focus:ring-offset-primary-500 focus:ring-2 focus:ring-offset-2";
    case "mobile--secondary":
      return "bg-secondary-500 text-primary-500 hover:bg-secondary-600 focus:ring-secondary-500 focus:ring-offset-primary-500 disabled:hover:bg-secondary-500 focus:ring-2 focus:ring-offset-2";
    default:
      return "bg-additional-500 text-primary-500 rounded-lg hover:bg-additional-600 focus:ring-additional-500 focus:ring-offset-primary-500 disabled:hover:bg-additional-500 focus:ring-2 focus:ring-offset-2";
  }
});

/**
 * Computed classes for button sizes based on btnSize prop
 */
const btnSizeClasses = computed(() => {
  switch (props.btnSize) {
    case "tab":
      return "flex-1 pb-3 text-md font-medium border-b-2";
    case "large":
      return "w-48 h-12 font-semibold";
    case "mobile--menu":
      return "w-full h-16 font-semibold text-lg";
    default:
      return "w-full py-3 px-4 font-bold text-md";
  }
});
</script>
