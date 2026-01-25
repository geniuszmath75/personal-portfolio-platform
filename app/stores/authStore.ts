import { UserSchemaRole } from "~~/server/types/enums";
import type { AuthUser } from "~~/shared/types";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      /**
       * The authenticated user information
       */
      user: null as AuthUser | null,
      /**
       * Indicates if the user is logged in
       */
      loggedIn: false,
      /**
       * Indicates if the login request is in progress
       */
      loading: false,
    };
  },
  getters: {
    /**
     * Checks if the authenticated user is an admin
     *
     * @param state - store state
     * @returns true if the user is an admin, false otherwise
     */
    isAdmin(state): boolean {
      return state.user?.role === UserSchemaRole.ADMIN && state.loggedIn;
    },
  },
  actions: {
    /**
     * Logs in the user with provided credentials
     *
     * @param credentials - user login credentials
     * @returns true if login is successful, false otherwise
     * @async
     */
    async login(credentials: { email: string; password: string }) {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        this.loading = true;

        const res = await $fetch("/auth/login", {
          baseURL: baseApiPath,
          method: "POST",
          body: JSON.stringify(credentials),
        });

        const validatedLoginResponse = loginResponseSchema.parse(res);

        this.user = validatedLoginResponse.user;
        this.loggedIn = true;
        return true;
      } catch (error) {
        handleError(error);
      } finally {
        this.loading = false;
      }
    },
    /**
     * Logs out the authenticated user
     * @async
     */
    async logout() {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        this.loading = true;

        await $fetch("/auth/logout", {
          baseURL: baseApiPath,
          method: "POST",
        });
      } catch (error) {
        handleError(error);
      } finally {
        this.user = null;
        this.loggedIn = false;
        this.loading = false;
        await navigateTo("/");
        showSuccessToast("Successfully logged out");
      }
    },
    /**
     * Checks if the user is authenticated
     * @async
     */
    async checkAuth() {
      const { baseApiPath } = useRuntimeConfig().public;
      try {
        this.loading = true;

        const res = await $fetch("/auth/me", {
          baseURL: baseApiPath,
          credentials: "include",
        });

        const validatedAuthUser = authUserSchema.parse(res);

        this.user = validatedAuthUser.user;
        this.loggedIn = true;
      } catch {
        // Not logged in user or session expired
        this.user = null;
        this.loggedIn = false;
      } finally {
        this.loading = false;
      }
    },
  },
});
