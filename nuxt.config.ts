// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
    "@nuxt/fonts",
  ],
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      environment: process.env.ENV || "development",
      baseApiPath: process.env.BASE_API_PATH,
    },
    mongoDbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: process.env.JWT_LIFETIME,
  },
  routeRules: {
    "/admin/**": { ssr: false },
    "/projects/create": { ssr: false },
    "/projects/*/edit": { ssr: false },
    "/sections/create": { ssr: false },
    "/sections/*/edit": { ssr: false },
  },
  vite: {
    plugins: [
      // Temporary workaround for Vite 8 + vite-plugin-checker@0.14.4:
      // checker emits a base-prefixed runtime import
      // (`/_nuxt/@vite-plugin-checker-runtime`) that its own resolveId no
      // longer matches. See nuxt/nuxt#35765 / fi3ework/vite-plugin-checker#661.
      {
        name: "vite-plugin-checker-runtime-base-fix",
        resolveId(id: string) {
          if (id.endsWith("/@vite-plugin-checker-runtime")) {
            return "virtual:@vite-plugin-checker-runtime";
          }
        },
      },
    ],
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "zod",
        "vue-toast-notification",
        "lodash",
        "@vuelidate/core",
        "@vuelidate/validators",
      ],
    },
  },
});
