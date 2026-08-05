FROM node:22-alpine AS base

RUN apk update && apk add git

COPY package.json ./

RUN npm install
RUN npm install typescript -g

# add folder if needs more
COPY src ./src
COPY config ./config

COPY tsconfig.json ./tsconfig.json

ENV NODE_ENV=prod
RUN npm run swagger

RUN npm run build

FROM node:22-alpine

# Copy node modules and build directory from base image to new image
COPY --from=base ./node_modules ./node_modules
COPY --from=base ./package.json ./package.json
COPY --from=base /dist /dist
COPY --from=base /config /config
COPY --from=base /config /dist/config
COPY --from=base /src /src

#run
CMD ["npm", "run", "start"]