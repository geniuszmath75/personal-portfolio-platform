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
});
