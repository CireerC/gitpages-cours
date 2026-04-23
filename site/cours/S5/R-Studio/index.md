---
layout: course
title: "Statistiques avec R Studio"
semestre: "S5"
type_cours: "data"
tags: ["R", "statistiques", "visualisation", "Quarto"]
---

## Introduction

Ce cours introduit le langage R et l'environnement RStudio pour l'analyse statistique et la visualisation de données. R est particulièrement utilisé en data science, biostatistiques et économétrie.

## R et RStudio

- **R** est un langage de programmation dédié aux statistiques et au traitement de données.
- **RStudio** est l'environnement de développement (IDE) recommandé pour R.
- **Quarto** (`.qmd`) est le format de document reproductible qui combine code R, texte Markdown et sortie (graphiques, tableaux) — successeur de R Markdown.

## Syntaxe de base

```r
# Affectation
x <- 42
nom <- "Alice"

# Vecteur
v <- c(1, 2, 3, 4, 5)
mean(v)   # moyenne : 3
sum(v)    # somme : 15
sd(v)     # écart-type

# Séquence
seq(1, 10, by = 2)  # 1 3 5 7 9

# Data frame
df <- data.frame(
  nom  = c("Alice", "Bob", "Clara"),
  age  = c(21, 25, 19),
  note = c(15.5, 12.0, 18.0)
)
```

## Manipulation de données

```r
# Sélectionner des colonnes
df[, c("nom", "age")]
df$note              # accès par nom

# Filtrer des lignes
df[df$age > 20, ]
subset(df, age > 20)

# Avec dplyr (tidyverse)
library(dplyr)
df %>%
  filter(age > 20) %>%
  select(nom, note) %>%
  arrange(desc(note))
```

## Statistiques descriptives

```r
summary(df)           # résumé statistique
table(df$categorie)   # table de fréquences
cor(df$x, df$y)       # corrélation de Pearson
```

### Indicateurs clés

| Indicateur | Formule | Commande R |
|-----------|---------|-----------|
| Moyenne | $\bar{x} = \frac{1}{n}\sum x_i$ | `mean(x)` |
| Variance | $s^2 = \frac{1}{n-1}\sum(x_i - \bar{x})^2$ | `var(x)` |
| Écart-type | $s = \sqrt{s^2}$ | `sd(x)` |
| Médiane | Valeur centrale | `median(x)` |

## Visualisation avec ggplot2

```r
library(ggplot2)

# Histogramme
ggplot(df, aes(x = note)) +
  geom_histogram(binwidth = 1, fill = "steelblue") +
  labs(title = "Distribution des notes", x = "Note", y = "Effectif")

# Nuage de points
ggplot(df, aes(x = age, y = note)) +
  geom_point() +
  geom_smooth(method = "lm")  # droite de régression
```

## Tests statistiques

```r
# Test de Student (comparaison de moyennes)
t.test(groupe1, groupe2)

# Test du Chi² (indépendance)
chisq.test(table(df$var1, df$var2))

# Corrélation
cor.test(df$x, df$y, method = "pearson")
```

## Documents Quarto

Un fichier `.qmd` combine du texte Markdown et des blocs de code R :

````markdown
---
title: "Analyse des données"
format: html
---

## Introduction

```{r}
summary(mtcars)
```
````

## Résumé

- R est idéal pour les statistiques et la visualisation — `dplyr` pour la manipulation, `ggplot2` pour les graphiques.
- RStudio + Quarto permet de produire des rapports reproductibles (HTML, PDF) directement depuis le code.
- Toujours vérifier les hypothèses avant d'appliquer un test statistique (normalité, homoscédasticité).

## Références

- Cours R Studio, S5 2024-2025
- Fichiers source : TDs en `.zip` (à dézipper pour exécuter), `exemple de cours.qmd`, `.Rhistory`
- Documentation : `https://www.tidyverse.org/`, `https://quarto.org/`
