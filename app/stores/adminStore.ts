import type { ValidatedUpdateUserProfile } from "~~/shared/utils/validateUpdateUserProfile";

export const useAdminStore = defineStore("adminStore", {
  state: () => {
    return {
      /**
       * Admin user details
       */
      adminDetails: null as ValidatedAdminUser | null,

      /**
       * Indicates if Admin-related requests are in progress
       */
      loading: false,
    };
  },
  getters: {
    /**
     * Essential Admin details fields
     *
     * @param state - store state
     * @returns object with basic Admin details
     */
    basicAdminDetails(state) {
      return {
        email: state.adminDetails?.email ?? "",
        username: state.adminDetails?.username ?? "",
        avatar: state.adminDetails?.avatar ?? null,
      };
    },
  },
  actions: {
    /**
     * Update Admin details
     * @param adminDetails - updated admin details
     */
    setAdminDetails(adminDetails: ValidatedAdminUser) {
      this.adminDetails = adminDetails;
    },

    /**
     * Fetches Admin profile and sets the response to 'adminDetails' state
     * @async
     */
    async fetchAdminProfile() {
      const { baseApiPath } = useRuntimeConfig().public;

      try {
        this.loading = true;

        const res = await $fetch("/admin/profile", {
          baseURL: baseApiPath,
          credentials: "include",
        });

        const validatedAdminDetails = adminDetailsResponseSchema.parse(res);

        this.setAdminDetails(validatedAdminDetails.admin);
      } catch (error) {
        handleError(error, "Failed to fetch Admin profile");
      } finally {
        this.loading = false;
      }
    },

    async updateAdminProfile(updatedProfile: ValidatedUpdateUserProfile) {
      const { baseApiPath } = useRuntimeConfig().public;

      try {
        this.loading = true;

        const res = await $fetch("/admin/profile", {
          baseURL: baseApiPath,
          method: "PATCH",
          credentials: "include",
          body: updatedProfile,
        });

        const validatedUpdatedAdminDetails =
          adminDetailsResponseSchema.parse(res);

        this.setAdminDetails(validatedUpdatedAdminDetails.admin);
        return true;
      } catch (error) {
        handleError(error, "Failed to update Admin profile");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
