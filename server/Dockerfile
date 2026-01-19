FROM node:20-slim

# ffmpeg + fonts for drawtext
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg fonts-dejavu-core ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json ./
RUN npm i --omit=dev
COPY server/ ./

ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
