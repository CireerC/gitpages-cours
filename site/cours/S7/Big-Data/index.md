---
layout: course
title: "Systèmes de données massives"
semestre: "S7"
type_cours: "data"
tags: ["Hadoop", "Spark", "MapReduce", "HDFS", "Kafka", "NoSQL", "big data", "streaming"]
---

## Introduction

Le Big Data désigne les volumes de données si importants ou complexes que les outils traditionnels de gestion de bases de données ne peuvent plus les traiter efficacement. Ce cours couvre les frameworks de traitement distribué et les bases de données NoSQL adaptées à ces volumes.

## Les 5 V du Big Data

| V | Description | Exemple |
|---|-------------|---------|
| **Volume** | Téraoctets à pétaoctets | Logs serveurs, transactions |
| **Vélocité** | Génération et traitement en temps réel | Flux Twitter, IoT |
| **Variété** | Structuré, semi-structuré, non structuré | CSV, JSON, images |
| **Véracité** | Qualité et fiabilité des données | Bruit, erreurs, données manquantes |
| **Valeur** | Valeur business extractible | Analyses, prédictions |

---

## Hadoop — Écosystème

### HDFS (Hadoop Distributed File System)

```
NameNode (maître)
    │
    ├── DataNode 1 (blocks 1,4,7...)
    ├── DataNode 2 (blocks 2,5,8...)
    └── DataNode 3 (blocks 3,6,9...)

Réplication par défaut : 3 copies
Taille de bloc : 128 MB (par défaut)
```

- **NameNode** : gère les métadonnées (namespace, localisation des blocs)
- **DataNode** : stocke les blocs de données réels
- **Tolérance aux pannes** : réplication automatique sur 3 nœuds

```bash
# Commandes HDFS
hdfs dfs -ls /user/hadoop/
hdfs dfs -put localfile.csv /data/input/
hdfs dfs -get /data/output/result.csv ./
hdfs dfs -mkdir /data/project
hdfs dfs -du -h /data/          # Taille des dossiers
hdfs fsck / -files -blocks      # Santé du système de fichiers
```

### MapReduce

Paradigme de traitement en 2 phases : **Map** (transformation parallèle) → **Reduce** (agrégation).

**Word Count en Java :**

```java
// Mapper
public class WordCountMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
    private final static IntWritable one = new IntWritable(1);
    private Text word = new Text();

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {
        String[] tokens = value.toString().toLowerCase().split("\\s+");
        for (String token : tokens) {
            word.set(token);
            context.write(word, one);
        }
    }
}

// Reducer
public class WordCountReducer extends Reducer<Text, Iterable<IntWritable>, Text, IntWritable> {
    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException {
        int sum = 0;
        for (IntWritable val : values) sum += val.get();
        context.write(key, new IntWritable(sum));
    }
}
```

---

## Apache Spark

Moteur de traitement distribué **en mémoire** — 100x plus rapide que Hadoop MapReduce pour certaines charges.

### Architecture

```
Driver Program (SparkContext)
        │
        ▼
    Cluster Manager (YARN / Kubernetes / Standalone)
        │
        ├── Executor 1 (Worker Node 1) — Tasks
        ├── Executor 2 (Worker Node 2) — Tasks
        └── Executor 3 (Worker Node 3) — Tasks
```

### RDD — Resilient Distributed Dataset

```python
from pyspark import SparkContext

sc = SparkContext("local[4]", "WordCount")

# Création RDD
lines = sc.textFile("hdfs://namenode/data/input.txt")

# Transformations (lazy — ne s'exécutent pas encore)
words    = lines.flatMap(lambda line: line.split(" "))
pairs    = words.map(lambda w: (w.lower(), 1))
counts   = pairs.reduceByKey(lambda a, b: a + b)
top10    = counts.sortBy(lambda x: -x[1]).take(10)

# Action (déclenche l'exécution)
counts.saveAsTextFile("hdfs://namenode/data/output")
sc.stop()
```

