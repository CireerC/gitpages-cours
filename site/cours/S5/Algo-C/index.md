---
layout: course
title: "Algorithmique & Structures de données en C"
semestre: "S5"
type_cours: "dev"
tags: ["C", "structures de données", "complexité", "tri"]
---

## Introduction

Ce cours couvre les structures de données fondamentales et leurs implémentations en langage C, ainsi que l'analyse de la complexité algorithmique. L'objectif est de comprendre quand et pourquoi choisir une structure plutôt qu'une autre selon les contraintes de performance.

## Complexité algorithmique

La complexité décrit le coût en temps (ou en espace) d'un algorithme en fonction de la taille de l'entrée $n$.

| Notation | Nom | Exemple |
|----------|-----|---------|
| $O(1)$ | Constant | Accès à un tableau |
| $O(\log n)$ | Logarithmique | Recherche binaire |
| $O(n)$ | Linéaire | Parcours de liste |
| $O(n \log n)$ | Quasi-linéaire | Merge Sort |
| $O(n^2)$ | Quadratique | Tri à bulles |

## Structures de données — tableau de complexités

### Files et piles

| Opération | FIFO (Queue) | LIFO (Stack) | Deque |
|-----------|-------------|-------------|-------|
| Ajout en tête | N/A | O(1) `push` | O(1) |
| Ajout en queue | O(1) `enqueue` | N/A | O(1) |
| Retrait en tête | O(1) `dequeue` | N/A | O(1) |
| Retrait en queue | N/A | O(1) `pop` | O(1) |

### Files de priorité et ensembles

| Opération | Priority Queue | Unsorted Set | Sorted Set |
|-----------|---------------|-------------|------------|
| Insertion | O(log n) | O(1) | O(log n) |
| Suppression | O(log n) `deleteMin` | O(1) | O(log n) |
| Recherche | O(log n) | O(1) | O(log n) |

### Arbre binaire

| Opération | Complexité |
|-----------|------------|
| Insertion (équilibrée) | O(log n) |
| Suppression | O(log n) |
| Recherche | O(log n) |

## Algorithmes de tri

| Algorithme | Meilleur cas | Cas moyen | Pire cas | En place | Stable |
|------------|-------------|-----------|----------|----------|--------|
| Insertion Sort | O(n) | O(n²) | O(n²) | Oui | Oui |
| Selection Sort | O(n²) | O(n²) | O(n²) | Oui | Non |
| Bubble Sort | O(n) | O(n²) | O(n²) | Oui | Oui |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Non | Oui |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | Oui | Non |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | Oui | Non |
| Radix Sort | O(nk) | O(nk) | O(nk) | Non | Oui |

> **Règle pratique :** Merge Sort est fiable en O(n log n) garanti. Quick Sort est plus rapide en pratique mais dégénère sur des données déjà triées si le pivot est mal choisi.

## Concepts clés en C

### Pointeurs et allocation dynamique

```c
// Allocation d'un tableau dynamique
int *tab = malloc(n * sizeof(int));
if (!tab) { perror("malloc"); exit(1); }

// Libération obligatoire
free(tab);
```

### Liste chaînée simple

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *head = NULL;

// Insertion en tête en O(1)
void push(Node **head, int val) {
    Node *n = malloc(sizeof(Node));
    n->data = val;
    n->next = *head;
    *head = n;
}
```

### Pile (LIFO) avec liste chaînée

```c
// push() = insertion en tête (O(1))
// pop()  = retrait en tête (O(1))
int pop(Node **head) {
    Node *tmp = *head;
    int val = tmp->data;
    *head = tmp->next;
    free(tmp);
    return val;
}
```

## Résumé

- Choisir une **queue FIFO** pour les files d'attente (BFS, ordonnancement).
- Choisir une **pile LIFO** pour l'évaluation d'expressions, la récursion itérative.
- Choisir un **arbre binaire de recherche** ou **sorted set** pour les données triées avec insertions/suppressions fréquentes.
- Préférer **Merge Sort** quand la stabilité et le pire cas garanti sont critiques.
- Utiliser **Quick Sort** pour la performance pratique sur données aléatoires.

## Références

- Cours ODS (Open Data Structures) — pat Morin
- Documentation C standard (`malloc`, `free`, pointeurs)
- Fichiers source : `Structures de Données.md`, `ods-intro.pdf`, `ods-array.pdf`, etc.
