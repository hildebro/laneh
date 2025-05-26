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

### Deployment

Example systemd service file:
```unit file (systemd)
[Unit]
Description=Chorehub Docker Compose
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/my/working/dir
User=myusername
Group=myusername
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up --build
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```
