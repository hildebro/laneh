## Usage

### Preconditions

Install `docker` `docker compose` and `docker-buildx`.

### Setup

- Clone this repository.
- Copy `.env.exmaple` to `.env` and replace the placeholder value for the database password.
- Start the container via `docker compose up -d`
- Initiate the database via `docker compose exec app npm run db:migrate`
- Access the app via http://localhost:5173

### Production

This project has a separate `prod` file for Docker Compose. Apart from building the production version of the node app,
that file also has a database migrator included. So you don't have to run the `db:migrate` command after starting the
container.

If you want to automatically start the container whenever your server starts, I suggest using this systemd unit. Make
sure to replace `/path/to/chorehub` and `myusername` with the correct values for your setup.

```unit file (systemd)
[Unit]
Description=Chorehub Docker Compose
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/path/to/chorehub
User=myusername
Group=myusername
# Uncomment this line, if you want to automatically update whenever the unit restarts.
#ExecStartPre=/usr/bin/git pull
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up --build
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```