---
layout: course
title: "Projets S5 — Récapitulatif"
semestre: "S5"
type_cours: "projet"
tags: ["SAE", "bash", "IoT", "aide IT", "embarqué"]
---

## Introduction

Cette page regroupe les différents projets réalisés durant le S5, en dehors des projets dédiés (Design Sprint, DATACUP, Nuit de l'Info, SAE IoT). Chaque projet correspond à une mise en pratique concrète des enseignements du semestre.

## Projet SAE — Analyse de séries temporelles

**Sujet** : Acquisition et analyse de données capteurs IoT, compression et prévision.

**Fichiers** : `sujet_3A_SAE.pdf`, `arma.pdf`, `compression.pdf`, `timeseries_analysis.ipynb`

**Objectifs** :
- Comprendre les méthodes d'analyse de séries temporelles (ARIMA)
- Implémenter des algorithmes de compression pour systèmes embarqués contraints
- Mettre en place une pipeline complète : capteur → transmission → analyse

## Projet Bash — Météo et Pokémon

**Sujet** : Écrire des scripts Bash pour traiter des données réelles.

**Deux exercices** :

1. **Script Météo** (`meteo.sh`) — récupérer et afficher des données météorologiques depuis une API ou un fichier local.

2. **Analyse Pokémon** (`Pokemon.csv`) — traitement d'un CSV contenant les statistiques de tous les Pokémon : filtrage par type, tri par statistique, affichage formaté.

```bash
# Exemple : lister les 10 Pokémons de type Feu les plus rapides
grep "Fire" Pokemon.csv | sort -t',' -k7 -rn | head -10
```

**Fichiers** : `Projet_newsur_meteo.pdf`, `Projet_pokemon.pdf`, `meteo.sh`, `Pokemon.csv`

## Projet Geno64 — Système embarqué LoRa

**Sujet** : Développement d'un système de communication LoRa sur microcontrôleur.

**Fichiers** :
- `soutenance_diapo.pdf` — présentation de soutenance
- `diapo.md` — notes de préparation
- `test.ipynb` — notebook de test des données
- Librairies STM32 : `tour_otaa_pm.tgz`, `B-L072Z-LRWAN1_tour_int_PA0.zip`

**Contenu technique** :
- Configuration d'une liaison LoRa en mode OTAA (Over The Air Activation)
- Transmission de données depuis un capteur vers une passerelle
- Analyse des paquets reçus

## Projet Aide IT — Gestion de projet informatique

**Sujet** : Conduire un projet d'assistance informatique en appliquant une démarche projet formelle.

**Livrables** :
- **Cahier des charges** : définition des besoins, périmètre, contraintes
- **Veille technologique** : `Veille_Techno_03.pdf`
- **Gestion avec GitLab** : utilisation des issues, milestones et CI/CD

**Compétences** :
- Rédaction d'un cahier des charges
- Planification et suivi de projet
- Utilisation de GitLab comme outil de gestion

## Bilan des projets S5

| Projet | Domaine | Compétences clés |
|--------|---------|-----------------|
| SAE Séries temporelles | Data/IoT | ARIMA, Python, capteurs |
| Bash Météo/Pokémon | Scripting | Bash, traitement de fichiers |
| Geno64 LoRa | Embarqué | STM32, LoRaWAN, C |
| Aide IT | Gestion | Cahier des charges, GitLab |

## Références

- Fichiers source dans `PROJETTTT/`
- Sous-projets : `PROJET SAE/`, `Projet BASH 1/`, `Projet Geno64/`, `Projet aide IT/`
