---
layout: course
title: "Projet de Fin d'Études (PFE)"
semestre: "S8"
type_cours: "projet"
tags: ["PFE", "stage", "mémoire", "gestion de projet", "soutenance", "méthodologie", "Gantt", "risques"]
---

## Introduction

Le **Projet de Fin d'Études (PFE)** est le projet tuteuré de 6 mois qui clôture la formation d'ingénieur. Il se déroule en entreprise (stage ou alternance) et aboutit à un **mémoire technique** et une **soutenance** devant un jury. Ce document présente la méthodologie et les bonnes pratiques pour réussir son PFE.

---

## Trouver et cadrer son PFE

### Recherche du stage

| Canal | Conseils |
|-------|---------|
| **Réseau LinkedIn** | Optimiser profil, contacter directement les ingénieurs |
| **Job boards** | Welcome to the Jungle, Indeed, LinkedIn Jobs, Glassdoor |
| **Écoles partenaires** | Offres transmises par le bureau des stages |
| **Candidature spontanée** | Identifier l'entreprise cible, email personnalisé au manager |
| **Salons / Hackathons** | Forum entreprises, EWC, Nuit de l'Info |

### Convention de stage — Points clés

```
Éléments à vérifier :
✓ Durée : 6 mois (22 semaines minimum)
✓ Gratification : obligatoire (≥ 4,35 €/h en 2024 = ~667 €/mois)
✓ Sujet clairement défini (mission, livrables, objectifs)
✓ Tuteur entreprise identifié (ingénieur ou manager)
✓ Tuteur école assigné
✓ Confidentialité : clause si données sensibles
```

---

## Méthodes de gestion de projet

### Cahier des charges technique

```
1. CONTEXTE ET OBJECTIFS
   - Contexte entreprise et problématique
   - Objectif principal et objectifs secondaires
   - Périmètre (ce qui est inclus / exclu)

2. ÉTAT DE L'ART
   - Solutions existantes (benchmark)
   - Technologies disponibles
   - Justification des choix techniques

3. SPÉCIFICATIONS
   - Exigences fonctionnelles (ce que le système fait)
   - Exigences non fonctionnelles (performance, sécurité, maintenabilité)
   - Contraintes (techniques, budgétaires, temporelles)

4. ARCHITECTURE PROPOSÉE
   - Diagrammes (architecture, flux de données, BDD)

5. PLANNING ET LIVRABLES
   - Jalons, milestones
   - Livrables attendus

6. RISQUES ET PLAN D'ATTÉNUATION
```

### Diagramme de Gantt

```
Semaine  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24
Phase 1   ██████████
Analyse   ████████
Archi          ████
Démos               ██
Phase 2            ████████████████
Dev sprint 1       ████████
Dev sprint 2               ████████
Tests                              ████████
Phase 3                                    ████████████████████
Intégration                                ████████
Documentation                                      ████████████
Rapport                                                    ████████████
Soutenance                                                             ██
```

**Outils :** Microsoft Project, GanttProject (gratuit), Notion, Linear, Jira

### Matrice de risques

| Risque | Probabilité | Impact | Score | Mitigation |
|--------|-------------|--------|-------|-----------|
| Dépendance API tierce indisponible | Faible | Élevé | 3 | Mock API dès le début |
| Scope creep (élargissement du périmètre) | Élevé | Élevé | 9 | Revue hebdo avec tuteur |
| Retard technique (complexité sous-estimée) | Moyen | Élevé | 6 | Sprints avec buffer 20% |
| Perte de données (bug, crash) | Faible | Élevé | 3 | Backups quotidiens, Git |
| Maladie / absence prolongée | Faible | Moyen | 2 | Documentation en continu |

---

## Structure du mémoire de PFE

### Plan type (80-120 pages)

```
PAGE DE TITRE
RÉSUMÉ (FR + EN) — 1 page
REMERCIEMENTS — 1 page
TABLE DES MATIÈRES
LISTE DES FIGURES ET TABLEAUX
LISTE DES ABRÉVIATIONS

INTRODUCTION GÉNÉRALE (3-5 pages)
  - Contexte général et problématique
  - Objectifs du PFE
  - Structure du mémoire

CHAPITRE 1 — CONTEXTE ET ÉTAT DE L'ART (15-25 pages)
  1.1 Présentation de l'entreprise et de l'équipe
  1.2 Problématique métier
  1.3 Technologies existantes (benchmark)
  1.4 Positionnement et choix technologiques

CHAPITRE 2 — CONCEPTION ET ARCHITECTURE (20-30 pages)
  2.1 Analyse des besoins (spécifications)
  2.2 Architecture globale du système
  2.3 Modèle de données
  2.4 Choix d'architecture et justifications

CHAPITRE 3 — RÉALISATION (25-35 pages)
  3.1 Environnement de développement
  3.2 Développement des composants principaux
  3.3 Points techniques saillants
  3.4 Tests et validation

CHAPITRE 4 — RÉSULTATS ET DISCUSSION (10-15 pages)
  4.1 Résultats obtenus (métriques, benchmarks)
  4.2 Limites et difficultés rencontrées
  4.3 Perspectives d'amélioration

CONCLUSION GÉNÉRALE (3-5 pages)
  - Bilan du projet
  - Bilan personnel (compétences développées)
  - Ouvertures

BIBLIOGRAPHIE
ANNEXES
  - Code source (extraits clés)
  - Diagrammes détaillés
  - Manuel d'installation/utilisation
```

