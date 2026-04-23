---
layout: course
title: "Data Mining"
semestre: "S6"
type_cours: "data"
tags: ["machine learning", "clustering", "K-means", "classification", "Python"]
---

## Introduction

Le **Data Mining** (exploration de données) est l'ensemble des techniques permettant d'analyser de grandes quantités de données pour y découvrir des tendances, des modèles cachés et des relations utiles.

Objectifs principaux :
- Trouver des liens entre les données
- Détecter des anomalies
- Faire des prédictions

## Pipeline d'un projet de Data Mining

```
Collecte des données → Prétraitement → Modélisation → Évaluation → Déploiement
```

1. **Collecte & compréhension** : comprendre ce que les données représentent, leur provenance et leur qualité.
2. **Prétraitement** : mettre les données au bon format, gérer les valeurs manquantes et aberrantes.
3. **Modélisation** : entraîner l'algorithme choisi.
4. **Évaluation** : mesurer les performances, ajuster les hyperparamètres ou changer de modèle si nécessaire.

## Types d'apprentissage

| Type | Description | Exemple |
|------|-------------|---------|
| **Supervisé** | Données étiquetées — l'algorithme apprend une fonction entrée → sortie | Classification, régression |
| **Non supervisé** | Pas d'étiquettes — trouver la structure dans les données | Clustering (K-means) |
| **Semi-supervisé** | Mélange de données étiquetées et non étiquetées | — |
| **Renforcement** | Système de récompenses — l'agent apprend par essai/erreur | Jeux, robotique |

## Apprentissage supervisé

### Classification vs Régression

- **Classification** : prédire une catégorie discrète (Oui/Non, rouge/vert/bleu).
- **Régression** : prédire une valeur continue (prix, température, durée).

### Features (variables d'entrée)

Les **features** sont les variables d'entrée qui ont potentiellement un impact sur la sortie. La sélection et l'ingénierie des features (*feature engineering*) sont cruciales pour la qualité du modèle.

## Clustering (apprentissage non supervisé)

Le clustering consiste à regrouper des points de données en **classes (clusters)** sans connaître a priori leur appartenance.

### K-means

L'algorithme **K-means** minimise la distance intra-classe autour de **k centroïdes**.

**Algorithme :**
1. Choisir $k$ centroïdes initiaux aléatoirement
2. Affecter chaque point au centroïde le plus proche
3. Recalculer chaque centroïde comme la moyenne des points de son cluster
4. Répéter jusqu'à convergence

**Exemple TD1 :**

$E = \{1, 2, 3, 10, 11, 12, 20, 21, 22\}$, $k = 3$

Centroïdes initiaux : $\mu_1^0 = 1$, $\mu_2^0 = 10$, $\mu_3^0 = 22$

Distance : $d(x, \mu) = |x - \mu|$

Après convergence :
- Cluster 1 : $\{1, 2, 3\}$ → centroïde $= 2$
- Cluster 2 : $\{10, 11, 12\}$ → centroïde $= 11$
- Cluster 3 : $\{20, 21, 22\}$ → centroïde $= 21$

**WSS (Within-Cluster Sum of Squares)** — mesure la compacité :

$$WSS(C) = \sum_i d^2(x_i, \mu_{c(i)})$$

**BSS (Between-Cluster Sum of Squares)** — mesure la séparation :

$$BSS(C) = \sum_j n_j \cdot d^2(\mu_j, \bar{x})$$

### Mesure de performance — Silhouette

Le **coefficient de silhouette** mesure la qualité du clustering :

$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$

où $a(i)$ est la distance intra-cluster et $b(i)$ la distance au cluster voisin le plus proche.

- $s(i) \approx 1$ : bien classé
- $s(i) \approx 0$ : à la frontière entre deux clusters
- $s(i) \approx -1$ : mal classé

### Problème de surapprentissage (overfitting)

Réduire la distance intra-classe à l'extrême peut mener au surapprentissage — le modèle "colle" trop aux données d'entraînement et ne généralise pas.

## Prétraitement des données

### Valeurs manquantes

```python
# Imputation par la moyenne
df['col'].fillna(df['col'].mean(), inplace=True)

# Suppression si peu important
df.dropna(subset=['col_importante'], inplace=True)
```

### Valeurs aberrantes (outliers)

```python
# Détection par IQR
Q1, Q3 = df['col'].quantile([0.25, 0.75])
IQR = Q3 - Q1
mask = (df['col'] >= Q1 - 1.5*IQR) & (df['col'] <= Q3 + 1.5*IQR)
df_clean = df[mask]
```

### Standardisation et normalisation

Les features doivent être **sur le même espace vectoriel** pour que les distances soient comparables — un âge (0-100) et un salaire (0-100000) ne peuvent pas être comparés directement.

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Standardisation (Z-score) : moyenne 0, écart-type 1
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Normalisation (min-max) : plage [0, 1]
norm = MinMaxScaler()
X_norm = norm.fit_transform(X)
```

### Encodage des variables catégorielles

```python
# One-hot encoding
pd.get_dummies(df['categorie'])

# Label encoding
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['cat_encoded'] = le.fit_transform(df['categorie'])
```

## Mise en œuvre avec scikit-learn

```python
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# K-means
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X_scaled)

# Évaluation
score = silhouette_score(X_scaled, labels)
print(f"Silhouette score : {score:.3f}")

# Déterminer k optimal (méthode du coude)
inertias = []
for k in range(1, 10):
    km = KMeans(n_clusters=k, random_state=42).fit(X_scaled)
    inertias.append(km.inertia_)
```

## Résumé

- Le Data Mining suit un pipeline : collecter → nettoyer → modéliser → évaluer.
- **Supervisé** si on connaît les labels (classification/régression) ; **non supervisé** pour trouver des structures (clustering).
- K-means est simple et efficace — mais nécessite de choisir $k$ et est sensible aux outliers.
- Toujours standardiser les features avant d'appliquer des algorithmes basés sur des distances.

## Références

- Cours Data Mining, S6 2024-2025
- Fichiers source : `2025-03-18.md`, `2025-03-25.md`, `2025-04-01.md`, `2025-04-08.md`
- Documentation scikit-learn : `https://scikit-learn.org/`
