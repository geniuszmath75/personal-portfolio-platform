import { UserSchemaRole } from "~~/shared/types/enums";
import type { AuthUser } from "~~/shared/types";
import { getErrorStatusCode, handleError } from "~/utils/handleError";

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
     * Update the authenticated user
     * @param user - updated user information
     */
    setAuthUser(user: AuthUser | null) {
      this.user = user;
    },
    /**
     * Update the loggedIn status
     * @param loggedIn - updated loggedIn status
     */
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn;
    },
    /**
     * Clears the authentication state
     */
    clearAuth() {
      this.user = null;
      this.loggedIn = false;
    },
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

        this.setAuthUser(validatedLoginResponse.user);
        this.setLoggedIn(true);
        return true;
      } catch (error) {
        handleError(error, "Login failed");
        return false;
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
      let logoutSucceeded = false;

      try {
        this.loading = true;

        await $fetch("/auth/logout", {
          baseURL: baseApiPath,
          method: "POST",
        });
        logoutSucceeded = true;
      } catch (error) {
        handleError(error, "Failed to log out");
      } finally {
        this.clearAuth();
        this.loading = false;
        await navigateTo("/");
        if (logoutSucceeded) {
          showSuccessToast("Successfully logged out");
        }
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

        this.setAuthUser(validatedAuthUser.user);
        this.setLoggedIn(true);
      } catch (error) {
        this.clearAuth();

        // Auth probe failures (guest, expired session, missing route) stay silent.
        // Only surface network / server failures.
        const statusCode = getErrorStatusCode(error);
        const isClientAuthFailure =
          statusCode !== undefined && statusCode >= 400 && statusCode < 500;

        if (!isClientAuthFailure) {
          handleError(error, "Failed to verify authentication");
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
