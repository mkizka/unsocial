# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20.11.0-slim AS base

CMD ["./scripts/start.sh"]
