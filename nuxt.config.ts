// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "@nuxt/icon", "@pinia/nuxt"],
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      environment: process.env.ENV || "development",
    },
    mongoDbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: process.env.JWT_LIFETIME,
  },
});
