---
layout: course
title: "Machine Learning"
semestre: "S7"
type_cours: "data"
tags: ["supervised learning", "clustering", "SVM", "random forest", "neural networks", "scikit-learn", "overfitting", "validation croisée"]
---

## Introduction

Le Machine Learning (ML) est une branche de l'IA qui permet aux machines d'**apprendre à partir des données** sans être explicitement programmées. On distingue trois grandes familles d'apprentissage selon la nature des données disponibles.

## Types d'apprentissage

| Type | Données | Exemples |
|------|---------|---------|
| **Supervisé** | Étiquetées (X, y) | Classification, régression |
| **Non supervisé** | Non étiquetées (X) | Clustering, réduction de dimension |
| **Par renforcement** | Récompenses/pénalités | Jeux, robotique, trading |

### Pipeline ML standard

```
Données brutes → Nettoyage → Feature engineering → Entraînement → Évaluation → Déploiement
```

---

## Apprentissage supervisé

### Régression linéaire

Modélise la relation entre une variable cible $y$ et des features $X$ :

$$y = w_0 + w_1 x_1 + w_2 x_2 + \ldots + w_n x_n$$

Minimisation de la **MSE** (Mean Squared Error) :

$$\text{MSE} = \frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2$$

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(f"R² : {r2_score(y_test, y_pred):.3f}")
print(f"MSE : {mean_squared_error(y_test, y_pred):.3f}")
```

### Régression logistique

Pour la **classification binaire**, applique une sigmoïde à la sortie linéaire :

$$P(y=1 | X) = \sigma(w^T X) = \frac{1}{1 + e^{-w^T X}}$$

```python
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(C=1.0, max_iter=1000)
clf.fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]  # probabilité classe positive
```

### Arbres de décision

Partitionnent l'espace des features par seuils. Critères de split :

- **Gini** : $1 - \sum_k p_k^2$
- **Entropie** : $-\sum_k p_k \log_2 p_k$

> Un arbre profond **overfitte** — utiliser `max_depth` pour limiter.

```python
from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(max_depth=5, criterion='gini', random_state=42)
tree.fit(X_train, y_train)
print(export_text(tree, feature_names=feature_names))
```

### Random Forest

Ensemble de $T$ arbres entraînés sur des sous-échantillons (bootstrap) et des sous-ensembles de features aléatoires (**bagging**). Prédiction par vote majoritaire.

```python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# Importance des features
importances = rf.feature_importances_
```

**Avantages :** robuste au bruit, gère les valeurs manquantes, importance des features.  
**Inconvénients :** peu interprétable, lent en prédiction.

### Gradient Boosting

Construction **séquentielle** d'arbres : chaque arbre corrige les erreurs résiduelles du précédent.

```python
from sklearn.ensemble import GradientBoostingClassifier
import xgboost as xgb

# XGBoost — version rapide et régularisée
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric='logloss'
)
xgb_model.fit(X_train, y_train,
              eval_set=[(X_val, y_val)],
              early_stopping_rounds=20,
              verbose=False)
```

### Support Vector Machine (SVM)

Trouve l'**hyperplan à marge maximale** qui sépare les classes. Le **kernel trick** permet de traiter des données non-linéairement séparables.

| Kernel | Usage |
|--------|-------|
| Linéaire | Données linéairement séparables |
| RBF (Gaussien) | Données non-linéaires, usage par défaut |
| Polynomial | Relations polynomiales |

```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

# IMPORTANT : toujours normaliser avant SVM
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

svm = SVC(kernel='rbf', C=10, gamma='scale', probability=True)
svm.fit(X_train_scaled, y_train)
```

---

## Apprentissage non supervisé

### k-Means

Partitionne les données en $k$ clusters en minimisant l'inertie interne (variance intra-cluster).

```python
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Méthode du coude pour choisir k
inertias = []
for k in range(2, 11):
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    km.fit(X)
    inertias.append(km.inertia_)

# Silhouette score : mesure la qualité des clusters
km_best = KMeans(n_clusters=4, n_init=10, random_state=42)
labels = km_best.fit_predict(X)
print(f"Silhouette : {silhouette_score(X, labels):.3f}")
```

### Réduction de dimensionnalité

**PCA** (Analyse en Composantes Principales) — projette dans un sous-espace de variance maximale :

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
print(f"Variance expliquée : {pca.explained_variance_ratio_.sum():.1%}")
```

**t-SNE** — non-linéaire, idéal pour la visualisation :

