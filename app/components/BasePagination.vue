<template>
  <nav class="flex items-center justify-center gap-2 mt-10">
    <!-- Prev button -->
    <button
      class="flex items-center px-3 py-1 rounded-lg bg-secondary-500 text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:bg-secondary-500 hover:bg-secondary-600"
      :disabled="!pagination.prevPage"
      @click="goToPage(pagination.prevPage)"
    >
      <Icon name="mdi:arrow-left-thin" class="text-primary-500 text-2xl" />
    </button>

    <!-- Page buttons (with ellipsis when needed) -->
    <button
      v-for="page in pages"
      :key="'page-' + page"
      :disabled="!page"
      :class="[
        'px-3 py-1',
        page === currentPage
          ? 'text-additional-500 border border-additional-500 rounded-lg' // highlight active page
          : 'rounded-lg text-secondary-500 hover:text-additional-500',
        !page ? 'cursor-default' : '', // ellipsis not clickable
      ]"
      @click="goToPage(page)"
    >
      {{ page ? page : "..." }}
    </button>

    <!-- Next button -->
    <button
      class="flex items-center px-3 py-1 rounded-lg bg-secondary-500 text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:bg-secondary-500 hover:bg-secondary-600"
      :disabled="!pagination.nextPage"
      @click="goToPage(pagination.nextPage)"
    >
      <Icon name="mdi:arrow-right-thin" class="text-primary-500 text-2xl" />
    </button>
  </nav>
</template>

<script setup lang="ts">
/**
 * Two-way binding for current active page
 */
const currentPage = defineModel<number>("page", { default: 1 });

/**
 * Pagination data from API (without 'page', since it's handled locally)
 */
const props = defineProps<{
  pagination: Omit<PaginationProperties, "page">;
}>();

/**
 * Pages list and navigation logic
 * (calculated pages array with ellipsis + method to switch page)
 */
const { pages, goToPage } = usePagination(
  currentPage,
  toRef(props, "pagination"),
);
</script>
