# Elevex API (Laravel)

## Local

See the root [README](../README.md).

## Railway

1. Service **Root Directory**: `backend`
2. Uses [`Dockerfile`](./Dockerfile) + [`railway.toml`](./railway.toml)
3. Entrypoint runs migrate, `storage:link`, optional seed (`RUN_SEED=true`), then `artisan serve` on `$PORT`
4. Copy production vars from [`.env.example`](./.env.example) checklist

Health: `GET /up`
