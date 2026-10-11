# Laneh

###### /lä-neh/ (*Farsi*: لانه); Nest, den, home.

Self-hosted app to manage shopping, expenses and tasks. Can be used on your own, but really shines in a
shared household with multiple users.

## Getting started

Laneh runs in containers. The same compose file works with [Podman](https://podman.io) (recommended, runs rootless
without a daemon) and Docker.

### Installation

- Install podman and podman-compose. If you prefer Docker, install Docker with the compose plugin instead and use
  `docker compose` wherever this guide says `podman compose`.
- Create a folder for the project
- Download [docker-compose.prod.yml](docker-compose.prod.yml) into the folder
- Rename the file to `docker-compose.yml`
- Download [.env.example](.env.example) into the folder
- Rename the file to `.env`
- Replace `CHANGE_ME` in `.env` with a random password for the database. Only use letters and digits. The database 
  container will not be accessible from the outside, so technically it's not super important to have a strong password.
- Other values in `.env` like timezone can be changed, if you so desire. But their default value will work fine.
- Create an empty folder called `postgres-data` (matching `DATABASE_LOCATION` from .env) inside the laneh folder.
- Create an empty folder called `backups` (matching `BACKUP_LOCATION` from .env) inside the laneh folder.
- run `podman compose up -d`
- Access the app via http://localhost:3000

### Updating

The app menu will show you, if there's a new version available. On mobile, you will also see a warning, if there's a
version mismatch between the mobile app and the connected server instance.

- Navigate to your Laneh folder
- Run `podman compose pull && podman compose up -d`

### Backups

The server creates a backup of the database every night at 2am (in the timezone `TZ` from .env) and stores it in the
`BACKUP_LOCATION` folder. Backups of the last 3 days are kept, older ones are deleted. If the server was down at 2am, the
backup is created as soon as it's running again. A backup can be imported on the setup page of a fresh instance.

### Run at startup (Podman)

The containers already use `restart: always`. Without a daemon, Podman needs systemd to bring them back after a reboot.
Run these once as the user that owns the containers:

```shell
# Start your user's services at boot, without waiting for a login
loginctl enable-linger
# Restart all containers with restart policy "always" at boot
systemctl --user enable podman-restart.service
```

### Run at startup (Docker)

If you use Docker and want to automatically start the container whenever your server starts, I suggest using this
systemd unit. Make sure to replace `/path/to/laneh` and `myusername` with the correct values for your setup.

```unit file (systemd)
[Unit]
Description=Laneh Docker Compose
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/path/to/laneh
User=myusername
Group=myusername
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=5s

# Hardening: docker-compose is only a client that talks to the Docker daemon via its UNIX socket.
# The containers themselves are started by the daemon and are not affected by these settings.
NoNewPrivileges=yes
CapabilityBoundingSet=
UMask=0077
RemoveIPC=yes

ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=yes
PrivateDevices=yes
DevicePolicy=closed
PrivateMounts=yes
ProtectProc=invisible
ProcSubset=pid

ProtectClock=yes
ProtectHostname=yes
ProtectKernelLogs=yes
ProtectKernelModules=yes
ProtectKernelTunables=yes
ProtectControlGroups=yes

# Filesystem UNIX sockets (/var/run/docker.sock) stay reachable inside a private network namespace.
# Remove these three lines if you use DOCKER_HOST=tcp://... or ssh://...
PrivateNetwork=yes
IPAddressDeny=any
RestrictAddressFamilies=AF_UNIX

RestrictNamespaces=yes
RestrictRealtime=yes
RestrictSUIDSGID=yes
LockPersonality=yes
MemoryDenyWriteExecute=yes
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources
SystemCallErrorNumber=EPERM

[Install]
WantedBy=multi-user.target
```

## Android

There is no publicly available build for android yet. I will add a link to the Play Store here, when it's ready.

In the meantime, you can follow the steps in [Android (static)](#android-static) to build your own APK.

## Development

If you want to create a pull request, run `git config core.hooksPath .githooks` before you start to ensure your commit
messages are clean.

### Web

- Install Podman and [podman-compose](https://github.com/containers/podman-compose).
- Clone this repository.
- Copy `.env.dev` to `.env`
- Start the containers via `podman compose up`
- Access the app via http://localhost:5173

### Android (static)

- Requires `npm` and an Android development environment
- Connect your phone to the PC
- Follow the [Web](#web) steps
- Run `CAPACITOR_BUILD=true npm run build`
- Run `npx cap sync android`
- Run `npx cap run android`

### Android (hot-reload)

Roughly the same steps as for the static version, but with some adjustments:

- You technically don't need the `npm run build` step, because the hot-reload version of the app won't use the `build`
  folder as its source. But the Capacitor commands will still fail, if it can't find `build/index.hmtl`. So if you skip
  the build, you need to at least create an empty file at that location.
- Run `DATABASE_URL=postgres://laneh:laneh@localhost:5432/laneh npm run dev -- --host --port 3000`
    - This needs to run separately to your already running container on port 5173
    - The database URL points to the container's Postgres, which is available on localhost
- Add `CAP_LIVE_RELOAD=true CAP_SERVER_URL=http://%HOST_IP%:3000` before the `npx cap run android` command
