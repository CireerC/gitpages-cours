---
layout: course
title: "SAE IoT — LoRa / STM32"
semestre: "S5"
type_cours: "projet"
tags: ["IoT", "LoRa", "STM32", "séries temporelles", "embarqué"]
---

## Introduction

La SAE (Situation d'Apprentissage et d'Évaluation) IoT du S5 portait sur le développement d'un système de capteurs communicants via le protocole **LoRa** (Long Range), basé sur la carte **STM32 B-L072Z-LRWAN1**. Le projet combinait développement embarqué, traitement des données et analyse de séries temporelles.

## Architecture du système

```
Capteur STM32 ──[LoRa/LoRaWAN]──▶ Passerelle ──▶ Serveur cloud ──▶ Analyse
     (terrain)                      (réseau)       (stockage)        (Python)
```

### Composants matériels

| Composant | Référence | Rôle |
|-----------|----------|------|
| Carte de développement | STM32 B-L072Z-LRWAN1 | Microcontrôleur + module LoRa |
| Capteur | Selon le projet | Mesure environnementale |
| Passerelle LoRa | - | Réception et transmission réseau |

## LoRa et LoRaWAN

### LoRa

**LoRa** (Long Range) est une modulation radio à étalement de spectre (CSS — Chirp Spread Spectrum) qui permet :
- Portée longue : jusqu'à 15 km en espace ouvert
- Faible consommation énergétique (idéal pour les batteries)
- Faible débit (jusqu'à ~50 kbps)

### LoRaWAN

**LoRaWAN** est le protocole MAC qui s'appuie sur LoRa pour construire un réseau IoT complet.

**Classes LoRaWAN :**

| Classe | Mode | Usage |
|--------|------|-------|
| A | Bidirectionnel — fenêtres RX après TX | La plus économe en énergie |
| B | Fenêtres RX planifiées (beacon) | Latence prévisible |
| C | RX permanent | Appareils branchés sur secteur |

**Mode OTAA (Over The Air Activation) :**
```
1. End-device envoie JOIN REQUEST (DevEUI, AppEUI, AppKey)
2. Network Server répond JOIN ACCEPT
3. Clés de session NwkSKey et AppSKey dérivées
```

## Développement STM32 avec STM32CubeWL

**STM32CubeWL** est l'outil de configuration et de génération de code pour les microcontrôleurs STM32 avec radio intégrée.

### Workflow de développement

```bash
# 1. Configurer les périphériques dans STM32CubeMX
# 2. Générer le code C → ouvrir dans STM32CubeIDE
# 3. Implémenter la logique applicative
# 4. Compiler et flasher la carte

# Flasher via ST-Link
st-flash write firmware.bin 0x08000000
```

### Structure d'un projet CubeIDE

```
projet/
├── Core/
│   ├── Inc/          # fichiers .h
│   └── Src/
│       ├── main.c    # point d'entrée
│       └── ...
├── Drivers/          # HAL et BSP STM32
├── Middlewares/      # LoRaWAN stack
└── .ioc              # configuration CubeMX
```

## Traitement des données — Séries temporelles

### ARIMA

**ARIMA** (AutoRegressive Integrated Moving Average) est un modèle statistique pour prévoir des séries temporelles.

$$ARIMA(p, d, q)$$

- $p$ : ordre autorégressif (AR) — combien de valeurs passées utiliser
- $d$ : degré de différenciation — pour rendre la série stationnaire
- $q$ : ordre de la moyenne mobile (MA) — combien d'erreurs passées utiliser

```python
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd

# Charger les données capteur
df = pd.read_csv("mesures.csv", parse_dates=['timestamp'], index_col='timestamp')

# Ajuster le modèle ARIMA
model = ARIMA(df['temperature'], order=(2, 1, 2))
result = model.fit()
print(result.summary())

# Prévision sur les 24 prochaines heures
forecast = result.forecast(steps=24)
```

### Compression de données

Pour les systèmes embarqués avec ressources limitées, compresser les données avant transmission réduit la consommation LoRa.

## Résultats et livrables

- Firmware STM32 pour acquisition et transmission LoRaWAN
- Pipeline Python d'analyse des séries temporelles (ARIMA, compression)
- Rapport technique et soutenance orale
- Dépôts Git : `s5-iot-dev/`, `sae-iot-dev/`

## Compétences développées

- Développement embarqué C sur STM32
- Configuration LoRaWAN (OTAA, clés de sécurité)
- Analyse de séries temporelles (ARIMA)
- Gestion de projet avec Git et planification

## Références

- Fichiers source : `sujet_3A_SAE.pdf`, `arma.pdf`, `compression.pdf`
- Notebook d'analyse : `timeseries_analysis.ipynb`
- Documentation STM32 : `STM32CubeWL/` (HAL, Drivers, Middlewares)
- Carte : `B-L072Z-LRWAN1` (STMicroelectronics)
