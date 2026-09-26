# Laneh

###### /lä-neh/ (*Farsi*: لانه); Nest, den, home.

Self-hosted app to manage shopping, expenses and (recurring) tasks. Can be used on your own, but really shines in a
shared household with multiple users.

## Getting started with Docker

### Installation

- Create a folder for the project
- Download [docker-compose.prod.yml](docker-compose.prod.yml) into the folder
- Rename the file to `docker-compose.yml`
- Download [.env.example](.env.example) into the folder
- Rename the file to `.env`
- Replace `CHANGE_ME` in `.env` with a random password for the database. Only use letters and digits.
- Feel free to adjust the timezone in `.env` to fit your location. The remaining values can be kept as-is without any
  issues.
- Create an empty folder called `postgres-data` (must match `DATABASE_LOCATION` value from .env)
- run `docker compose up -d`
- Access the app via http://localhost:3000

### Updating

- The app menu will show you, if there's a new version available
- Navigate to your Laneh folder
- Run `docker compose pull && docker compose up -d`

### Upgrading from 3.x (PGlite) to Postgres

Version 3.x stored its data with PGlite. The server now uses a regular Postgres container, so the data has to be moved
over once via a backup:

- In the old version, download a database backup on the settings page
- Run `docker compose down`
- Replace your `docker-compose.yml` with the new [docker-compose.prod.yml](docker-compose.prod.yml)
- Add the new DB values from [.env.example](.env.example) to your `.env` and remove `DOCKER_DATABASE_LOCATION`. Point
  `DATABASE_LOCATION` to a new, empty folder (e.g. `postgres-data`). Keep the old `pglite-data` folder until everything
  works.
- Run `docker compose pull && docker compose up -d`
- Open the app and import your backup on the setup page

### Run at startup

If you want to automatically start the container whenever your server starts, I suggest using this systemd unit. Make
sure to replace `/path/to/laneh` and `myusername` with the correct values for your setup.

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

[Install]
WantedBy=multi-user.target
```

## Android

There is no publicly available prebuilt android version yet. I will add a link to the Play Store here, when it's ready.

In the meantime, you can follow the steps in [Android (static)](#android-static) to build your own APK.

## Development

If you want to create a pull request, run `git config core.hooksPath .githooks` before you start to ensure your commit
messages are clean.

### Web

- Clone this repository.
- Copy `.env.dev` to `.env`
- Start the container via `docker compose up`
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
    - This needs to run separately to your already running docker container on port 5173
    - The database URL points to the container's Postgres, which is available on localhost
- Add `CAP_LIVE_RELOAD=true CAP_SERVER_URL=http://%HOST_IP%:3000` before the `npx cap run android` command
