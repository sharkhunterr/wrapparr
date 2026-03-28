# Configuration

## Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+asyncpg://wrapparr:secret@postgres:5432/wrapparr` |
| `REDIS_URL` | Redis connection | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT secret key | (required) |
| `ENCRYPTION_KEY` | Credential encryption | (required) |
| `TMDB_API_KEY` | TMDB API key for enrichment | (optional) |
| `FIRST_ADMIN_EMAIL` | Initial admin email | `admin@example.com` |
| `FIRST_ADMIN_PASSWORD` | Initial admin password | (required) |
| `PROD_PORT` | Production port | `8080` |
