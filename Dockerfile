FROM node:10-alpine AS build
WORKDIR /app/
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY e2e ./e2e/
COPY src ./src/
COPY angular.json tsconfig.json tslint.json ./
RUN npm run build

FROM nginx:1.15.10-alpine
COPY --from=build /app/dist/front /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/
