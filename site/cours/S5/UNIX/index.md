---
layout: course
title: "Systèmes d'exploitation — UNIX"
semestre: "S5"
type_cours: "dev"
tags: ["Linux", "SystemD", "Docker", "Flask", "production"]
---

## Introduction

Ce cours aborde l'administration d'un système GNU/Linux sans interface graphique, dans un contexte de mise en production d'applications web. On y étudie SystemD, la virtualisation, Docker et le déploiement d'une API Flask.

## SystemD — Gestionnaire de services

SystemD (anciennement `init.d`) est le premier processus lancé par le noyau Linux. Il orchestre le démarrage de tous les services dans le bon ordre.

### Pourquoi SystemD ?

Sans gestionnaire de services, il faudrait lancer chaque processus à la main. SystemD garantit que les dépendances sont respectées — par exemple, le serveur réseau est opérationnel **avant** le lancement de l'interface graphique ou d'une application web.

### Structure d'un fichier unit

```ini
[Unit]
Description=Service de démo — write-log
After=network.target

[Service]
ExecStart=/usr/local/bin/demo-logs.sh

[Install]
WantedBy=multi-user.target
```

**Champs clés :**

- `After` : ce service démarre **après** l'unité listée.
- `ExecStart` : commande exécutée au démarrage du service.
- `WantedBy=multi-user.target` : active le service en mode multi-utilisateur (serveur standard).

### Commandes SystemD essentielles

```bash
systemctl status mon-service    # Afficher l'état
systemctl start mon-service     # Démarrer
systemctl stop mon-service      # Arrêter
systemctl enable mon-service    # Activer au démarrage
systemctl disable mon-service   # Désactiver au démarrage
journalctl -u mon-service       # Consulter les logs
```

## Virtualisation et conteneurisation

### Machines Virtuelles (VM)

Une VM émule un ordinateur complet — CPU, RAM, stockage et **son propre noyau OS**. L'**hyperviseur** (VMware vSphere, VirtualBox) gère plusieurs VM sur un seul hôte physique.

- **Avantage** : isolation totale.
- **Inconvénient** : lourd, lent à démarrer, consomme beaucoup de ressources.

### Conteneurs Docker

Un conteneur Docker **partage le noyau de l'hôte** — il n'y a pas de couche de virtualisation complète. Le conteneur embarque uniquement les binaires et bibliothèques nécessaires à l'application.

```
VM                          Docker
┌─────────────────────┐    ┌─────────────────────┐
│ App A │ App B        │    │ App A  │  App B     │
│ OS A  │ OS B         │    │ Libs A │  Libs B    │
│ Hyperviseur          │    │ Docker Engine       │
│ Système hôte         │    │ OS hôte (1 noyau)  │
└─────────────────────┘    └─────────────────────┘
```

> **Attention** : Docker ne fonctionne pas nativement sur Windows sans WSL2, car il a besoin d'un noyau Linux.

## Déploiement de l'application VaporMap

### Architecture

VaporMap est une application de relevés géographiques composée de deux services :

- **Backend API** — Flask sur le port `5000`
- **Frontend** — serveur HTTP Python sur le port `8000`

Le navigateur du client doit accéder **directement** aux deux ports — c'est le navigateur, pas le frontend, qui appelle l'API.

### Mode développement

```bash
# Prérequis
sudo apt -y install python3 python3-pip python3-venv git

# Cloner le projet
git clone https://gitlab.com/vapormap/vapormap-src.git vapormap-dev
cd vapormap-dev

# Créer l'environnement virtuel Python
python3 -m venv --prompt vapormap-dev ./venv
source venv/activate

# Installer les dépendances
pip install -r api/requirements/development.txt

# Créer la base SQLite et lancer l'API
export SETTINGS_FILE="development"
cd api/app
flask db upgrade
flask run -h 0.0.0.0 -p 5000
```

**Base de données en développement** : SQLite3 (fichier local `db.sqlite3`) — aucun serveur nécessaire.

### Mode production

En production, on remplace SQLite par **MariaDB/MySQL** et le serveur de développement Flask par **Gunicorn**.

```bash
# Dépendances production supplémentaires
pip install mysqlclient gunicorn

# Lancer Gunicorn comme service
systemctl start vapormap-api
```

**Dépendances complètes (production) :**

```
Flask==3.0.3
Flask-Migrate, Flask-RESTful, Flask-Cors
SQLAlchemy, Flask-SQLAlchemy
marshmallow, flask-marshmallow, marshmallow-sqlalchemy
geojson
mysqlclient       ← ajouté en production
Gunicorn          ← remplace le serveur de dev Flask
```

### Configuration du frontend

```bash
cd frontend/
export VAPORMAP_BACKEND_HOST=<IP_PUBLIQUE>
export VAPORMAP_BACKEND_PORT=5000
envsubst '${VAPORMAP_BACKEND_HOST},${VAPORMAP_BACKEND_PORT}' \
    < config.json.template > html/config.json
```

> Si la machine est locale, utiliser `localhost`. Si distante (VM cloud), utiliser l'adresse IP publique.

### Redirections de ports (VirtualBox)

Pour accéder aux services depuis la machine hôte :

| Service | Port VM | Port hôte |
|---------|---------|-----------|
| API Flask | 5000 | 5000 |
| Frontend | 8000 | 8000 |

## API REST

Une **API REST** expose des ressources via des endpoints HTTP.

| Méthode HTTP | Action CRUD | Description |
|-------------|-------------|-------------|
| `GET` | Read | Lire une ressource |
| `POST` | Create | Créer une ressource |
| `PUT` | Update | Mettre à jour |
| `DELETE` | Delete | Supprimer |

VaporMap expose :

- `GET /api/points/?format=json` → liste des relevés
- `POST /api/points/` → ajouter un relevé
- `GET /geojson` → export GeoJSON pour la carte

## Résumé

- SystemD orchestre les services Linux — toujours déployer une application web en tant que service.
- Docker isole l'environnement d'exécution sans la surcharge d'une VM complète.
- Ne jamais utiliser le serveur de développement Flask en production — utiliser Gunicorn.
- La gestion des configurations sensibles se fait via des variables d'environnement (`envsubst`).

## Références

- Cours magistraux E. Braux, S5 2024-2025
- Fichiers : `Cours.md`, `developpement.md`, `TP VaporMap production.md`
- Dépôt VaporMap : `3a-vapormap-prod-forster-fontaine/`
- Labs : `https://vapormap.gitlab.io/lab-prod-linux/`
