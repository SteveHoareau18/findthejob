FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
COPY . .

FROM node:24-alpine AS production

WORKDIR /app
RUN chown node:node /app
COPY --from=build --chown=node:node /app /app

USER node

CMD ["npm", "start"]