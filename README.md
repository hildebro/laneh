## Usage

### Preconditions
Install `docker` `docker compose` and `docker-buildx`.

### Setup app
```bash
docker compose up
# For database initialization
docker compose exec app npm run db:push
```

### Setup environment
Adjust `.env` based on your needs.