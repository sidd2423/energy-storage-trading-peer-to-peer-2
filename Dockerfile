FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080
CMD ["yarn", "start"]