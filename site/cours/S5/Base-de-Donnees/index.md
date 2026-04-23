---
layout: course
title: "Bases de données"
semestre: "S5"
type_cours: "dev"
tags: ["SQL", "MySQL", "modèle relationnel", "jointures"]
---

## Introduction

Ce cours couvre la conception de bases de données relationnelles et le langage SQL — de la création de tables aux requêtes avancées avec jointures, agrégats et sous-requêtes.

## Le modèle relationnel

Une base de données relationnelle organise les données en **tables** (relations). Chaque table est définie par :
- Un **nom**
- Des **attributs** (colonnes) avec leur type et contraintes
- Une **clé primaire** (PRIMARY KEY) — identifiant unique de chaque ligne
- Des **clés étrangères** (FOREIGN KEY) — références vers d'autres tables

### Exemple : base Vins

```sql
CREATE TABLE VINS (
  Num      SMALLINT(5) PRIMARY KEY,
  Cru      VARCHAR(40),
  Degre    DECIMAL(4,2) CHECK (Degre BETWEEN 10 AND 13),
  Annee    SMALLINT(5)
);

CREATE TABLE PRODUCTEURS (
  Num      INT(5) PRIMARY KEY,
  Nom      VARCHAR(40),
  Prenom   VARCHAR(40),
  Region   VARCHAR(40)
);

CREATE TABLE RECOLTES (
  NProd    INT(5),
  NVin     INT(5),
  Quantite INT(5) CHECK (Quantite < 1000),
  PRIMARY KEY (NProd, NVin),
  FOREIGN KEY (NProd) REFERENCES PRODUCTEURS(Num),
  FOREIGN KEY (NVin)  REFERENCES VINS(Num)
);
```

## SQL — Requêtes fondamentales

### SELECT, FROM, WHERE

```sql
-- Sélectionner des colonnes spécifiques
SELECT Cru, Annee FROM VINS;

-- Filtrer avec WHERE
SELECT * FROM VINS WHERE Annee > 1979;

-- Correspondance de motif (LIKE)
SELECT * FROM VINS WHERE Cru LIKE 'C%s';

-- Plusieurs conditions
SELECT * FROM VINS WHERE Num = 42 OR Num = 14 OR Num = 19;
```

### Fonctions d'agrégation

```sql
SELECT AVG(Degre) FROM VINS;            -- moyenne des degrés
SELECT MAX(Annee), MIN(Annee) FROM VINS; -- année max et min
SELECT COUNT(Titre) AS TOTAL_JOURNAL FROM JOURNAL;
```

### GROUP BY et HAVING

```sql
-- Quantité totale et moyenne par vin
SELECT NVin, SUM(Quantite), AVG(Quantite)
FROM RECOLTES
GROUP BY NVin;

-- Filtrer les groupes (HAVING ≠ WHERE)
SELECT NVin, COUNT(*)
FROM RECOLTES
GROUP BY NVin
HAVING COUNT(NVin) >= 3;
```

### Expressions conditionnelles (CASE)

```sql
SELECT Region, COUNT(NVin),
  CASE
    WHEN COUNT(NVin) > 20 THEN 'REGION RICHE'
    ELSE 'REGION PAUVRE'
  END AS Richesse
FROM PRODUCTEURS
JOIN RECOLTES ON Num = NProd
GROUP BY Region;
```

### ORDER BY

```sql
SELECT Nom, Region FROM PRODUCTEURS ORDER BY Region;

SELECT Producteurs.Nom, Recoltes.Quantite
FROM PRODUCTEURS
INNER JOIN RECOLTES ON PRODUCTEURS.Num = RECOLTES.NProd
ORDER BY RECOLTES.Quantite;
```

## Jointures

### INNER JOIN (jointure interne)

Retourne uniquement les lignes qui ont une correspondance dans les deux tables.

```sql
SELECT DISTINCT LIVRAISON.CODE_J, JOURNAL.TITRE, NOM_DEP
FROM LIVRAISON
JOIN DEPOT   ON LIVRAISON.N_DEP  = DEPOT.N_DEP
JOIN JOURNAL ON LIVRAISON.CODE_J = JOURNAL.CODE_J
WHERE DEPOT.NOM_DEP = 'Les Brasseurs';
```

### Exemple avancé — sous-requête

```sql
-- Journaux dont le prix est plus du double du moins cher
SELECT CODE_J, TITRE
FROM JOURNAL
WHERE PRIX > 2 * (SELECT MIN(PRIX) FROM JOURNAL);

-- Dépôts qui reçoivent TOUS les journaux
SELECT DEPOT.N_DEP
FROM DEPOT
JOIN LIVRAISON ON DEPOT.N_DEP = LIVRAISON.N_DEP
GROUP BY DEPOT.N_DEP
HAVING COUNT(DISTINCT LIVRAISON.CODE_J) = (SELECT COUNT(*) FROM JOURNAL);
```

## Manipulation des données (DML)

```sql
-- INSERT
INSERT INTO VINS(Num, Cru, Degre, Annee)
VALUES (6, 'Mercurey', 11.2, 1981);

-- UPDATE
UPDATE VINS SET Degre = Degre + 1 WHERE Num = 41;

-- DELETE
DELETE FROM VINS WHERE Num = 200;
```

## Modèle Entité-Association → Relationnel

Règles de conversion :

| Type d'association | Traduction en SQL |
|-------------------|-------------------|
| 1–N | Clé étrangère côté N |
| N–N | Table de liaison avec 2 clés étrangères |
| 1–1 | Clé étrangère d'un côté (ou fusion) |

## Résumé

- Toujours définir une clé primaire pour garantir l'unicité des lignes.
- `WHERE` filtre **les lignes** ; `HAVING` filtre **les groupes** (après GROUP BY).
- Les jointures (`JOIN`) combinent plusieurs tables — s'assurer que les conditions de jointure sont correctes pour éviter les produits cartésiens.
- Les sous-requêtes permettent d'exprimer des conditions complexes (quantification universelle, comparaison à un agrégat).

## Références

- Cours Bases de Données, S5 2024-2025
- Fichiers source : `FORSTER_ERIC_TP1.md`, `FORSTER_ERIC_TP2.md`, `FORSTER_ERIC_TP3.md`
- Supports : `2 - Le modèle relationnel.pdf`, `3 - SQL Partie 1.pdf`, `4 - SQL Partie 2.pdf`
- Aide-mémoire : `mysql-aide-memoire-sql.pdf`
