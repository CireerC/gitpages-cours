---
layout: course
title: "Théorie des langages"
semestre: "S6"
type_cours: "informatique théorique"
tags: ["automates", "grammaires", "langages formels", "expressions régulières", "Java"]
---

## Introduction

La théorie des langages formels fournit les fondements mathématiques des compilateurs, des analyseurs syntaxiques et des expressions régulières. Elle étudie les langages que les machines peuvent reconnaître ou générer.

## Hiérarchie de Chomsky

Les langages formels sont classifiés en 4 niveaux :

| Niveau | Type de langage | Automate reconnaisseur | Grammaire |
|--------|----------------|----------------------|-----------|
| **Type 3** | Régulier | Automate fini (AFD/AFN) | Régulière |
| **Type 2** | Hors-contexte | Automate à pile (AP) | Hors-contexte (CFG) |
| **Type 1** | Contextuel | Machine de Turing bornée | Contextuelle |
| **Type 0** | Récursivement énumérable | Machine de Turing | Sans restriction |

## Langages réguliers (Type 3)

### Expressions régulières (Regex)

Une **expression régulière** décrit un langage régulier via des opérateurs de base :

| Opérateur | Notation | Signification |
|-----------|---------|--------------|
| Concaténation | $ab$ | `a` suivi de `b` |
| Union | $a \mid b$ | `a` ou `b` |
| Étoile de Kleene | $a^*$ | 0 ou plusieurs `a` |
| Plus | $a^+$ | 1 ou plusieurs `a` |
| Option | $a?$ | 0 ou 1 `a` |

**Exemples :**
- `[0-9]+` — un ou plusieurs chiffres
- `[a-zA-Z_][a-zA-Z0-9_]*` — identifiant Java/C
- `(https?://)[^\s]+` — URL (http ou https)

### Automates finis déterministes (AFD)

Un **AFD** est un tuple $(Q, \Sigma, \delta, q_0, F)$ :
- $Q$ — ensemble fini d'états
- $\Sigma$ — alphabet (symboles d'entrée)
- $\delta : Q \times \Sigma \to Q$ — fonction de transition
- $q_0 \in Q$ — état initial
- $F \subseteq Q$ — états acceptants

**Équivalence** : tout AFN (non déterministe) peut être converti en AFD (construction par sous-ensembles). Toute regex peut être convertie en AFD (Thompson + déterminisation).

### En Java — regex

```java
import java.util.regex.*;

String texte = "eric.forster@esiroi.re";
Pattern p = Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$");
Matcher m = p.matcher(texte);

if (m.matches()) {
    System.out.println("Email valide");
}

// Extraction de groupes
Pattern date = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})");
Matcher d = date.matcher("2024-11-15");
if (d.find()) {
    System.out.println("Année : " + d.group(1)); // 2024
}
```

## Langages hors-contexte (Type 2)

### Grammaires Hors-Contexte (CFG)

Une **CFG** est un tuple $(V, \Sigma, P, S)$ :
- $V$ — variables (non-terminaux)
- $\Sigma$ — terminaux (alphabet)
- $P$ — règles de production $A \to \alpha$
- $S$ — symbole de départ

**Exemple — expressions arithmétiques :**

```
E → E + T | T
T → T * F | F
F → ( E ) | id
```

Cette grammaire génère des expressions comme `id + id * id` avec la bonne priorité des opérateurs.

### Arbres de dérivation

Un arbre de dérivation (*parse tree*) représente la structure syntaxique d'un mot selon une grammaire.

### Automates à pile (AP)

Les langages hors-contexte sont reconnus par des **automates à pile** — un AFD enrichi d'une pile (mémoire infinie LIFO). Exemple classique : reconnaître $a^n b^n$ (autant de `a` que de `b`).

## Lemme de pompage

Le **lemme de pompage** permet de prouver qu'un langage n'est **pas** régulier (ou pas hors-contexte).

**Pour les langages réguliers** : si $L$ est régulier, alors pour tout mot suffisamment long $w \in L$, on peut décomposer $w = xyz$ avec :
- $|xy| \leq p$ ($p$ = constante de pompage)
- $|y| \geq 1$
- $xy^i z \in L$ pour tout $i \geq 0$

**Application** : $L = \{a^n b^n \mid n \geq 0\}$ n'est pas régulier (on ne peut pas pomper).

## Compilation — Vue d'ensemble

La théorie des langages est au cœur de la construction des compilateurs :

```
Code source
    ↓ Analyse lexicale  (regex → tokens)
    ↓ Analyse syntaxique (CFG → arbre de syntaxe)
    ↓ Analyse sémantique (vérification des types)
    ↓ Génération de code intermédiaire
    ↓ Optimisation
    ↓ Génération de code cible
Code machine
```

## Résumé

- Les **expressions régulières** (Type 3) reconnaissent des patterns — implémentées par des AFD.
- Les **grammaires hors-contexte** (Type 2) structurent les langages de programmation — analysées par des automates à pile.
- Le **lemme de pompage** est l'outil pour prouver qu'un langage dépasse une certaine classe.
- La théorie des langages est la base de tout compilateur, interpréteur et moteur d'expressions régulières.

## Références

- Cours Théorie des Langages, S6 2024-2025
- Fichiers source : `2025-01-30.md`, `Fiche_question_java.md`
