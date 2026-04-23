---
layout: course
title: "Nuit de l'Info"
semestre: "S5"
type_cours: "projet"
tags: ["hackathon", "développement web", "équipe", "jeu vidéo"]
---

## Introduction

La **Nuit de l'Info** est un hackathon national annuel organisé en France. Les équipes d'étudiants disposent d'une nuit entière (de 17h30 jusqu'à 8h le lendemain) pour réaliser une application web autour d'un thème révélé le soir même.

## Édition S5 — Thème : Les Lapins Crétins

Le projet de l'équipe portait sur un **jeu vidéo inspiré des Lapins Crétins** (Ubisoft/Nickelodeon), avec deux concepts développés :

1. **Les Lapins Crétins et le Virus** — jeu d'action/défense
2. **Les Lapins Crétins et la Grande Inondation** — jeu de survie/stratégie lié au changement climatique

## Concept du jeu

### Scénario

Les Lapins Crétins, connus pour leur comportement chaotique et absurde, doivent faire face à une catastrophe environnementale (inondation liée au réchauffement climatique). Le joueur guide les Lapins à travers des obstacles pour les sauver.

**Lien avec les défis de la Nuit de l'Info :**
- Sensibilisation au changement climatique
- Gameplay addictif et accessible

### Assets visuels générés (IA)

Le projet utilisait des images générées par DALL-E pour les sprites et l'interface :
- Personnages Lapins Crétins dans différentes poses
- Décors d'inondation et de désastre
- Interface utilisateur colorée et dynamique

## Stack technique

| Composant | Technologie |
|-----------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Canvas / Jeu | Canvas API ou Phaser.js |
| Génération d'assets | DALL-E (OpenAI) |
| Hébergement | GitHub Pages / Netlify |

## Organisation d'un hackathon

### Conseils pour réussir une nuit de code

1. **Définir le périmètre rapidement** — ne pas viser trop large, avoir un MVP fonctionnel en priorité
2. **Diviser les tâches** — frontend / backend / design / gestion de projet
3. **Commits réguliers** — ne pas travailler des heures sans sauvegarder
4. **Gérer l'énergie** — pauses courtes et régulières, caféine avec modération
5. **Présenter avec un démo live** — les juges veulent voir quelque chose qui marche

### Workflow Git en équipe

```bash
# Chaque membre sur sa branche
git checkout -b feature/mon-composant

# Committer souvent
git add .
git commit -m "feat: ajouter le mouvement du personnage"

# Intégrer régulièrement
git checkout main
git merge feature/mon-composant
```

## Game Design Document (GDD)

Le GDD structurait le projet :

- **Concept** : description en une phrase
- **Mécaniques** : règles du jeu, contrôles
- **Niveau** : progression, obstacles, ennemis
- **Art direction** : style visuel, palette de couleurs
- **Son** : musique d'ambiance, effets sonores

## Compétences développées

- Développement web rapide sous pression
- Collaboration en équipe sur Git
- Gestion des priorités et du temps
- Créativité et adaptabilité au thème révélé

## Références

- Fichiers projet : `Les Lapins crétins et le Virus.pdf`, `Les Lapins crétins la grande inondation2.pdf`
- Game Design Document : `Gumtale_GDD_3.pdf`
- Site officiel Nuit de l'Info : `https://www.nuitdelinfo.com/`
