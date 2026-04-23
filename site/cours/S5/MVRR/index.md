---
layout: course
title: "Informatique quantique — MVRR"
semestre: "S5"
type_cours: "recherche"
tags: ["quantique", "qubits", "algorithmes quantiques", "bibliographie"]
---

## Introduction

Le cours MVRR (Mise en œuvre et Valorisation des Recherches et Ressources) de S5 portait sur l'**informatique quantique**. L'objectif était de réaliser une revue bibliographique structurée sur ce domaine émergent.

## Qu'est-ce que l'informatique quantique ?

L'informatique quantique exploite les principes de la mécanique quantique — superposition et intrication — pour effectuer des calculs impossibles ou prohibitivement lents sur un ordinateur classique.

### Différences clés : classique vs quantique

| Aspect | Classique | Quantique |
|--------|-----------|----------|
| Unité de base | Bit (0 ou 1) | Qubit (0, 1 ou superposition) |
| État | Déterministe | Probabiliste |
| Calcul | Séquentiel ou parallèle | Parallélisme massif (quantique) |
| Erreurs | Robuste | Très sensible au bruit (décoherence) |

## Concepts fondamentaux

### Qubit

Un **qubit** est l'unité de base de l'information quantique. Contrairement à un bit classique (0 ou 1), un qubit peut être dans une **superposition** des deux états :

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

où $|\alpha|^2 + |\beta|^2 = 1$ (normalisation).

La mesure **effondre** la superposition : on obtient $0$ avec probabilité $|\alpha|^2$ et $1$ avec probabilité $|\beta|^2$.

### Intrication quantique

Deux qubits **intriqués** forment un système dont les états ne peuvent pas être décrits indépendamment. La mesure d'un qubit affecte instantanément l'autre, quelle que soit la distance.

État de Bell (exemple d'intrication maximale) :

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

### Décoherence

La **décoherence** est la perte des propriétés quantiques d'un qubit par interaction avec l'environnement. C'est le principal obstacle à la construction d'ordinateurs quantiques pratiques.

## Algorithmes quantiques notables

| Algorithme | Auteur | Application | Avantage |
|-----------|--------|-------------|---------|
| **Shor** | Peter Shor (1994) | Factorisation | Exponentiel vs polynomial |
| **Grover** | Lov Grover (1996) | Recherche dans une BD non triée | $O(\sqrt{N})$ vs $O(N)$ |
| **Deutsch-Jozsa** | Deutsch & Jozsa (1992) | Parité d'une fonction | Exponentiel |
| **QAOA** | Farhi et al. (2014) | Optimisation combinatoire | En cours d'évaluation |

### Algorithme de Grover

Recherche dans une liste non triée de $N$ éléments en $O(\sqrt{N})$ opérations, contre $O(N)$ en classique.

$$O(\sqrt{N}) \text{ vs } O(N)$$

Pour $N = 10^6$ : 1000 opérations quantiques vs 1 000 000 classiques.

### Algorithme de Shor

Factorise un entier $N$ en temps polynomial $O((\log N)^3)$, menaçant directement le chiffrement RSA qui repose sur la difficulté de la factorisation.

## Matériel quantique

| Technologie | Entreprise | Avantages | Défis |
|------------|-----------|-----------|-------|
| Qubits supraconducteurs | IBM, Google | Fabriquables en masse | Températures cryogéniques (~15 mK) |
| Qubits ioniques | IonQ, Honeywell | Longue cohérence | Lents, scalabilité difficile |
| Photons | Xanadu | Température ambiante | Difficultés d'intrication |
| Silicium quantique | Intel | Compatible CMOS | Recherche précoce |

## Applications envisagées

- **Cryptographie** — Chiffrement post-quantique (NIST standardise des algorithmes résistants)
- **Chimie quantique** — Simulation moléculaire pour la découverte de médicaments
- **Optimisation** — Logistique, portefeuilles financiers, réseaux
- **Machine learning quantique** — Accélération de certains algorithmes ML

## Résumé

- Un qubit peut être en superposition — parallélisme quantique massif.
- L'intrication permet des corrélations non locales — ressource centrale des algorithmes quantiques.
- L'algorithme de Shor menace le chiffrement RSA actuel → urgence du chiffrement post-quantique.
- La décoherence reste le principal défi technique — les ordinateurs quantiques actuels sont "bruyants" (NISQ : Noisy Intermediate-Scale Quantum).

## Références

- Rapport bibliographique : `Ref Biblio Informatique Quantique FORSTER Eric 3AIT.pdf`
- Document de travail : `mvrr inf q.odt`
- IBM Quantum : `https://quantum.ibm.com/`
- NIST Post-Quantum Cryptography : `https://csrc.nist.gov/projects/post-quantum-cryptography`
