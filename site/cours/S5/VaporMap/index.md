---
layout: course
title: "Projet VaporMap — Déploiement production"
semestre: "S5"
type_cours: "projet"
tags: ["VaporMap", "Nginx", "Gunicorn", "Flask", "MariaDB", "SystemD", "déploiement"]
---

## Introduction

VaporMap est une application web Flask déployée dans le cadre d'une SAE du S5. L'objectif est de mettre en production une API REST Python (Flask + Gunicorn), une base de données relationnelle (MariaDB) et un frontend statique servi par Nginx — le tout isolé et géré par SystemD.

## Architecture de déploiement

```
Client HTTP
    │
    ▼
Nginx (port 8000) — point d'accès unique
    ├── /          → fichiers statiques du frontend
    ├── /api/      → proxy → Gunicorn (127.0.0.1:5001) → Flask API
    └── /geojson   → proxy → Gunicorn
```

## Stack technique

| Composant | Rôle |
|-----------|------|
| **Flask** | API backend Python (routes REST) |
| **Gunicorn** | Serveur WSGI de production |
| **MariaDB** | Base de données relationnelle |
| **Nginx** | Reverse proxy + fichiers statiques |
| **SystemD** | Gestion et démarrage automatique du service |
| **envsubst** | Injection de variables dans les fichiers de config |

## Étapes de déploiement

### 1. Préparation système

```bash
sudo apt update
sudo apt install curl git vim nano jq nginx-light \
     mariadb-server python3 python3-pip python3-venv
```

Créer un utilisateur système dédié à faibles privilèges :

```bash
sudo useradd -r -d /home/app-vapormap -s /bin/sh \
  -c 'Vapormap App system-user' app-vapormap
```

> Si l'UID est ≥ 1000 (non-système), forcer : `sudo usermod -u 999 app-vapormap`

### 2. Base de données MariaDB

```bash
sudo systemctl enable mariadb
sudo mysql -e "CREATE DATABASE db_vapormap;"
sudo mysql -e "GRANT ALL PRIVILEGES ON db_vapormap.* \
  TO 'user_vapormap'@'localhost' IDENTIFIED BY 'vapormap';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

Vérifier la connexion :

```bash
mysql -h localhost -u user_vapormap -pvapormap -D db_vapormap -e "SHOW TABLES;"
```

### 3. Application Flask

```bash
su - app-vapormap
git clone https://gitlab.com/vapormap/vapormap-src.git ~/vapormap-prod
cd ~/vapormap-prod
python3 -m venv venv && source venv/bin/activate
pip install wheel
pip install -r requirements/production.txt
```

Initialiser la base via Flask-Migrate :

```bash
export VAPOR_DBNAME=db_vapormap  VAPOR_DBUSER=user_vapormap
export VAPOR_DBPASS=vapormap     VAPOR_DBHOST=localhost
export FLASK_APP=app             SETTINGS_FILE=production
flask db upgrade
```

### 4. Service SystemD pour Gunicorn

Template `/app/api-systemd.conf.template` :

```ini
[Unit]
Description=Gunicorn for VaporMap
After=network.target

[Service]
User=${VAPORMAP_USER}
Group=${VAPORMAP_GROUP}
WorkingDirectory=${VAPORMAP_DIR}
Environment="PATH=${VAPORMAP_PATH}"
Environment=SETTINGS_FILE="production"
Environment=VAPOR_DBUSER=${VAPOR_DBUSER}
Environment=VAPOR_DBPASS=${VAPOR_DBPASS}
Environment=VAPOR_DBHOST=${VAPOR_DBHOST}
Environment=VAPOR_DBNAME=${VAPOR_DBNAME}
ExecStart=${VAPORMAP_PATH}/gunicorn wsgi:app \
  --bind 127.0.0.1:${VAPORMAP_API_PORT} \
  --access-logfile /var/log/vapormap/gunicorn-access.log \
  --error-logfile  /var/log/vapormap/gunicorn-error.log

[Install]
WantedBy=multi-user.target
```

Générer et activer :

```bash
export VAPORMAP_USER="app-vapormap"  VAPORMAP_GROUP="app-vapormap"
export VAPORMAP_DIR="/home/app-vapormap/vapormap-prod/api"
export VAPORMAP_PATH="/home/app-vapormap/vapormap-prod/venv/bin"
export VAPORMAP_API_PORT="5001"

envsubst < app/api-systemd.conf.template \
  | sudo tee /etc/systemd/system/vapormap-api.service

sudo systemctl daemon-reload
sudo systemctl enable --now vapormap-api
sudo systemctl status vapormap-api
```

### 5. Configuration Nginx

```nginx
server {
    listen 8000;
    server_name 0.0.0.0;
    root /home/app-vapormap/vapormap-prod/frontend/html;

    location = /favicon.ico { access_log off; log_not_found off; }

    # SPA frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API → Gunicorn (interface locale uniquement)
    location /api/ {
        proxy_pass         http://127.0.0.1:5001/api/;
        proxy_set_header   Host              $http_host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_redirect     off;
    }

    location /geojson {
        proxy_pass         http://127.0.0.1:5001/geojson;
        proxy_set_header   Host $http_host;
    }
}
```

Activer et recharger :

```bash
sudo ln -s /etc/nginx/sites-available/vapormap /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 6. Validation finale

```bash
# Tester l'API
curl http://localhost:5001/api/points/

# Tester via Nginx
curl http://localhost:8000/api/points/

# Vérifier les logs
sudo journalctl -u vapormap-api -f
sudo tail -f /var/log/vapormap/gunicorn-access.log
```

## Problème rencontré — config.json vide

Le frontend communiquait avec `{ "apiUrl": "http://:" }` car les variables d'environnement n'étaient pas définies avant `envsubst`.

**Solution :**

```bash
export VAPORMAP_BACKEND_HOST="localhost"
export VAPORMAP_BACKEND_PORT="5001"
envsubst < config.json.template \
  > /home/app-vapormap/vapormap-prod/frontend/html/config.json
```

## Points clés retenus

- **Isolation réseau** : Gunicorn écoute sur `127.0.0.1:5001` (non exposé) → seul Nginx est public.
- **SystemD** : redémarrage automatique au boot, logs centralisés via `journalctl`.
- **envsubst** : injecte des variables shell dans des fichiers de config template.
- **Nginx** : agit comme reverse proxy et CDN pour les assets statiques.
- Ce pattern **Nginx + Gunicorn + Flask** est standard dans l'industrie pour les apps Python.

## Résumé

| Aspect | Solution |
|--------|---------|
| Accès public | Nginx port 8000 |
| API Python | Gunicorn sur 127.0.0.1:5001 |
| Base de données | MariaDB (db_vapormap) |
| Démarrage auto | SystemD (vapormap-api.service) |
| Config dynamique | envsubst sur templates |
