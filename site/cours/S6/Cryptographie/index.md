---
layout: course
title: "Cryptographie"
semestre: "S6"
type_cours: "cybersécurité"
tags: ["AES", "RSA", "Diffie-Hellman", "certificats", "hachage"]
---

## Introduction

Ce cours couvre les fondements théoriques et pratiques de la cryptographie moderne — chiffrement symétrique (AES), asymétrique (RSA, DH), fonctions de hachage, signatures et certificats numériques.

## Cryptographie symétrique

En cryptographie symétrique, **la même clé** sert à chiffrer et à déchiffrer. Le défi est l'échange sécurisé de cette clé.

### Chiffrement par blocs

Les données sont découpées en blocs de taille fixe avant chiffrement.

| Algorithme | Taille de bloc | Taille de clé |
|-----------|---------------|--------------|
| DES | 64 bits | 56 bits (obsolète) |
| 3DES | 64 bits | 112/168 bits |
| AES | 128 bits | 128/192/256 bits |

### Modes d'opération AES

| Mode | Description | Problème / Avantage |
|------|-------------|---------------------|
| **ECB** | Chaque bloc chiffré indépendamment avec la même clé | ⚠️ Périodicité visible — deux blocs identiques → deux cryptogrammes identiques |
| **CBC** | XOR entre chaque bloc et le précédent avant chiffrement | Masque la répétition, mais erreur en cascade |
| **GCM** | Compteur + authentification intégrée | Chiffrement authentifié — le plus recommandé |

> **Exemple ECB vulnérable** : dans une image chiffrée en ECB, les zones de même couleur restent reconnaissables car les blocs identiques produisent les mêmes cryptogrammes.

### Structure interne d'AES

Un bloc AES de 128 bits = 16 octets = matrice 4×4.

Chaque **tour** (round) applique 4 transformations :
1. **SubBytes** — substitution par une S-box (non-linéarité)
2. **ShiftRows** — décalage cyclique des lignes (transposition)
3. **MixColumns** — mélange matriciel des colonnes (diffusion)
4. **AddRoundKey** — XOR avec la sous-clé du tour

Le but est de maximiser l'**entropie** (désordre) — un seul bit modifié en entrée doit modifier ~50% des bits en sortie.

## Cryptographie asymétrique

Deux clés complémentaires : **clé publique** (partageable) et **clé privée** (secrète). Il est computationnellement impossible de dériver la clé privée à partir de la publique.

### Usages

| Usage | Chiffrement avec | Déchiffrement avec |
|-------|-----------------|-------------------|
| **Confidentialité** | Clé publique du destinataire | Clé privée du destinataire |
| **Signature/Authenticité** | Clé privée de l'expéditeur | Clé publique de l'expéditeur |

### RSA — Génération des clés

1. Choisir deux grands nombres premiers $p$ et $q$
2. Calculer $n = p \times q$ et $\phi(n) = (p-1)(q-1)$
3. Choisir $e$ tel que $\gcd(e, \phi(n)) = 1$ (souvent $e = 65537$)
4. Calculer $d$ tel que $e \cdot d \equiv 1 \pmod{\phi(n)}$

**Clé publique** : $(n, e)$ — **Clé privée** : $(n, d)$

**Chiffrement** : $c = m^e \pmod{n}$

**Déchiffrement** : $m = c^d \pmod{n}$

```python
# Chiffrement RSA en Python
c = pow(m, e, n)   # chiffre m avec (e, n)
m = pow(c, d, n)   # déchiffre c avec (d, n)
```

**Exemple TD :**
- $n = 115$, $\phi(n) = 88$, $e = 9$ → **clé publique** $(115, 9)$
- $d = 49$ car $9 \times 49 \equiv 1 \pmod{88}$ → **clé privée** $(115, 49)$
- Chiffrer $m = 12$ : $c = 12^9 \pmod{115} = 27$
- Déchiffrer $c = 2$ : $m = 2^{49} \pmod{115} = 32$

### Algorithme de Diffie-Hellman (DH)

DH permet à deux parties d'établir une clé secrète partagée sur un canal non sécurisé, sans jamais transmettre la clé elle-même.

**Paramètres publics** : $g$ (racine primitive), $p$ (nombre premier)

**Protocole :**

| Étape | Alice | Bob |
|-------|-------|-----|
| Paramètres publics | $g=5$, $p=23$ | $g=5$, $p=23$ |
| Secret privé | $X_A = 6$ | $X_B = 15$ |
| Calcul | $Y_A = 5^6 \pmod{23} = 8$ | $Y_B = 5^{15} \pmod{23} = 19$ |
| Échange | envoie $Y_A = 8$ | envoie $Y_B = 19$ |
| Clé partagée | $K = 19^6 \pmod{23}$ | $K = 8^{15} \pmod{23}$ |

Alice et Bob obtiennent la **même clé secrète** $K$ — un intermédiaire qui observe $g$, $p$, $Y_A$, $Y_B$ ne peut pas retrouver $K$ facilement (problème du logarithme discret).

## Fonctions de hachage

Une fonction de hachage transforme une donnée quelconque en une empreinte de taille fixe.

**Propriétés requises :**
- **Résistance à la préimage** : impossible de retrouver $x$ depuis $h(x)$
- **Résistance aux collisions** : impossible de trouver $x \neq y$ avec $h(x) = h(y)$
- **Effet avalanche** : 1 bit modifié → ~50% des bits du hash changent

| Algorithme | Taille sortie | Statut |
|-----------|--------------|--------|
| MD5 | 128 bits | ❌ Cassé — collisions connues |
| SHA-1 | 160 bits | ❌ Cassé en 2017 |
| SHA-256 | 256 bits | ✅ Recommandé |
| SHA-512 | 512 bits | ✅ Recommandé |

**Stockage des mots de passe Linux** (`/etc/shadow`) :

```
$1$  → MD5    (obsolète)
$5$  → SHA-256
$6$  → SHA-512  (recommandé)
```

Le **sel** (*salt*) est une valeur aléatoire ajoutée avant hachage — protège contre les attaques par table arc-en-ciel.

## Certificats numériques (PKI)

Un certificat numérique lie une clé publique à une identité, signé par une **Autorité de Certification (CA)** de confiance.

**Structure d'un certificat X.509 :**
- Sujet (nom du propriétaire)
- Clé publique du sujet
- Émetteur (CA)
- Signature de la CA
- Date de validité

```bash
# Générer une clé RSA et un certificat auto-signé
openssl genrsa -out private.pem 2048
openssl req -new -x509 -key private.pem -out cert.pem -days 365
```

## Post-Quantique

L'algorithme de **Shor** (quantique) casse RSA en temps polynomial. Le NIST standardise des algorithmes résistants aux ordinateurs quantiques (CRYSTALS-Kyber, CRYSTALS-Dilithium).

## Résumé

- AES en mode **GCM** est le standard de chiffrement symétrique moderne — toujours utiliser des modes authentifiés.
- RSA est asymétrique et lent — utilisé pour **échanger des clés AES** ou **signer**.
- DH permet l'échange de clé sans jamais transmettre la clé — fondement de TLS.
- Les mots de passe ne se chiffrent pas — ils se **hachent** avec un sel.

## Références

- Cours Cryptographie, S6 2024-2025
- Fichiers source : `PRISE DE NOTES COURS.md`, `TP1 Cryptographie Eric Sylvain.md`, `TP Grouffaud.md`
- Standard AES : `https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf`
