<template>
  <div class="bg-primary-500 min-h-screen py-20 px-8">
    <!-- Page title -->
    <div
      class="relative flex flex-col items-center justify-center gap-4 my-12 mx-auto max-w-7xl"
    >
      <h2
        class="text-2xl md:text-4xl font-bold text-secondary-500 text-center my-12"
      >
        Projects
      </h2>

      <!-- Create btn inside header - only for desktop -->
      <div class="absolute right-0 hidden md:block">
        <ClientOnly>
          <NuxtLink v-if="isAdmin" to="/projects/create">
            <BaseBtn label="New project" btn-size="large">
              <template #icon>
                <Icon
                  name="mdi:plus"
                  class="absolute left-2 text-secondary-500 text-2xl"
                />
              </template>
            </BaseBtn>
          </NuxtLink>
        </ClientOnly>
      </div>

      <!-- Create btn as FAB - only for mobile -->
      <ClientOnly>
        <NuxtLink
          v-if="isAdmin"
          to="/projects/create"
          class="fixed bottom-6 right-6 md:hidden"
        >
          <BaseBtn label="New project">
            <template #icon>
              <Icon name="mdi:plus" class="text-secondary-500 text-2xl" />
            </template>
          </BaseBtn>
        </NuxtLink>
      </ClientOnly>
    </div>

    <BaseFilterBar v-model:limit="currentLimit" :variants="LIMIT_VARIANTS" />

    <!-- Projects grid -->
    <div
      class="grid gap-8 mx-auto sm:grid-cols-2 lg:grid-cols-3 max-w-7xl min-h-96"
    >
      <ProjectCard
        v-for="project in basicProjectInformation"
        v-show="!loading"
        :key="project._id"
        :project="project"
      />
      <LoadingAnimation v-show="loading" label="Loading projects..." />
    </div>

    <BasePagination
      v-if="pagination"
      v-model:page="currentPage"
      :pagination="pagination"
    />
  </div>
</template>
<script setup lang="ts">
const projectStore = useProjectsStore();
const authStore = useAuthStore();

const { basicProjectInformation, pagination, loading } =
  storeToRefs(projectStore);
const { isAdmin } = storeToRefs(authStore);

const route = useRoute();
const router = useRouter();

/**
 * Variants of project limit per page (used in filter bar)
 */
const LIMIT_VARIANTS = [5, 10];

/**
 * Currently selected number of projects per page
 */
const currentLimit = ref(5);

/**
 * Currently selected page number
 */
const currentPage = ref(1);

/**
 * Watch for changes in page or limit.
 * - If limit changes, reset page back to 1
 * - Always update query params to reflect new state
 */
watch([currentPage, currentLimit], ([page, limit], [_, oldLimit]) => {
  let newPage = page;

  if (limit !== oldLimit) {
    newPage = 1;
    currentPage.value = 1;
  }
  router.replace({
    query: {
      ...route.query,
      page: String(newPage),
      limit: String(limit),
    },
  });
});

/**
 * Refetch projects whenever currentPage or currentLimit changes
 */
watchEffect(async () => {
  await projectStore.fetchProjects(currentPage.value, currentLimit.value);
});

await callOnce("projects", () => projectStore.fetchProjects());
</script>
