import type { SidebarLink } from "~/types/components";

/**
 * DashboardSideNavbar links
 */
export const adminDashboardlinks: SidebarLink[] = [
  {
    id: 1,
    type: "dropdown",
    label: "GENERAL",
    icon: "mdi:account",
    children: [
      {
        id: 1,
        to: "/admin/dashboard",
        label: "PROFILE",
        icon: "mdi:account-circle",
      },
    ],
  },
];
