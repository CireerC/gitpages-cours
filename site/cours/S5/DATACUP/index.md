---
layout: course
title: "DATACUP — Défi pollution"
semestre: "S5"
type_cours: "projet"
tags: ["data science", "SQL", "GeoJSON", "pollution", "compétition"]
---

## Introduction

La **DATACUP** est un challenge de data science organisé à l'ESIROI. Le défi S5 portait sur l'analyse des données de pollution atmosphérique à La Réunion. L'objectif était d'explorer, visualiser et modéliser des concentrations de polluants à partir de données géospatiales.

## Contexte du défi

Les données fournies comprenaient :
- Des mesures de concentrations moyennes de polluants atmosphériques (NO₂, PM10, PM2.5, O₃...)
- Des données géolocalisées au format **GeoJSON** (`Concentrations_moyennes.geojson`)
- Une base de données SQL complète (`pollution_db.sql`)

## Architecture des données

### Base de données SQL

```sql
-- Structure typique de la base pollution
CREATE TABLE mesures (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    station_id  INT,
    date_mesure DATETIME,
    polluant    VARCHAR(20),
    valeur      FLOAT,
    unite       VARCHAR(10)
);

CREATE TABLE stations (
    id       INT PRIMARY KEY,
    nom      VARCHAR(100),
    latitude  DECIMAL(10,7),
    longitude DECIMAL(10,7),
    commune  VARCHAR(50)
);
```

### Format GeoJSON

Le GeoJSON est un format standard pour représenter des données géospatiales en JSON.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [55.4534, -21.1151]
      },
      "properties": {
        "station": "Saint-Denis Centre",
        "NO2_moy": 42.3,
        "PM10_moy": 18.7
      }
    }
  ]
}
```

## Pipeline d'analyse

### Étape 1 — Chargement et exploration

```python
import pandas as pd
import geopandas as gpd

# Charger les données géospatiales
gdf = gpd.read_file("Concentrations_moyennes.geojson")
print(gdf.head())
print(gdf.crs)  # système de coordonnées

# Charger les données SQL
import sqlalchemy
engine = sqlalchemy.create_engine("mysql+pymysql://user:pass@localhost/pollution_db")
df = pd.read_sql("SELECT * FROM mesures LIMIT 100", engine)
```

### Étape 2 — Nettoyage

```python
# Valeurs manquantes
gdf.isnull().sum()
gdf = gdf.dropna(subset=['NO2_moy'])

# Outliers
Q1, Q3 = gdf['NO2_moy'].quantile([0.25, 0.75])
IQR = Q3 - Q1
gdf_clean = gdf[(gdf['NO2_moy'] >= Q1 - 1.5*IQR) & 
                (gdf['NO2_moy'] <= Q3 + 1.5*IQR)]
```

### Étape 3 — Visualisation

```python
import matplotlib.pyplot as plt

# Carte de chaleur des concentrations
gdf_clean.plot(column='NO2_moy', cmap='YlOrRd', 
               legend=True, figsize=(12, 8))
plt.title("Concentrations moyennes en NO₂ à La Réunion")
plt.show()
```

## Polluants surveillés

| Polluant | Nom complet | Seuil OMS (24h) | Sources principales |
|----------|-------------|----------------|---------------------|
| NO₂ | Dioxyde d'azote | 25 µg/m³ | Trafic routier, industrie |
| PM10 | Particules < 10 µm | 45 µg/m³ | BTP, agriculture, feux |
| PM2.5 | Particules < 2.5 µm | 15 µg/m³ | Combustion, industrie |
| O₃ | Ozone troposphérique | 100 µg/m³ | Pollution photochimique |

## Résultats et livrables

- Analyse exploratoire des données de pollution réunionnaises
- Visualisations cartographiques des zones à risque
- Modèle de prédiction des pics de pollution
- Présentation orale des résultats (`eeee.pdf`)

## Compétences développées

- Manipulation de données géospatiales (GeoPandas, GeoJSON)
- Requêtes SQL sur base de données environnementales
- Visualisation cartographique avec Python
- Collaboration sous pression (format compétition)

## Références

- Fichiers source : `Concentrations_moyennes.geojson`, `pollution_db.sql`, `pollution_db_dump.sql`
- Documentation GeoPandas : `https://geopandas.org/`
- Seuils OMS : `https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health`
