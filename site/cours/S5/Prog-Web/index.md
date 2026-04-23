---
layout: course
title: "Programmation Web & API REST"
semestre: "S5"
type_cours: "dev"
tags: ["REST", "HTTP", "API", "web", "concurrence"]
---

## Introduction

Ce cours aborde les fondamentaux du développement web côté serveur — architecture distribuée, protocole HTTP, conception d'API REST et gestion de la concurrence. L'objectif est de savoir concevoir et documenter une API web qui expose des ressources à d'autres applications ou à un frontend.

## Architecture distribuée

### Local vs réparti

- **Local** : une seule machine, un seul processus. Exemple : un fichier Word édité en solo.
- **Réparti** : plusieurs machines communiquent. Exemple : Google Docs — plusieurs utilisateurs éditent en simultané depuis des endroits différents.

### Séquentiel vs parallèle

- **Séquentiel** : chaque action dépend de la précédente — les tâches s'enchaînent.
- **Parallèle** : plusieurs tâches s'exécutent simultanément — gain de temps si les ressources le permettent.

### Concurrence

La **concurrence** survient lorsque plusieurs actions parallèles doivent accéder à une même ressource partagée. Il faut alors une **coordination temporelle** pour éviter les conflits.

> **Exemple** : deux requêtes HTTP qui tentent simultanément d'écrire dans la même ligne d'une base de données. Sans verrou, les données peuvent être corrompues.

## Le protocole HTTP

HTTP (*HyperText Transfer Protocol*) est le protocole de communication de base du Web. Il fonctionne en mode **requête / réponse** sur TCP.

### Méthodes HTTP (verbes)

| Méthode | Action CRUD | Idempotent | Description |
|---------|-------------|-----------|-------------|
| `GET` | Read | Oui | Obtenir une ressource à l'URL spécifiée |
| `POST` | Create | Non | Envoyer des données pour créer une ressource |
| `PUT` | Update | Oui | Mettre à jour une ressource existante |
| `DELETE` | Delete | Oui | Supprimer une ressource |
| `PATCH` | Update partiel | Non | Modifier partiellement une ressource |

> **Idempotent** : appeler la requête plusieurs fois donne le même résultat qu'une seule fois.

### Codes de statut HTTP

| Code | Catégorie | Exemple |
|------|-----------|---------|
| 2xx | Succès | `200 OK`, `201 Created` |
| 3xx | Redirection | `301 Moved Permanently` |
| 4xx | Erreur client | `400 Bad Request`, `404 Not Found`, `401 Unauthorized` |
| 5xx | Erreur serveur | `500 Internal Server Error` |

## Architecture REST

Une **API REST** (*Representational State Transfer*) est un style architectural pour concevoir des services web. Elle repose sur :

1. **Ressources identifiées par des URLs** — `/users/42`, `/products/`, `/orders/1/items/`
2. **Méthodes HTTP standard** — GET, POST, PUT, DELETE
3. **Sans état (stateless)** — chaque requête est indépendante, le serveur ne retient pas de contexte entre deux requêtes
4. **Format de représentation** — généralement JSON ou XML

### Exemple d'API REST

```
GET    /api/points/         → liste tous les relevés (JSON)
POST   /api/points/         → crée un nouveau relevé
GET    /api/points/42/      → récupère le relevé n°42
PUT    /api/points/42/      → met à jour le relevé n°42
DELETE /api/points/42/      → supprime le relevé n°42
GET    /geojson             → export GeoJSON de tous les relevés
```

### Format de configuration : YAML

YAML est souvent utilisé pour les fichiers de configuration des microservices.

```yaml
server:
  host: "0.0.0.0"
  port: 5000
database:
  engine: sqlite
  path: "./data/db.sqlite3"
```

## Microservices et interconnexion

Les **microservices** sont des applications indépendantes qui communiquent entre eux via des API. Chaque microservice est responsable d'une seule fonctionnalité.

- Une API REST permet à des microservices de se **connecter et s'appeler mutuellement**.
- La documentation de l'API (Swagger/OpenAPI) décrit : quoi mettre dans l'URL, quels paramètres envoyer, ce qu'on obtient en réponse.

## Mise en pratique — Flask (Python)

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/points/', methods=['GET'])
def get_points():
    return jsonify([])  # retourne une liste vide

@app.route('/api/points/', methods=['POST'])
def create_point():
    data = request.json
    # traiter data...
    return jsonify(data), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## Résumé

- HTTP est un protocole requête/réponse — GET lit, POST crée, PUT met à jour, DELETE supprime.
- REST normalise la façon d'exposer des ressources — URL claire + méthode HTTP = action compréhensible.
- La concurrence est un défi clé dans les systèmes distribués — toujours protéger les ressources partagées.
- YAML est préféré à JSON pour la configuration car plus lisible.

## Références

- Cours magistraux Programmation Web, S5 2024-2025
- Fichier source : `Cours.md`, `prog_web/3ait_web_example/app.py`
- Documentation Flask : `https://flask.palletsprojects.com/`