### Spark DataFrame & SQL

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg, when, regexp_replace
from pyspark.sql.types import IntegerType

spark = SparkSession.builder \
    .appName("AnalyseVentes") \
    .config("spark.sql.shuffle.partitions", "200") \
    .getOrCreate()

# Lecture
df = spark.read.json("hdfs://namenode/data/ventes.json")
df_csv = spark.read.csv("data.csv", header=True, inferSchema=True)

# Transformations
df_clean = df \
    .filter(col("montant") > 0) \
    .withColumn("montant_eur", col("montant_usd") * 0.92) \
    .withColumn("categorie",
        when(col("montant_eur") < 100, "petit")
        .when(col("montant_eur") < 1000, "moyen")
        .otherwise("grand")
    ) \
    .dropDuplicates(["order_id"])

# Agrégations
stats = df_clean.groupBy("region", "categorie") \
    .agg(
        count("*").alias("nb_commandes"),
        avg("montant_eur").alias("panier_moyen")
    ) \
    .orderBy(col("panier_moyen").desc())

# SQL
df_clean.createOrReplaceTempView("ventes")
top_regions = spark.sql("""
    SELECT region, SUM(montant_eur) as ca_total
    FROM ventes
    WHERE annee = 2024
    GROUP BY region
    ORDER BY ca_total DESC
    LIMIT 10
""")

stats.show(truncate=False)
stats.write.mode("overwrite").parquet("hdfs://namenode/output/stats")
```

### Spark Streaming

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, count
from pyspark.sql.types import StructType, StringType, TimestampType

spark = SparkSession.builder.appName("StreamingAnalytics").getOrCreate()

schema = StructType() \
    .add("user_id", StringType()) \
    .add("action", StringType()) \
    .add("timestamp", TimestampType())

# Lecture depuis Kafka
df_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "user-events") \
    .load() \
    .select(from_json(col("value").cast("string"), schema).alias("data")) \
    .select("data.*")

# Fenêtre glissante de 5 minutes
result = df_stream \
    .withWatermark("timestamp", "10 minutes") \
    .groupBy(window(col("timestamp"), "5 minutes", "1 minute"), "action") \
    .agg(count("*").alias("nb_events"))

query = result.writeStream \
    .outputMode("update") \
    .format("console") \
    .trigger(processingTime='30 seconds') \
    .start()

query.awaitTermination()
```

---

## Apache Kafka

Plateforme de streaming distribuée, haute-disponibilité, pub/sub.

### Architecture

```
Producer ──► Topic (partitions) ──► Consumer Group
              │
              ├── Partition 0 (répliqué sur 3 brokers)
              ├── Partition 1
              └── Partition 2

Broker 1 (Leader partition 0)
Broker 2 (Leader partition 1, replica partition 0)
Broker 3 (Leader partition 2, replica partition 1)
ZooKeeper → Coordination du cluster (remplacé par KRaft en Kafka 3.x)
```

```bash
# Créer un topic
kafka-topics.sh --create --topic user-events \
  --bootstrap-server kafka:9092 \
  --partitions 6 \
  --replication-factor 3

# Producer console
kafka-console-producer.sh --topic user-events --bootstrap-server kafka:9092
> {"user":"alice","action":"login","ts":"2024-01-01T10:00:00"}

# Consumer console
kafka-console-consumer.sh --topic user-events \
  --from-beginning \
  --bootstrap-server kafka:9092

# Informations sur le topic
kafka-topics.sh --describe --topic user-events --bootstrap-server kafka:9092
```

---

## Bases NoSQL

### Comparatif

| Type | Exemples | Structure | Usage |
|------|---------|-----------|-------|
| Document | MongoDB, CouchDB | JSON/BSON | CMS, catalogues, profils |
| Clé-valeur | Redis, DynamoDB | Map | Cache, sessions, compteurs |
| Colonne large | Cassandra, HBase | Colonne par rowkey | IoT, analytics, logs |
| Graphe | Neo4j, ArangoDB | Nœuds + arêtes | Réseaux sociaux, fraude |