```python
from sklearn.manifold import TSNE

tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X_scaled)
```

---

## Évaluation des modèles

### Métriques de classification

| Métrique | Formule | Quand l'utiliser |
|---------|---------|-----------------|
| **Accuracy** | (TP+TN)/(TP+TN+FP+FN) | Classes équilibrées |
| **Precision** | TP/(TP+FP) | Éviter les faux positifs |
| **Recall** | TP/(TP+FN) | Éviter les faux négatifs |
| **F1-Score** | 2·(P·R)/(P+R) | Compromis P/R |
| **AUC-ROC** | Aire sous la courbe ROC | Comparaison globale |

```python
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

print(classification_report(y_test, y_pred, target_names=['Négatif', 'Positif']))
print(f"AUC-ROC : {roc_auc_score(y_test, y_proba):.4f}")
```

### Validation croisée

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='f1_macro')
print(f"F1 moyen : {scores.mean():.3f} ± {scores.std():.3f}")
```

### Optimisation des hyperparamètres

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [5, 10, None],
    'min_samples_split': [2, 5, 10]
}

search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='f1_macro',
    n_jobs=-1
)
search.fit(X_train, y_train)
print(f"Meilleurs paramètres : {search.best_params_}")
```

---

## Overfitting & Régularisation

```
Sous-apprentissage  ←─────────────────────────────→  Sur-apprentissage
(biais élevé)                                          (variance élevée)
Erreur train = haute    Erreur train = basse
Erreur test  = haute    Erreur test  = haute
```

**Solutions contre l'overfitting :**

| Technique | Algorithme |
|-----------|-----------|
| Réduire la profondeur | Arbres, RF |
| Régularisation L1/L2 | Régression, SVM |
| Dropout | Réseaux de neurones |
| Early stopping | Boosting, NN |
| Augmentation de données | Tout |
| Réduire le modèle | Tout |

```python
from sklearn.linear_model import Ridge, Lasso, ElasticNet

ridge   = Ridge(alpha=1.0)        # L2 : réduit les poids
lasso   = Lasso(alpha=0.01)       # L1 : met des poids à 0 (sélection de features)
elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)  # Combinaison L1+L2
```

---

## Pipeline scikit-learn

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier

# Preprocessing différencié par type de colonne
num_features = ['age', 'salaire', 'experience']
cat_features = ['ville', 'diplome']

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), num_features),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
])

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=200, random_state=42))
])

pipeline.fit(X_train, y_train)
score = pipeline.score(X_test, y_test)
print(f"Accuracy : {score:.3f}")
```

> **Règle d'or :** le `fit_transform` du preprocessor ne doit s'appliquer qu'aux données d'entraînement. `Pipeline` gère cela automatiquement.

---

## Feature Engineering

```python
import pandas as pd
import numpy as np

# Interaction de features
df['feature_product'] = df['A'] * df['B']
df['feature_ratio']   = df['A'] / (df['B'] + 1e-9)

# Binning
df['age_bin'] = pd.cut(df['age'], bins=[0, 25, 35, 50, 100],
                       labels=['jeune', 'adulte', 'senior', 'aîné'])

# Encodage cyclique (heure, jour)
df['heure_sin'] = np.sin(2 * np.pi * df['heure'] / 24)
df['heure_cos'] = np.cos(2 * np.pi * df['heure'] / 24)

# Gestion des valeurs manquantes
from sklearn.impute import SimpleImputer, KNNImputer
imputer = KNNImputer(n_neighbors=5)
X_imputed = imputer.fit_transform(X)
```

---

## Résumé

| Algorithme | Interprétable | Données requises | Points forts |
|-----------|:---:|:---:|-------------|
| Régression linéaire | ✅ | Peu | Rapide, baseline |
| Arbre de décision | ✅ | Peu | Règles explicites |
| Random Forest | ⚠️ | Moyen | Robuste, features importance |
| XGBoost | ⚠️ | Moyen | Performant, compétitions |
| SVM | ❌ | Moyen | Haute dimensionnalité |
| k-Means | ✅ | Variable | Clustering simple |
| PCA | ✅ | Variable | Réduction de bruit |

**Points clés à retenir :**
- Toujours diviser train/test **avant** tout preprocessing
- La validation croisée donne une estimation plus fiable que le hold-out simple
- L'accuracy est trompeuse sur des classes déséquilibrées → utiliser F1, AUC
- Un bon feature engineering vaut souvent mieux qu'un modèle complexe
