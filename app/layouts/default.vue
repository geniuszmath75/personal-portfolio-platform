<template>
  <div class="flex min-h-screen flex-col font-default">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
