---
layout: course
title: "Architecture des ordinateurs"
semestre: "S6"
type_cours: "systèmes"
tags: ["architecture", "processeur", "mémoire", "assembleur", "pipeline"]
---

## Introduction

Ce cours étudie le fonctionnement interne des ordinateurs — depuis les portes logiques jusqu'au processeur, en passant par la hiérarchie mémoire et le pipeline d'exécution des instructions.

> **Note** : le contenu de ce cours est principalement disponible sous forme de diapositives PDF. Cette fiche présente les concepts fondamentaux du domaine.

## L'ordinateur de Von Neumann

Toutes les architectures modernes reposent sur le modèle de **Von Neumann** (1945) :

```
        ┌─────────────────┐
        │   Mémoire       │  ← Instructions + Données (mémoire unifiée)
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │      CPU        │
        │  ┌──────────┐   │
        │  │   ALU    │   │  ← Unité arithmétique et logique
        │  └──────────┘   │
        │  ┌──────────┐   │
        │  │   UC     │   │  ← Unité de contrôle
        │  └──────────┘   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Entrées/Sorties│  ← Clavier, écran, réseau…
        └─────────────────┘
```

## Le processeur (CPU)

### Composants du CPU

| Composant | Rôle |
|-----------|------|
| **ALU** (Unité Arithmétique et Logique) | Calculs (+, -, AND, OR, NOT…) |
| **Unité de contrôle** | Décode et séquence les instructions |
| **Registres** | Mémoire ultra-rapide (quelques dizaines) |
| **Cache L1/L2/L3** | Mémoire rapide tampon entre CPU et RAM |
| **Bus** | Communication entre composants |

### Cycle d'exécution (Fetch–Decode–Execute)

```
1. FETCH   : charger l'instruction depuis la mémoire (PC → Registre d'instruction)
2. DECODE  : décoder l'opcode et les opérandes
3. EXECUTE : exécuter via l'ALU ou l'unité mémoire
4. WRITEBACK : écrire le résultat dans un registre ou la mémoire
```

### Pipeline

Le **pipeline** parallélise les 4 étapes sur plusieurs instructions simultanées :

```
Cycle :  1    2    3    4    5    6    7
Inst. 1: F    D    E    W
Inst. 2:      F    D    E    W
Inst. 3:           F    D    E    W
Inst. 4:                F    D    E    W
```

**Hazards** (aléas) — problèmes qui interrompent le pipeline :
- **Data hazard** : une instruction dépend du résultat d'une précédente (pas encore disponible)
- **Control hazard** : branchement conditionnel — on ne sait pas quelle instruction vient ensuite
- **Structural hazard** : deux instructions veulent utiliser la même ressource matérielle

**Solutions** : forwarding, stall (bulle), prédiction de branchement, exécution spéculative.

## Hiérarchie mémoire

Les mémoires sont organisées selon un compromis vitesse/capacité/coût :

```
Registres CPU       ~< 1 ns    ~  1 KB   — Le plus rapide, le plus cher
Cache L1           ~1–4 ns    ~  32 KB
Cache L2           ~4–10 ns   ~ 256 KB
Cache L3           ~10–40 ns  ~  8 MB
RAM (DRAM)         ~60–100 ns ~ 16 GB
SSD                ~100 µs    ~  1 TB
HDD                ~10 ms     ~  8 TB   — Le plus lent, le moins cher
```

### Localité des accès

Le cache fonctionne grâce au principe de **localité** :
- **Localité temporelle** : une donnée accédée sera probablement ré-accédée bientôt
- **Localité spatiale** : les données proches d'une donnée accédée seront probablement accédées

```c
// Bon exemple de localité spatiale (accès séquentiel au tableau)
for (int i = 0; i < N; i++) sum += tab[i];

// Mauvais : accès colonne par colonne sur un tableau 2D stocké ligne par ligne
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++) sum += mat[i][j];
```

## Représentation des données

### Entiers

- **Non signé** : $[0, 2^n - 1]$ sur $n$ bits
- **Complément à 2** (signé) : $[-2^{n-1}, 2^{n-1} - 1]$

```
8 bits non signé : 0 → 255
8 bits signé (C2): -128 → 127
```

### Virgule flottante (IEEE 754)

$$x = (-1)^s \times 1.m \times 2^{e - \text{biais}}$$

| Format | Bits totaux | Exposant | Mantisse | Précision |
|--------|------------|---------|---------|-----------|
| `float` | 32 | 8 | 23 | ~7 décimales |
| `double` | 64 | 11 | 52 | ~15 décimales |

## Assembleur x86 — Notions de base

```asm
; Syntaxe Intel (NASM)
section .data
    msg db "Hello", 0

section .text
    global _start

_start:
    mov eax, 4       ; syscall write
    mov ebx, 1       ; stdout
    mov ecx, msg     ; adresse du message
    mov edx, 5       ; longueur
    int 0x80         ; appel système

    mov eax, 1       ; syscall exit
    xor ebx, ebx
    int 0x80
```

**Registres x86-64 principaux** : `rax`, `rbx`, `rcx`, `rdx`, `rsi`, `rdi`, `rsp` (stack pointer), `rbp` (base pointer).

## Résumé

- Le modèle Von Neumann place CPU et mémoire dans une architecture séparée — le bus est souvent le goulet d'étranglement (*Von Neumann bottleneck*).
- Le pipeline augmente le débit d'instructions mais introduit des aléas à gérer.
- La hiérarchie mémoire exploite la localité pour masquer la lenteur de la RAM.
- Comprendre l'architecture permet d'écrire du code plus performant (cache-friendly, éviter les branches imprévisibles).

## Références

- Cours Architecture des Ordinateurs — Fournier, S6 2024-2025
- Supports PDF : `INF061 – Architecture des ordinateurs` (parties 1–5, 5b), TP1 & TP2
