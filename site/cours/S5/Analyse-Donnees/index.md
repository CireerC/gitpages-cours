---
layout: course
title: "Analyse de données"
semestre: "S5"
type_cours: "data"
tags: ["pandas", "Python", "nettoyage", "prétraitement"]
---

## Introduction

Ce cours aborde les fondamentaux de l'analyse de données avec Python et la bibliothèque **pandas**. L'objectif est de savoir manipuler des jeux de données tabulaires, les nettoyer et les préparer pour des analyses statistiques ou des modèles.

## Manipulation de DataFrames avec pandas

### Opérations de base

```python
import pandas as pd

df = pd.read_csv("donnees.csv")
df.head()       # afficher les 5 premières lignes
df.info()       # types et valeurs manquantes
df.describe()   # statistiques descriptives
```

### Modifier un DataFrame

```python
# Ajouter/modifier une colonne sans altérer df original
df_nouveau = df.assign(nouvelle_col=df['col1'] + df['col2'])

# Supprimer des lignes (retourne un nouveau DataFrame)
df_propre = df.drop([45613])          # par indice
df_propre = df.drop(index=[45613])

# Supprimer en place (modifie df directement)
df.drop([45613], inplace=True)
```

### Filtrage et sélection

```python
# Sélectionner des colonnes
df[['col1', 'col2']]

# Filtrer des lignes
df[df['age'] > 25]
df[(df['ville'] == 'Paris') & (df['age'] > 25)]

# Accès par position
df.iloc[0]        # première ligne
df.iloc[0:5, 1:3] # lignes 0-4, colonnes 1-2

# Accès par label
df.loc[5]         # ligne avec index 5
```

## Problèmes courants dans les données

Lors de l'analyse, les données réelles présentent souvent trois types de problèmes :

### 1. Données incomplètes

Des valeurs manquent — cellules vides, `NaN`, `NULL`.

```python
df.isnull().sum()          # compter les valeurs manquantes par colonne
df.dropna()                # supprimer les lignes avec NaN
df.fillna(0)               # remplacer NaN par 0
df['col'].fillna(df['col'].mean())  # remplacer par la moyenne
```

### 2. Données bruitées

Des erreurs de mesure ou de saisie introduisent des valeurs aberrantes (*outliers*).

```python
# Détecter les outliers avec l'IQR
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df['col'] < Q1 - 1.5 * IQR) | (df['col'] > Q3 + 1.5 * IQR)]
```

### 3. Données incohérentes

Des valeurs contradictoires dans le même jeu de données (unités mélangées, doublons, formats différents).

```python
# Supprimer les doublons
df.drop_duplicates(inplace=True)

# Normaliser le format d'une colonne texte
df['ville'] = df['ville'].str.strip().str.lower()
```

## Pipeline de prétraitement typique

1. **Charger** les données (`pd.read_csv`, `pd.read_excel`)
2. **Explorer** (`df.info()`, `df.describe()`, `df.head()`)
3. **Nettoyer** (valeurs manquantes, doublons, types incorrects)
4. **Transformer** (normalisation, encodage des variables catégorielles)
5. **Analyser** ou **modéliser**

## Résumé

- `df.assign()` et `df.drop()` sans `inplace=True` retournent un **nouveau** DataFrame — l'original n'est pas modifié.
- Toujours explorer les données avant de les nettoyer : `info()`, `describe()`, `isnull().sum()`.
- Les trois sources principales de mauvaise qualité des données : incomplètes, bruitées, incohérentes.

## Références

- Cours Analyse de Données — Khoarau, S5 2024-2025
- Fichiers source : `Cours2,3,4.md`, `CM2.marp.pdf`, `CM3.marp.pdf`, `CM4.marp.pdf`
- Documentation pandas : `https://pandas.pydata.org/docs/`
