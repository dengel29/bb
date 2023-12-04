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
COPY . /usr/application

FROM base AS deps
ARG service
WORKDIR /usr/application/${service}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base as build
ARG service
WORKDIR /usr/application/${service}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm run build
RUN pnpm deploy --filter=${service} --prod /prod/${service}

FROM base as server
COPY --from=deps /usr/application/${service}/node_modules /prod/${service}/node_modules
COPY --from=build /prod/${service}/dist /prod/${service}
COPY --from=build /prod/${service}/package.json /prod/${service}
# COPY --from=build /prod/pnpm-lock.yaml /prod/${service}
WORKDIR /prod/${service}
EXPOSE 3000
CMD [ "pnpm", "run", "start:prod" ]

# FROM base AS app2
# COPY --from=build /prod/app2 /prod/app2
# WORKDIR /prod/app2
# EXPOSE 8001
# CMD [ "pnpm", "start" ]