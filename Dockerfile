FROM node:24-slim AS build

WORKDIR /app

RUN npm install -g npm@11.19.0

COPY package.json package-lock.json ./

RUN npm install
COPY . .

FROM node:24-alpine AS production

WORKDIR /app
RUN chown node:node /app
COPY --from=build --chown=node:node /app /app
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER node

CMD ["node", "index.js"]