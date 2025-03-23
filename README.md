## Usage

### Preconditions
Install `docker` `docker compose` and `docker-buildx`.

### Development setup
- Clone the repository.
- Adjust `.env` based on your needs.
- Create an entry in the password manager of your choice for Chorehub. Add an OTP to that entry with this content:
```
otpauth://totp/Chorehub:shared?secret=OTP_SECRET&issuer=Chorehub&algorithm=SHA1&digits=6&period=30
```
- Run the following:
```bash
docker compose up
docker compose exec app npm run db:migrate
```

You can access the app 
- via exposed port at http://localhost:5173 for hot-reloading
- via traefik at http://localhost to test routing