/**
 * Shared state for dashboard sidebar
 * This composable manages only the UI state (open/close)
 * and can be used across multiple components
 */
export function useDashboardSideNavbarState() {
  /**
   * Check if sidebar is open
   */
  const isSidebarOpen = useState<boolean>(
    "dashboard-sidebar-open",
    () => false,
  );

  /**
   * Toggle sidebar visibility
   * @param isOpen - determines sidebar visibility state
   */
  const toggleSidebar = (isOpen: boolean) => {
    isSidebarOpen.value = isOpen;
  };

  return {
    isSidebarOpen,
    toggleSidebar,
  };
}
