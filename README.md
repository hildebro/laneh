## Usage

### Preconditions
Install `docker` `docker compose` and `docker-buildx`.

### Development setup
Run the following:
```bash
docker compose up
# Execute all statements, when prompted.
docker compose exec app npm run db:push
```
Adjust `.env` based on your needs.

You can access the app 
- via exposed port at http://localhost:5173 for hot-reloading
- via traefik at http://localhost to test routing