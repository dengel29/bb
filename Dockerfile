# ## Prepare workspace

# FROM node:19-alpine AS workspace
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# WORKDIR /app

# RUN corepack enable && corepack prepare pnpm@8.10.5 --activate

# COPY pnpm-lock.yaml .
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch

# COPY . .
# RUN pnpm add --filter ${service} typescript
# RUN pnpm install --filter ${service} --frozen-lockfile


# ## Create minimal deployment for given package

# FROM workspace AS pruned
# ARG service
# WORKDIR /app
# RUN pnpm --filter ${service} run build
# RUN pnpm --filter ${service} deploy --prod pruned



# ## Production image

# FROM node:18-alpine
# ARG service
# WORKDIR /app

# ENV NODE_ENV=production
# COPY --from=pruned /${service}/dist dist
# COPY --from=pruned /${service}/package.json package.json
# COPY --from=pruned /${service}/node_modules node_modules

# ENTRYPOINT ["node", "dist/src"]
FROM node:19-slim AS base
ARG service
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ARG service
COPY . .
WORKDIR /${service}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prisma generate
RUN pnpm prisma generate
RUN pnpm run build
RUN pnpm deploy --filter=${service} --prod /prod/${service}
# RUN pnpm deploy --filter=app2 --prod /prod/app2

FROM base
COPY --from=build /prod/${service}/dist /prod/${service}
WORKDIR /prod/${service}
EXPOSE 8000
CMD [ "pnpm", "start:prod" ]

# FROM base AS app2
# COPY --from=build /prod/app2 /prod/app2
# WORKDIR /prod/app2
# EXPOSE 8001
# CMD [ "pnpm", "start" ]