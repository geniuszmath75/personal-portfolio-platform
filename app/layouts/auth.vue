<template>
  <div class="flex min-h-screen flex-col font-default bg-primary-500">
    <!-- Home -->
    <div class="fixed w-full h-16 md:h-20">
      <div class="h-full flex justify-between">
        <div class="flex items-center">
          <NuxtLink
            to="/"
            class="flex items-center h-full text-secondary-500 font-semibold text-sm px-5 md:px-6 md:text-base"
            >HOME</NuxtLink
          >
        </div>
      </div>
    </div>
    <main class="m-auto w-full max-w-md">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
