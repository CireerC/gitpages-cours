---
layout: course
title: "Mathématiques — Outils S5"
semestre: "S5"
type_cours: "tronc commun"
tags: ["algèbre linéaire", "matrices", "diagonalisation", "systèmes linéaires"]
---

## Introduction

Ce cours couvre les outils mathématiques fondamentaux utilisés en ingénierie et en informatique — calcul matriciel, systèmes d'équations linéaires, espaces vectoriels, valeurs propres et diagonalisation.

## Algèbre linéaire — Rappels

### Matrices

Une matrice $A$ de taille $m \times n$ contient $m$ lignes et $n$ colonnes.

**Opérations fondamentales :**

$$A + B \text{ (addition, même taille)} \qquad \lambda A \text{ (produit scalaire)}$$

**Produit matriciel :** $(AB)_{ij} = \sum_k A_{ik} B_{kj}$

> Le produit matriciel n'est **pas commutatif** : $AB \neq BA$ en général.

**Transposée :** $(A^T)_{ij} = A_{ji}$

**Inverse :** $A^{-1}$ existe si et seulement si $\det(A) \neq 0$.

### Déterminant

Pour une matrice $2 \times 2$ :

$$\det \begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

### Trace

$$\text{tr}(A) = \sum_{i} A_{ii}$$

## Systèmes d'équations linéaires

Un système linéaire s'écrit sous forme matricielle :

$$A \mathbf{x} = \mathbf{b}$$

### Méthodes de résolution

1. **Élimination de Gauss (pivot)** — réduction à une forme triangulaire.
2. **Décomposition LU** — factoriser $A = LU$ pour résoudre efficacement plusieurs systèmes.
3. **Méthode de Cramer** — utiliser les déterminants (efficace uniquement pour les petits systèmes).

```
Algorithme de Gauss :
1. Former la matrice augmentée [A | b]
2. Appliquer les opérations élémentaires sur les lignes
3. Remonter (back-substitution)
```

## Espaces vectoriels

Un **espace vectoriel** $E$ est un ensemble muni d'une addition et d'une multiplication scalaire vérifiant les axiomes habituels (associativité, distributivité, élément neutre, etc.).

### Notions clés

| Notion | Définition |
|--------|-----------|
| **Sous-espace vectoriel (SEV)** | Sous-ensemble de $E$ stable par addition et multiplication scalaire |
| **Famille libre** | Aucun vecteur n'est combinaison linéaire des autres |
| **Famille génératrice** | Tout vecteur de $E$ est combinaison linéaire des vecteurs de la famille |
| **Base** | Famille libre ET génératrice |
| **Dimension** | Nombre de vecteurs dans une base |

## Valeurs propres et vecteurs propres

Un scalaire $\lambda$ est **valeur propre** de $A$ si :

$$A \mathbf{v} = \lambda \mathbf{v} \qquad \text{pour un vecteur } \mathbf{v} \neq \mathbf{0}$$

Le vecteur $\mathbf{v}$ est le **vecteur propre** associé.

**Calcul :**

$$\det(A - \lambda I) = 0 \quad \text{(polynôme caractéristique)}$$

### Diagonalisation

$A$ est **diagonalisable** si elle admet $n$ vecteurs propres linéairement indépendants. Dans ce cas :

$$A = P D P^{-1}$$

où $D$ est la matrice diagonale des valeurs propres et $P$ la matrice des vecteurs propres.

**Conditions nécessaires :**
- $A$ est symétrique réelle → toujours diagonalisable (théorème spectral).
- $A$ admet $n$ valeurs propres distinctes → toujours diagonalisable.

## Applications pratiques

### En informatique / IA

- **Analyse en Composantes Principales (ACP)** — diagonalisation de la matrice de covariance pour réduire la dimensionnalité.
- **PageRank (Google)** — calcul du vecteur propre dominant d'une matrice de transition.
- **Transformées (FFT)** — repose sur des matrices de Vandermonde et des propriétés spectrales.

## Résumé

- Les matrices permettent de représenter et résoudre des systèmes linéaires de manière compacte.
- La diagonalisation simplifie le calcul de puissances de matrices $A^n = P D^n P^{-1}$.
- Valeurs propres et vecteurs propres sont au cœur de l'ACP, du PageRank et de nombreux algorithmes d'optimisation.

## Références

- Cours Outils Mathématiques S5, ESIROI 2024-2025
- Fichiers source : `S5_Outils_Mathematiques.pdf`, `CalculMatriciel.pdf`, `SystemesLineaires.pdf`, `matriceDiagonalisable.pdf`, `Fiche SEV-VP2425.pdf`