### MongoDB

```javascript
// Connexion et CRUD
const db = db.getSiblingDB("ecommerce");

// Insert
db.commandes.insertMany([
  { user: "alice", produits: ["A1", "B2"], montant: 45.90, date: new Date() },
  { user: "bob",   produits: ["C3"],       montant: 12.00, date: new Date() }
]);

// Query
db.commandes.find({ montant: { $gt: 20 } }).sort({ date: -1 }).limit(10);
db.commandes.find({ produits: "A1" });  // Array contains

// Agrégation
db.commandes.aggregate([
  { $match: { date: { $gte: ISODate("2024-01-01") } } },
  { $group: { _id: "$user", total: { $sum: "$montant" }, nb: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// Index
db.commandes.createIndex({ user: 1, date: -1 });
```

### Redis

```bash
# Types de données Redis
SET session:user:1234 '{"name":"Alice","role":"admin"}' EX 3600   # String + TTL
HSET user:1234 name "Alice" email "alice@example.com"              # Hash
LPUSH queue:tasks "tâche1" "tâche2"                                # Liste
SADD tags:article:42 "python" "ml" "bigdata"                       # Set
ZADD leaderboard 1500 "alice" 1200 "bob"                           # Sorted Set

# Pub/Sub
PUBLISH canal:alertes '{"level":"WARN","msg":"CPU > 90%"}'
SUBSCRIBE canal:alertes

# Pipeline (batch de commandes)
redis-cli --pipe << 'EOF'
SET k1 v1
SET k2 v2
SET k3 v3
EOF
```

### Cassandra

```sql
-- Keyspace (espace de nommage)
CREATE KEYSPACE iot WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'datacenter1': 3
};

-- Table optimisée pour les requêtes time-series
CREATE TABLE iot.mesures (
  capteur_id  uuid,
  horodatage  timestamp,
  temperature float,
  humidite    float,
  PRIMARY KEY ((capteur_id), horodatage)
) WITH CLUSTERING ORDER BY (horodatage DESC);

-- Insertion
INSERT INTO iot.mesures (capteur_id, horodatage, temperature, humidite)
VALUES (uuid(), toTimestamp(now()), 22.5, 65.0);

-- Requête
SELECT * FROM iot.mesures
WHERE capteur_id = 123e4567-e89b-12d3-a456-426614174000
AND horodatage >= '2024-01-01' AND horodatage <= '2024-01-31'
LIMIT 1000;
```

---

## Théorème CAP

> Un système distribué ne peut garantir simultanément que **2 des 3 propriétés** : Cohérence, Disponibilité, Tolérance aux partitions.

```
          Cohérence (C)
              /\
             /  \
            /    \
    CA     /      \    CP
          /        \
         /    CP    \
        /──────────────\
 Disponibilité (A) ── Tolérance aux partitions (P)
        AP

CA : RDBMS (MySQL, PostgreSQL) — pas de partition
CP : MongoDB, HBase, ZooKeeper — cohérence avant tout
AP : Cassandra, CouchDB, DynamoDB — disponibilité avant tout
```

---

## Résumé

| Framework | Type | Points forts | Cas d'usage |
|-----------|------|-------------|-------------|
| HDFS | Stockage distribué | Tolérance aux pannes | Stockage fichiers volumineux |
| MapReduce | Batch | Simple, robuste | ETL, word count |
| Spark | Batch + Stream | Mémoire, polyvalent | ML, analytics temps réel |
| Kafka | Streaming | Haut débit, durable | Event bus, pipelines |
| MongoDB | NoSQL doc | Flexible, BSON | APIs, CMS |
| Redis | NoSQL KV | Ultra-rapide | Cache, sessions |
| Cassandra | NoSQL col | Scalabilité linéaire | IoT, logs, time-series |
