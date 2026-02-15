<template>
  <!-- Overlay -->
  <div
    v-if="isSidebarOpen"
    class="fixed inset-0 bg-primary-500/80 z-30 md:hidden"
    @click="toggleSidebar(false)"
  ></div>

  <!-- Side Navbar -->
  <aside
    :class="[
      'fixed md:sticky left-0 top-16 md:top-20 z-40 w-72 h-screen md:h-[calc(100vh-10rem)] transition-transform duration-500 md:translate-x-0 ',
      sidebarVisibilityClass,
    ]"
  >
    <div
      class="h-full px-3 py-4 bg-secondary-500 border-e border-secondary-600"
    >
      <ul class="space-y-2 font-medium">
        <li v-for="link in adminDashboardlinks" :key="link.id">
          <!-- Element without children -> LINK  -->
          <NuxtLink
            v-if="link.type === 'link'"
            :to="link.to"
            @click="toggleSidebar(false)"
          >
            <BaseBtn
              :label="link.label"
              :btn-style="computeBtnStyleProp(link.to)"
            >
              <template v-if="link.icon" #icon>
                <Icon
                  :name="link.icon"
                  class="absolute left-2 text-primary-500 text-2xl"
                />
              </template>
            </BaseBtn>
          </NuxtLink>

          <!-- Element with children -> BUTTON -->
          <BaseBtn
            v-else
            :label="link.label"
            btn-style="sidebar--secondary"
            @click="toggleDropdownMenu(link.id)"
          >
            <template v-if="link.icon" #icon>
              <Icon
                :name="link.icon"
                class="absolute left-2 text-primary-500 text-2xl"
              />
            </template>

            <Icon
              name="mdi:chevron-down"
              :class="[
                'absolute right-2 text-primary-500 text-2xl transition-transform',
                {
                  'rotate-180': isDropdownMenuOpen(link.id),
                },
              ]"
            />
          </BaseBtn>

          <!-- DROPDOWN MENU -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 -translate-y-2"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <ul
              v-if="link.type === 'dropdown' && isDropdownMenuOpen(link.id)"
              class="space-y-2 py-2 ml-4"
            >
              <li v-for="child in link.children" :key="child.id">
                <NuxtLink :to="child.to" @click="toggleSidebar(false)">
                  <BaseBtn
                    :label="child.label"
                    :btn-style="computeBtnStyleProp(child.to)"
                    btn-size="small"
                  >
                    <template v-if="child.icon" #icon>
                      <Icon
                        :name="child.icon"
                        class="absolute left-2 text-primary-500 text-xl"
                      />
                    </template>
                  </BaseBtn>
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { BaseBtnStyle } from "~/types/components";
import { adminDashboardlinks } from "~/config/adminDashboardLinks";

const route = useRoute();

const {
  isSidebarOpen,
  toggleSidebar,
  isDropdownMenuOpen,
  sidebarVisibilityClass,
  toggleDropdownMenu,
} = useDashboardSideNavbar(adminDashboardlinks);

/**
 * Compute button style based on the current route
 * @param linkTo - route to compare with the current route
 */
const computeBtnStyleProp = (linkTo: string): BaseBtnStyle => {
  const currentPath = route.path;

  return currentPath === linkTo ? "sidebar--additional" : "sidebar--secondary";
};
</script>
