<template>
  <div class="bg-primary-500 min-h-screen font-default">
    <AppNavbar />

    <!-- CONTENT UNDER NAV -->
    <div class="flex pt-16 md:pt-20">
      <DashboardSideNavbar />
      <main class="flex-1 p-6 ml-6 md:ml-0">
        <slot />
      </main>
    </div>

    <AppFooter />
    <TriggerRail />
  </div>
</template>
