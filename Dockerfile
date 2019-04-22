FROM node:10-alpine AS build
WORKDIR /app/
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY ./public ./public/
COPY ./src ./src/
COPY ./global.d.ts ./tsconfig.json ./tslint.json ./
RUN npm run build

FROM nginx:1.15.10-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/
