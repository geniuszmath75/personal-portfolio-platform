<template>
  <div class="flex bg-primary-500 min-h-screen font-default">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
