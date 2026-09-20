# --- Stage 1: install dependencies (no lifecycle scripts) ---
FROM node:22.23.2-slim AS deps
WORKDIR /app

RUN npm i -g npm@12.0.2

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# --- Stage 2: build app ---
FROM deps AS build
WORKDIR /app

COPY . .

# Public values that affect the client bundle / image domains at build time
ARG NUXT_PUBLIC_SITE_URL=
ARG UPLOAD_PUBLIC_BASE_URL=
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL \
    UPLOAD_PUBLIC_BASE_URL=$UPLOAD_PUBLIC_BASE_URL \
    NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=3584

# Generate `.nuxt/` from the real sources, then production build
RUN npx nuxt prepare && npm run build

# --- Stage 3: production image ---
FROM node:22.23.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

# LocalStorageProvider writes to <cwd>/public/uploads; Nitro serves .output/public.
# Symlink keeps both paths on the same Compose volume mount.
USER root
RUN mkdir -p /app/.output/public/uploads /app/public \
  && ln -sfn /app/.output/public/uploads /app/public/uploads \
  && chown -R node:node /app/.output/public/uploads /app/public

USER node
EXPOSE 3000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
