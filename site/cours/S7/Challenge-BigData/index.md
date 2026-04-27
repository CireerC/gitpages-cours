---
layout: course
title: "Challenge Données Massives"
semestre: "S7"
type_cours: "projet"
tags: ["challenge", "big data", "Spark", "Hadoop", "data engineering", "pipeline", "visualisation", "compétition"]
---

## Présentation du projet

Le **Challenge Données Massives** est un projet compétitif en équipe qui met en pratique les compétences du cours Systèmes de Données Massives (S7). Les équipes doivent ingérer, traiter et analyser un jeu de données volumineux pour répondre à une problématique métier, puis présenter leurs résultats devant un jury.

---

## Format et organisation

| Aspect | Détails |
|--------|---------|
| **Durée** | 4-6 semaines (selon session) |
| **Équipes** | 3-5 étudiants |
| **Données** | Jeu de données réel fourni (>1 Go) |
| **Livrable 1** | Pipeline de traitement documenté |
| **Livrable 2** | Dashboard de visualisation |
| **Livrable 3** | Rapport technique (10-15 pages) |
| **Soutenance** | 15 min présentation + 10 min questions |

---

## Stack technologique

### Pipeline de référence

```
Données brutes (CSV, JSON, Parquet)
        │
        ▼
[Ingestion — Apache Kafka / HDFS]
        │
        ▼
[Traitement — Apache Spark (PySpark)]
        │ transformations, agrégations, ML
        ▼
[Stockage — Parquet / Delta Lake / PostgreSQL]
        │
        ▼
[Visualisation — Grafana / Metabase / Plotly Dash]
        │
        ▼
[Présentation des insights]
```

### PySpark — Exemple de pipeline complet

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.clustering import KMeans

# Initialiser Spark
spark = SparkSession.builder \
    .appName("Challenge BigData") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.shuffle.partitions", "200") \
    .getOrCreate()

# ─────────────────────────────────────
# 1. INGESTION
# ─────────────────────────────────────
df = spark.read \
    .option("header", True) \
    .option("inferSchema", True) \
    .csv("hdfs:///data/transactions/*.csv")

print(f"Nombre de lignes : {df.count():,}")
df.printSchema()

# ─────────────────────────────────────
# 2. NETTOYAGE
# ─────────────────────────────────────
df_clean = df \
    .dropDuplicates(["transaction_id"]) \
    .dropna(subset=["user_id", "amount", "timestamp"]) \
    .filter(F.col("amount") > 0) \
    .withColumn("amount",   F.col("amount").cast(DoubleType())) \
    .withColumn("date",     F.to_date("timestamp")) \
    .withColumn("hour",     F.hour("timestamp")) \
    .withColumn("day_week", F.dayofweek("timestamp"))

# ─────────────────────────────────────
# 3. ANALYSE EXPLORATOIRE
# ─────────────────────────────────────
# Statistiques descriptives
df_clean.describe("amount").show()

# Distribution temporelle
df_clean.groupBy("hour") \
    .agg(F.count("*").alias("nb_transactions"),
         F.sum("amount").alias("total_amount"),
         F.avg("amount").alias("avg_amount")) \
    .orderBy("hour") \
    .show()

# Top 10 utilisateurs par volume
df_clean.groupBy("user_id") \
    .agg(F.count("*").alias("nb_tx"),
         F.sum("amount").alias("total_spent")) \
    .orderBy(F.desc("total_spent")) \
    .limit(10) \
    .show()

# ─────────────────────────────────────
# 4. FEATURE ENGINEERING
# ─────────────────────────────────────
user_features = df_clean.groupBy("user_id").agg(
    F.count("*").alias("nb_transactions"),
    F.sum("amount").alias("total_amount"),
    F.avg("amount").alias("avg_amount"),
    F.stddev("amount").alias("std_amount"),
    F.max("amount").alias("max_amount"),
    F.countDistinct("category").alias("nb_categories"),
    F.countDistinct("date").alias("active_days"),
)

# ─────────────────────────────────────
# 5. ML — SEGMENTATION PAR K-MEANS
# ─────────────────────────────────────
feature_cols = ["nb_transactions", "total_amount", "avg_amount",
                "nb_categories", "active_days"]

assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
scaler    = StandardScaler(inputCol="features", outputCol="scaled_features")

