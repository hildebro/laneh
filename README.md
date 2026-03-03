## Usage

### Preconditions
Install `docker` `docker compose` and `docker-buildx`.

### Setup
- Clone the repository.
- Copy `.env.exmaple` to `.env` and replace the placeholder value for the database password.
- Start the container via `docker compose up -d`
- Initiate the database via `docker compose exec app npm run db:migrate`
- Access the app via http://localhost:5173
- Creating the first user is done without any authentication. Further users have to be created by an existing user through the settings.

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

Example `webhook` config:
```json
[
  {
    "id": "deploy-chorehub",
    "execute-command": "/my/working/dir/deploy.sh",
    "command-working-directory": "/my/working/dir",
    "trigger-rule": {
      "match": {
        "type": "value",
        "value": "YOUR_SECRET_TOKEN_HERE",
        "parameter": {
          "source": "header",
          "name": "X-Deploy-Token"
        }
      }
    }
  }
]
```

Example `deploy.sh` script:
```shell
#!/bin/bash
set -e

cd /my/working/dir

git pull origin main

# This specific command needs to be added to sudoers file so that it can be 
# executed without password prompt.
sudo systemctl restart chorehub
```