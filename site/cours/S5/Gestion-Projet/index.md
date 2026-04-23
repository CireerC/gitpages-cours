---
layout: course
title: "Gestion de projet"
semestre: "S5"
type_cours: "tronc commun"
tags: ["gestion de projet", "WBS", "planning", "méthodes"]
---

## Introduction

Ce cours couvre les fondamentaux de la gestion de projet — méthodes d'organisation, outils de planification et suivi de l'avancement. Les concepts abordés sont applicables aussi bien aux projets informatiques qu'industriels.

## Qu'est-ce qu'un projet ?

Un **projet** est un ensemble d'activités coordonnées, avec :
- Un **objectif** défini (livrable, résultat attendu)
- Des **ressources** limitées (temps, budget, équipe)
- Un **début** et une **fin** clairement définis
- Des **contraintes** (délais, coûts, qualité)

## Le triangle de la gestion de projet

$$\text{Qualité} = f(\text{Délais}, \text{Coûts}, \text{Périmètre})$$

Modifier l'un des trois paramètres impacte nécessairement les autres.

## WBS — Work Breakdown Structure

Le **WBS** (ou **OBS** en français — Organigramme des Tâches) décompose le projet en tâches élémentaires organisées hiérarchiquement.

```
Projet
├── Phase 1 : Analyse
│   ├── 1.1 Recueil des besoins
│   └── 1.2 Rédaction du cahier des charges
├── Phase 2 : Développement
│   ├── 2.1 Développement backend
│   └── 2.2 Développement frontend
└── Phase 3 : Tests & Livraison
    ├── 3.1 Tests unitaires
    └── 3.2 Recette et déploiement
```

**Règle des 100%** : le WBS doit couvrir **l'intégralité** du périmètre projet — ni plus, ni moins.

## Planification

### Diagramme de Gantt

Représentation temporelle des tâches sur un calendrier — chaque tâche est une barre dont la longueur représente sa durée.

| Tâche | Durée | Semaine 1 | Semaine 2 | Semaine 3 |
|-------|-------|-----------|-----------|-----------|
| Analyse | 1 sem | ████ | | |
| Développement | 2 sem | | ████████ | |
| Tests | 1 sem | | | ████ |

### Chemin critique

La séquence de tâches dont le retard affecte directement la date de fin du projet. Identifier le chemin critique permet de concentrer les efforts sur les tâches à risque.

## Méthodes de management

### Méthode en cascade (Waterfall)

Approche séquentielle — chaque phase est complétée avant de passer à la suivante. Adaptée aux projets aux exigences stables et bien définies.

### Méthodes Agile (Scrum, Kanban)

Approche itérative — le projet est découpé en **sprints** courts (1-4 semaines). Adaptée aux projets dont les exigences évoluent.

**Rôles Scrum :**
- **Product Owner** — définit les priorités (backlog)
- **Scrum Master** — facilite le processus, lève les obstacles
- **Équipe de développement** — réalise les tâches

## Gestion des risques

| Étape | Description |
|-------|-------------|
| **Identifier** | Lister tous les risques potentiels |
| **Évaluer** | Probabilité × Impact |
| **Traiter** | Éviter, réduire, transférer ou accepter |
| **Surveiller** | Suivi continu tout au long du projet |

## GitLab pour la gestion de projet

GitLab intègre des outils de gestion de projet directement dans le dépôt de code :
- **Issues** : tâches et bugs
- **Milestones** : jalons (phases du projet)
- **Boards** : tableau Kanban
- **CI/CD** : automatisation des tests et déploiements

## Résumé

- Le WBS structure le périmètre projet — indispensable avant tout planning.
- Le diagramme de Gantt visualise la chronologie — identifier le chemin critique.
- Les méthodes Agile s'adaptent mieux à l'incertitude ; Waterfall convient aux projets stables.
- La gestion des risques est continue tout au long du projet.

## Références

- Cours Gestion de Projet, S5 2024-2025
- Fichiers source : `Management cours 1.pdf`, `TP WBS.pptx`
- Ressource : `Gérer un projet avec Gitlab.pdf`
