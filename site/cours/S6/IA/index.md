---
layout: course
title: "Intelligence Artificielle"
semestre: "S6"
type_cours: "data"
tags: ["machine learning", "deep learning", "réseaux de neurones", "Python", "scikit-learn"]
---

## Introduction

Ce cours couvre les fondements de l'intelligence artificielle — du machine learning classique au deep learning. L'objectif est de comprendre les paradigmes d'apprentissage, de savoir choisir un algorithme adapté à un problème donné, et de mettre en œuvre des modèles avec Python.

## Panorama de l'IA

```
Intelligence Artificielle
└── Machine Learning (apprentissage statistique)
    ├── Apprentissage supervisé
    │   ├── Régression (valeurs continues)
    │   └── Classification (catégories)
    ├── Apprentissage non supervisé
    │   └── Clustering, réduction de dimension
    └── Deep Learning (réseaux de neurones profonds)
        ├── CNN (images)
        ├── RNN/LSTM (séquences)
        └── Transformers (texte, NLP)
```

## Apprentissage supervisé

### Régression linéaire

Prédit une valeur continue à partir de features.

$$\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \dots + w_n x_n$$

**Entraînement** : minimiser l'erreur quadratique moyenne (MSE) :

$$\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"MSE : {mean_squared_error(y_test, y_pred):.4f}")
```

### Classification

Prédit une classe discrète (binaire ou multi-classe).

| Algorithme | Points forts | Limites |
|-----------|-------------|---------|
| **Régression logistique** | Simple, interprétable | Frontière linéaire |
| **Arbre de décision** | Interprétable, non-linéaire | Surapprentissage facile |
| **Random Forest** | Robuste, performant | Moins interprétable |
| **SVM** | Efficace en haute dimension | Lent sur gros jeux de données |
| **k-NN** | Simple à comprendre | Lent à la prédiction |

### Métriques d'évaluation (classification)

| Métrique | Formule | Usage |
|---------|---------|-------|
| **Accuracy** | $\frac{TP+TN}{TP+TN+FP+FN}$ | Données équilibrées |
| **Précision** | $\frac{TP}{TP+FP}$ | Minimiser les faux positifs |
| **Rappel** | $\frac{TP}{TP+FN}$ | Minimiser les faux négatifs |
| **F1-score** | $\frac{2 \cdot P \cdot R}{P+R}$ | Compromis précision/rappel |

### Surapprentissage (Overfitting)

Le modèle "mémorise" les données d'entraînement au lieu de généraliser.

**Détection** : accuracy élevée en train, faible en test.

**Solutions** :
- Régularisation (L1 Lasso, L2 Ridge)
- Dropout (deep learning)
- Augmentation des données
- Validation croisée (k-fold cross-validation)

```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"Accuracy moyenne : {scores.mean():.3f} ± {scores.std():.3f}")
```

## Deep Learning — Réseaux de neurones

### Perceptron multicouche (MLP)

Un réseau de neurones est composé de **couches** de neurones artificiels :

```
Entrée → [Couche cachée 1] → [Couche cachée 2] → Sortie
```

Chaque neurone calcule :

$$a = \sigma\left(\sum_i w_i x_i + b\right)$$

où $\sigma$ est la **fonction d'activation** (ReLU, sigmoid, tanh).

### Fonctions d'activation

| Fonction | Formule | Usage |
|----------|---------|-------|
| **ReLU** | $\max(0, x)$ | Couches cachées (standard) |
| **Sigmoid** | $\frac{1}{1+e^{-x}}$ | Sortie binaire |
| **Softmax** | $\frac{e^{x_i}}{\sum_j e^{x_j}}$ | Sortie multi-classe |
| **Tanh** | $\frac{e^x - e^{-x}}{e^x + e^{-x}}$ | Couches cachées (RNN) |

### Rétropropagation (Backpropagation)

L'entraînement ajuste les poids $w$ pour minimiser la **fonction de perte** (loss) via la **descente de gradient** :

$$w \leftarrow w - \eta \cdot \frac{\partial \mathcal{L}}{\partial w}$$

où $\eta$ est le **taux d'apprentissage** (learning rate).

### Implémentation avec Keras/TensorFlow

```python
import tensorflow as tf
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(n_features,)),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(n_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history = model.fit(X_train, y_train,
                    epochs=50, batch_size=32,
                    validation_split=0.2)
```

## Traitement du langage naturel (NLP)

### Pipeline NLP classique

```
Texte brut → Tokenisation → Nettoyage → Vectorisation → Modèle
```

**Vectorisation** : transformer le texte en vecteurs numériques.
- **Bag of Words (BoW)** : compte la fréquence de chaque mot
- **TF-IDF** : pondère les mots rares (plus informatifs)
- **Word2Vec / GloVe** : représentations denses (embeddings)
- **BERT / Transformers** : contexte bidirectionnel (état de l'art)

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(corpus)

clf = MultinomialNB()
clf.fit(X_train, y_train)
```

## Éthique de l'IA

- **Biais algorithmiques** : un modèle entraîné sur des données biaisées reproduit et amplifie ces biais.
- **Explicabilité (XAI)** : les modèles boîte noire (deep learning) sont difficiles à interpréter — problème pour les domaines sensibles (santé, justice).
- **RGPD et données personnelles** : toute utilisation de données personnelles pour entraîner un modèle est soumise à réglementation.
- **Impact environnemental** : entraîner de grands modèles consomme énormément d'énergie.

## Résumé

- Choisir le bon type d'apprentissage selon la disponibilité des labels : **supervisé** si on a des données étiquetées, **non supervisé** sinon.
- Toujours évaluer sur un **jeu de test séparé** — ne jamais utiliser les données de test pour l'entraînement.
- Le deep learning n'est pas toujours la meilleure solution — pour des données tabulaires, Random Forest ou XGBoost surpassent souvent les réseaux de neurones.
- La qualité des données prime sur la sophistication du modèle.

## Références

- Cours IA — Tahir, S6 2024-2025
- Fichiers source : `Cours-2.md`, `Cours-3.md`, `Cours-4.md`, `Cours-6-énervé.md`
- Supports PDF : cours 0–4, devoir learning
- Documentation : `https://scikit-learn.org/`, `https://keras.io/`