---

## Rédaction du mémoire

### Bonnes pratiques

```
✓ Écrire régulièrement (ne pas tout laisser à la fin)
✓ Un paragraphe = une idée
✓ Toujours justifier les choix techniques (pourquoi X plutôt que Y)
✓ Inclure des schémas, diagrammes, captures d'écran
✓ Numéroter figures et tableaux avec légendes
✓ Citer vos sources (IEEE, APA, ou Vancouver)
✓ Relecture orthographique (Antidote, LanguageTool)
✓ Faire relire par le tuteur avant la version finale
```

### Citations et bibliographie (format IEEE)

```
Dans le texte : [1], [2], [3]

Bibliographie :
[1] A. Auteur, B. Auteur, "Titre de l'article," Nom du journal,
    vol. X, no. Y, pp. Z–Z, Année.

[2] A. Auteur, Titre du livre, Éditeur, Année.

[3] A. Auteur. (Année). Titre de la page. [En ligne].
    Disponible : URL [Accédé : date].
```

---

## La soutenance

### Format type

```
Durée totale : 45 min – 1h
  └── Présentation : 20-25 min
  └── Questions jury : 20-30 min

Composition du jury :
  - 1 enseignant-chercheur (tuteur école ou externe)
  - 1 responsable pédagogique
  - 1 représentant entreprise (tuteur industriel)
  (parfois : 1 expert externe au domaine)
```

### Structure de la présentation (20 min)

| Partie | Durée | Contenu |
|--------|-------|---------|
| **Introduction** | 2 min | Accroche, contexte, plan |
| **Contexte & problématique** | 3 min | Entreprise, enjeux, objectifs |
| **État de l'art** | 3 min | Existant, benchmark, positionnement |
| **Conception** | 4 min | Architecture, choix techniques |
| **Réalisation** | 5 min | Démo ou résultats, points clés |
| **Conclusion** | 2 min | Bilan, perspectives, apports personnels |
| **Questions** | — | — |

### Conseils présentation

```
Supports visuels :
  ✓ 1 idée principale par slide
  ✓ Peu de texte, beaucoup de schémas/résultats
  ✓ Police ≥ 20pt
  ✓ Slides numérotées
  ✗ Éviter les longues listes à puces
  ✗ Pas de code illisible (extraire seulement l'essentiel)

Oral :
  ✓ Structurer avec transitions explicites ("Maintenant que...")
  ✓ Regarder le jury, pas les slides
  ✓ Répéter à voix haute 2-3 fois
  ✓ Préparer une démo offline (Murphy's law)
  ✓ Anticiper les questions (voir section suivante)

Timing :
  ✓ Répéter avec chronomètre
  ✓ Prévoir 10% de marge (ne pas être coupé)
```

### Questions types du jury

```
Techniques :
  → "Pourquoi avoir choisi React plutôt que Vue ?"
  → "Quelles sont les performances de votre solution ?"
  → "Comment avez-vous géré la sécurité ?"
  → "Comment votre architecture passe-t-elle à l'échelle ?"

Méthodologie :
  → "Comment avez-vous géré les priorités ?"
  → "Quelle aurait été votre approche si vous aviez eu 3 mois de plus ?"
  → "Quels ont été les principaux obstacles ?"

Personnel :
  → "Qu'avez-vous appris de plus important ?"
  → "Quelles compétences avez-vous développées ?"
  → "Vous voyez-vous rester dans cette entreprise ?"
```

---

## Grille d'évaluation

| Critère | Coefficient | Évalué par |
|---------|------------|-----------|
| Qualité technique du travail | 30% | Jury + tuteur entreprise |
| Mémoire (rédaction, structure) | 25% | Jury |
| Présentation orale | 20% | Jury |
| Gestion du projet | 15% | Tuteur entreprise |
| Apport à l'entreprise | 10% | Tuteur entreprise |

---

## Compétences développées

### Hard skills à valoriser

```
✓ Technologie principale (langages, frameworks, outils)
✓ Méthodologie (Agile/Scrum, CI/CD, Git)
✓ Architecture logicielle / système
✓ Résolution de problèmes techniques complexes
✓ Tests et qualité
✓ Documentation technique
```

### Soft skills valorisées

```
✓ Autonomie et initiative
✓ Communication (réunions, écrits, soutenance)
✓ Gestion du temps et des priorités
✓ Adaptabilité (environnement professionnel)
✓ Esprit critique et remise en question
✓ Collaboration (équipe, stakeholders)
```
