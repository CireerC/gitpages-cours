---
layout: course
title: "Impression 3D & Circuits imprimés"
semestre: "S5"
type_cours: "iot"
tags: ["impression 3D", "KiCad", "PCB", "électronique", "NE555"]
---

## Introduction

Ce cours couvre deux domaines complémentaires pour la fabrication de prototypes électroniques : la **conception de circuits imprimés (PCB)** avec KiCad et l'**impression 3D** pour les boîtiers et pièces mécaniques.

## Impression 3D — FDM

L'impression 3D par dépôt de filament fondu (FDM) dépose couche par couche un filament thermoplastique pour construire un objet 3D.

### Workflow

1. **Modélisation** — créer le modèle 3D (Fusion 360, FreeCAD, OpenSCAD)
2. **Slicing** — découper en couches avec un logiciel slicer (Cura, PrusaSlicer) → fichier `.gcode`
3. **Impression** — envoyer le gcode à l'imprimante
4. **Post-traitement** — retirer les supports, poncer si nécessaire

### Paramètres clés

| Paramètre | Valeur typique | Impact |
|-----------|---------------|--------|
| Hauteur de couche | 0.2 mm | Résolution verticale |
| Remplissage (infill) | 20–40 % | Résistance vs vitesse |
| Température buse | 200–220 °C (PLA) | Adhérence entre couches |
| Température plateau | 60 °C (PLA) | Adhérence première couche |

### Formats de fichiers

- `.stl` — maillage triangulaire (export universel)
- `.3mf` — format moderne avec métadonnées (couleurs, matériaux)
- `.gcode` — instructions machine directes

> **Projet S5** : impression d'un porte-clé dragon (*Cali-Dragon*) et d'un Pikachu pour calibrer l'imprimante.

## Circuits Imprimés (PCB) avec KiCad

**KiCad** est un logiciel libre de conception électronique (EDA). Le workflow se déroule en deux étapes :

### 1. Schématique (Schéma électronique)

Dessin des connexions logiques entre composants — aucune notion de physique à ce stade.

```
Composants typiques :
- Résistances (R)
- Condensateurs (C)
- Circuits intégrés (U)
- Connecteurs (J)
```

### 2. Layout (Routage du PCB)

Placement physique des composants sur la carte et tracé des pistes de cuivre.

**Règles de design (DRC) :**
- Espacement minimum entre pistes
- Largeur minimale des pistes en fonction du courant
- Zones de cuivre (plans de masse)

## Le circuit NE555

Le **NE555** est un circuit intégré temporisateur très populaire — utilisé en mode **astable** pour générer un signal carré oscillant (horloge, clignotant LED).

### Mode astable

En mode astable, le NE555 oscille en permanence sans déclenchement externe.

**Formules :**

$$f = \frac{1.44}{(R_A + 2 R_B) \cdot C}$$

$$t_{haut} = 0.693 \cdot (R_A + R_B) \cdot C$$
$$t_{bas}  = 0.693 \cdot R_B \cdot C$$

Avec $R_A$, $R_B$ en ohms et $C$ en farads.

**Brochage NE555 :**

| Pin | Nom | Fonction |
|-----|-----|---------|
| 1 | GND | Masse |
| 2 | TRIG | Déclenchement |
| 3 | OUT | Sortie |
| 4 | RESET | Remise à zéro (actif bas) |
| 5 | CTRL | Tension de contrôle |
| 6 | THR | Seuil |
| 7 | DIS | Décharge |
| 8 | VCC | Alimentation (4.5–16V) |

## Résumé

- L'impression 3D FDM permet de prototyper rapidement des pièces mécaniques — PLA est le filament standard pour les débutants.
- KiCad sépare la conception en deux étapes : schématique (logique) et layout (physique).
- Le NE555 en mode astable est un générateur de signaux carré simple à câbler.
- Ces compétences sont directement applicables aux projets IoT pour créer des boîtiers et des cartes électroniques sur mesure.

## Références

- Cours Impression 3D & Circuits Imprimés, S5 2024-2025
- Fichiers source : `Design_Astable.pdf`, `Design_Circuits_Imprimés.pdf`
- Fichier KiCad : `Ne55/NE555.asc`
- Modèles 3D : `Cali-Dragon_v1_Keychain.stl`, `Pika/PI3MK3M_Pikachu_V2.3mf`
