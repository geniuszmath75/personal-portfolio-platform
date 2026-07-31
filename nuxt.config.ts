import { UploadDriver } from "./shared/types/enums";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_SITE_NAME,
  SEO_TITLE_TEMPLATE,
} from "./shared/seo/siteSeo";
import { uploadCdnDomains } from "./shared/utils/uploadCdnDomains";

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
    "@nuxt/image",
  ],
  typescript: {
    typeCheck: true,
  },
  /**
   * Global head defaults. Page-specific title/description/og via `usePageSeo`.
   */
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: SEO_DEFAULT_TITLE,
      titleTemplate: SEO_TITLE_TEMPLATE,
      meta: [
        {
          name: "author",
          content: SEO_SITE_NAME,
        },
        {
          name: "description",
          content: SEO_DEFAULT_DESCRIPTION,
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/logo/logo.svg" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/logo/logo_180_180.png",
        },
      ],
    },
  },
  /**
   * Default IPX provider optimizes local `/uploads` and `/images` from `public/`.
   * R2/CDN hosts must be listed in `domains` (from UPLOAD_PUBLIC_BASE_URL).
   */
  image: {
    quality: 80,
    format: ["webp"],
    domains: uploadCdnDomains(),
    presets: {
      avatar: {
        modifiers: {
          width: 256,
          height: 256,
          fit: "cover",
        },
      },
      projectCard: {
        modifiers: {
          width: 800,
          height: 450,
          fit: "cover",
        },
      },
      projectCarousel: {
        modifiers: {
          width: 1280,
          height: 720,
          fit: "cover",
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      environment: process.env.ENV || "development",
      baseApiPath: process.env.BASE_API_PATH || "/api/v1",
      /** Public CDN/base URL for uploaded assets*/
      uploadPublicBaseUrl: process.env.UPLOAD_PUBLIC_BASE_URL || "",
      /**
       * Canonical site origin for og:url / canonical links
       * Leave empty in local dev.
       */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || "",
    },
    mongoDbUri: process.env.MONGODB_URI,

    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: process.env.JWT_LIFETIME,

    uploadDriver: process.env.UPLOAD_DRIVER || UploadDriver.LOCAL,
    s3Endpoint: process.env.S3_ENDPOINT || "",
    s3Region: process.env.S3_REGION || "",
    s3Bucket: process.env.S3_BUCKET || "",
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  routeRules: {
    "/admin/**": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/auth/**": {
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/projects/create": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/projects/*/edit": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/sections/create": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/sections/*/edit": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
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
