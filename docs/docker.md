# Docker

## Production
```bash
docker compose -f docker/docker-compose.yml up -d
```

## Development
```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

## Ports
- `8080` — Production (nginx + backend)
- `8000` — Backend API (dev)
- `8173` — Frontend dev server