assembled = assembler.transform(user_features.dropna())
scaler_model = scaler.fit(assembled)
scaled = scaler_model.transform(assembled)

kmeans = KMeans(k=4, featuresCol="scaled_features",
                predictionCol="segment", seed=42)
model  = kmeans.fit(scaled)
result = model.transform(scaled)

# Profil de chaque segment
result.groupBy("segment").agg(
    F.count("*").alias("nb_users"),
    F.avg("nb_transactions").alias("avg_tx"),
    F.avg("total_amount").alias("avg_spent"),
    F.avg("nb_categories").alias("avg_categories")
).orderBy("segment").show()

# ─────────────────────────────────────
# 6. EXPORT
# ─────────────────────────────────────
result.select("user_id", "segment") \
    .write \
    .mode("overwrite") \
    .parquet("hdfs:///output/user_segments/")
```

---

## Dashboard de visualisation

### Plotly Dash (Python)

```python
import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd

# Charger les données pré-agrégées (depuis Spark)
df = pd.read_parquet("data/hourly_stats.parquet")
segments = pd.read_parquet("data/user_segments.parquet")

app = dash.Dash(__name__, title="Challenge BigData Dashboard")

app.layout = html.Div([
    html.H1("Analyse des Transactions", style={"textAlign": "center"}),

    # Filtre de date
    dcc.DatePickerRange(
        id="date-filter",
        start_date=df["date"].min(),
        end_date=df["date"].max()
    ),

    # Graphiques
    html.Div([
        dcc.Graph(id="hourly-volume"),
        dcc.Graph(id="segment-pie"),
    ], style={"display": "flex", "gap": "20px"}),

    dcc.Graph(id="daily-trend"),
])

@app.callback(
    Output("hourly-volume", "figure"),
    Input("date-filter", "start_date"),
    Input("date-filter", "end_date")
)
def update_hourly(start, end):
    filtered = df[(df["date"] >= start) & (df["date"] <= end)]
    hourly = filtered.groupby("hour")["amount"].sum().reset_index()
    return px.bar(hourly, x="hour", y="amount",
                  title="Volume par heure",
                  color_discrete_sequence=["#6366f1"])

if __name__ == "__main__":
    app.run_server(debug=True, port=8050)
```

---

## Structure du rapport technique

```
1. INTRODUCTION ET CONTEXTE
   - Présentation du jeu de données (source, format, volume)
   - Problématique et objectifs

2. ARCHITECTURE ET PIPELINE
   - Choix technologiques et justifications
   - Schéma du pipeline de données
   - Configuration de l'environnement

3. ANALYSE EXPLORATOIRE (EDA)
   - Statistiques descriptives
   - Distribution des variables clés
   - Corrélations et patterns identifiés

4. TRAITEMENT ET TRANSFORMATION
   - Nettoyage des données (valeurs manquantes, outliers)
   - Feature engineering
   - Optimisations Spark appliquées

5. RÉSULTATS ET INSIGHTS
   - Réponses à la problématique
   - Visualisations et interprétations
   - Modèle ML éventuel (métriques de performance)

6. DIFFICULTÉS ET SOLUTIONS
   - Problèmes techniques rencontrés
   - Compromis effectués

7. CONCLUSION ET PERSPECTIVES
```

---

## Optimisations Spark importantes

```python
# Persistance pour éviter de recalculer
from pyspark import StorageLevel
df_clean.persist(StorageLevel.MEMORY_AND_DISK)

# Broadcast join (petite table < 10 Mo)
categories = spark.read.csv("categories.csv", header=True)
df_joined = df_clean.join(F.broadcast(categories), "category_id")

# Éviter le shuffle avec repartition intelligente
df_partitioned = df_clean.repartition("user_id")  # co-locate par user

# Coalescer pour réduire les partitions avant écriture
df_clean.coalesce(10).write.parquet("output/")

# Activation de l'optimiseur adaptatif (AQE)
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
```

---

## Critères d'évaluation

| Critère | Points |
|---------|--------|
| Qualité du pipeline (robustesse, modularité) | 20 |
| Pertinence de l'analyse et des insights | 25 |
| Qualité du dashboard | 15 |
| Performances (temps de traitement, optimisations) | 15 |
| Rapport technique | 15 |
| Présentation orale | 10 |
| **Total** | **100** |
