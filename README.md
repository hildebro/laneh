## Usage

### Preconditions
Install `docker` `docker compose` and `docker-buildx`.

### Setup
- Clone the repository.
- Copy `.env.exmaple` to `.env` and adjust based on your needs.
- Create a TOTP entry in the password manager of your choice. With the default secrets, it could look like this:
```
otpauth://totp/Chorehub:shared?secret=OTP_SECRET&issuer=Chorehub&algorithm=SHA1&digits=6&period=30
```
- Run the following:
```bash
docker compose up
docker compose exec app npm run db:migrate
```

You can access the app via http://localhost:5173.