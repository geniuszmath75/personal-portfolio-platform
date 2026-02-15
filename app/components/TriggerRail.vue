<template>
  <div
    :class="[
      'fixed top-0 z-40 h-full w-6 bg-secondary-600 flex items-center justify-center cursor-pointer md:hidden transition-all duration-500',
      isSidebarOpen ? 'left-72' : 'left-0',
    ]"
    @click="toggleSidebar(!isSidebarOpen)"
  >
    <Icon
      name="mdi:chevron-right"
      class="text-primary-500 text-2xl transition-transform duration-500"
      :class="{ 'rotate-180': isSidebarOpen }"
    />
  </div>
</template>
<script setup lang="ts">
const { isSidebarOpen, toggleSidebar } = useDashboardSideNavbarState();
</script>
