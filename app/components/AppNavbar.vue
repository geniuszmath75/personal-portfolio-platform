<template>
  <div class="fixed bg-primary-500 w-full h-20">
    <div class="h-full flex justify-between">
      <!-- Home -->
      <div class="flex items-center">
        <NuxtLink
          to="/"
          class="flex items-center h-full text-secondary-500 font-semibold text-sm px-5 md:px-6 md:text-base"
          >HOME</NuxtLink
        >
      </div>

      <!-- GitHub icon -->
      <div class="flex items-center">
        <NuxtLink
          to="https://github.com/geniuszmath75"
          class="flex items-center"
          target="_blank"
        >
          <Icon name="mdi:github" class="text-secondary-500" size="1.5em" />
        </NuxtLink>
      </div>

      <div class="hidden md:flex md:items-center md:space-x-2">
        <!-- Desktop links -->
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="
            'relative flex items-center h-full px-6 text-secondary-500 font-semibold after:absolute after:bottom-0 after:left-0 after:h-1.5 after:w-0 after:bg-additional-500 after:transition-all after:duration-300 ' +
            (currentPath === link.to ? 'after:w-full' : 'hover:after:w-full')
          "
        >
          {{ link.label }}
        </NuxtLink>

        <!-- Account/Login -->
        <div class="flex items-center px-12">
          <div
            ref="accountIconRef"
            class="flex rounded-full p-0.5 bg-secondary-500 border-2 border-secondary-500 cursor-pointer"
            @click="toggleAccountPanel"
          >
            <Icon name="mdi:user" class="text-primary-500" size="2em" />
          </div>
        </div>

        <!-- LogIn panel-->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="isAccountPanelOpen"
            ref="accountPanelRef"
            class="absolute top-full right-2 w-64 min-h-26 mt-2 rounded-3xl bg-primary-500 flex flex-col justify-center items-center"
          >
            <div
              class="flex flex-col justify-center items-center space-y-2 py-6"
            >
              <NuxtLink to="/login" class="w-48">
                <div
                  class="relative flex items-center justify-center bg-additional-500 h-12 rounded-3xl shadow-additional hover:bg-additional-600"
                >
                  <Icon
                    name="mdi:login"
                    class="absolute left-4 text-primary-500"
                    size="1.5em"
                  />

                  <span class="text-secondary-500 font-semibold">LOG IN</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Mobile trigger -->
      <div class="flex items-center px-2 md:hidden">
        <Icon
          v-if="!isMobileMenuOpen"
          name="mdi:menu"
          class="text-secondary-500"
          size="1.5em"
          @click="toggleMobileMenu"
        />
      </div>

      <!-- Mobile menu -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isMobileMenuOpen"
            class="fixed inset-0 bg-primary-500 flex flex-col items-center justify-center w-full z-50"
          >
            <Icon
              name="mdi:close"
              class="absolute top-6 right-2 text-secondary-500 cursor-pointer"
              size="1.5em"
              @click="toggleMobileMenu"
            />

            <!-- Links -->
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :class="
                'h-20 w-full flex items-center justify-center text-secondary-500 font-semibold text-xl ' +
                (currentPath === '/projects'
                  ? 'bg-primary-400'
                  : 'hover:bg-primary-400')
              "
              @click="toggleMobileMenu"
              >{{ link.label }}</NuxtLink
            >

            <!-- Log In -->
            <div class="w-full flex justify-center">
              <NuxtLink
                to="/login"
                class="h-16 w-full flex items-center justify-center space-x-2 bg-additional-500 font-semibold text-xl"
                @click="toggleMobileMenu"
              >
                <Icon name="mdi:login" class="text-primary-500" size="1.5em" />
                <span class="text-secondary-500">LOG IN</span></NuxtLink
              >
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

/**
 * Check if account panel is open
 */
const isAccountPanelOpen = ref(false);

/**
 * Check if mobile menu is open
 */
const isMobileMenuOpen = ref(false);

/**
 * Refs for click outside account panel
 */
const accountPanelRef = ref<HTMLElement | null>(null);
const accountIconRef = ref<HTMLElement | null>(null);

/**
 * Navigation links
 */
const navLinks = [
  { to: "/projects", label: "PROJECTS" },
  { to: "/about", label: "ABOUT" },
];

/**
 * Toggle account panel visibility
 */
const toggleAccountPanel = () => {
  isAccountPanelOpen.value = !isAccountPanelOpen.value;
};

/**
 * Toggle mobile menu visibility
 */
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

/**
 * Handle click outside account panel to close it
 */
const handleClickOutside = (e: MouseEvent) => {
  if (
    isAccountPanelOpen.value &&
    accountPanelRef.value &&
    !accountPanelRef.value.contains(e.target as Node) &&
    accountIconRef.value &&
    !accountIconRef.value.contains(e.target as Node)
  ) {
    isAccountPanelOpen.value = false;
  }
};

/**
 * Current path for active link styling
 */
const currentPath = computed(() => route.path);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
