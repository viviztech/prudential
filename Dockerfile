FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx wrangler dev --config dist/server/wrangler.json --ip 0.0.0.0 --port ${PORT:-3000} --persist-to /data --var ADMIN_PASSWORD:${ADMIN_PASSWORD} --var AUTH_SECRET:${AUTH_SECRET}"]
