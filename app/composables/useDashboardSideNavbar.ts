import type { SidebarDropdownChild, SidebarLink } from "~/types/components";

export function useDashboardSideNavbar(links: SidebarLink[]) {
  const route = useRoute();

  const { isSidebarOpen, toggleSidebar } = useDashboardSideNavbarState();

  /**
   * Id of currently open dropdown menu
   */
  const openDropdownId = ref<number | null>(null);

  /**
   * Check if dropdown menu is open
   * @param id - id of the dropdown menu to check
   * @returns true if the dropdown menu is open, false otherwise
   */
  const isDropdownMenuOpen = (id: number) => openDropdownId.value === id;

  /**
   * Toggle dropdown menu visibility
   * @param id - id of the dropdown menu to toggle
   */
  const toggleDropdownMenu = (id: number) => {
    openDropdownId.value = openDropdownId.value === id ? null : id;
  };

  /**
   * Check if any of the child routes in the dropdown menu
   * matches the current route
   *
   * @param children - array of child routes to check
   * @returns true if any of the child routes matches the
   * current route, false otherwise
   */
  const isRouteInDropdown = (children: SidebarDropdownChild[]) => {
    if (!children) return false;

    const currentPath = route.path;

    return children.some((child) => child.to === currentPath);
  };

  /**
   * Compute sidebar visibility class
   */
  const sidebarVisibilityClass = computed(() => {
    return isSidebarOpen.value ? "translate-x-0" : "-translate-x-full";
  });

  /**
   * Watch for route changes and open the dropdown menu if the current route matches any of the child routes
   */
  watch(
    () => route.path,
    () => {
      // Try to find in dropdown menu link equals to current route path
      const matchedLink = links.find(
        (link) => link.type === "dropdown" && isRouteInDropdown(link.children),
      );

      // Mark the dropdown with matched link as open
      openDropdownId.value = matchedLink?.id ?? null;
    },
    { immediate: true },
  );

  return {
    isSidebarOpen,
    toggleSidebar,
    isDropdownMenuOpen,
    toggleDropdownMenu,
    sidebarVisibilityClass,
  };
}
