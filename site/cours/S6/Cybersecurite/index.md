---
layout: course
title: "Cybersécurité"
semestre: "S6"
type_cours: "cybersécurité"
tags: ["CIA", "sécurité", "ISO 27001", "ingénierie sociale", "menaces"]
---

## Introduction

Ce cours aborde les fondements de la cybersécurité — le modèle CIA, les types de menaces, l'ingénierie sociale, les standards ISO et les bonnes pratiques de protection des systèmes d'information.

## Sécurité vs Sûreté

- **Sécurité** (*security*) : protection contre les **actes malveillants intentionnels** (attaques, intrusions, vol de données).
- **Sûreté** (*safety*) : protection contre les **accidents et défaillances non intentionnelles** (pannes, erreurs humaines).

## Le modèle CIA — Triade de la sécurité

Tout objectif de sécurité s'articule autour de trois piliers :

| Pilier | Définition | Menace associée |
|--------|-----------|----------------|
| **Confidentialité** | Accessible uniquement aux personnes autorisées | Fuite de données, interception |
| **Intégrité** | Non modifiable de façon non autorisée | Corruption, falsification |
| **Disponibilité** | Accessible aux personnes autorisées au bon moment | DoS, panne |

> **DoS** (Denial of Service) — attaque qui vise à rendre un service indisponible en le saturant de requêtes.
> **DDoS** (Distributed DoS) — même attaque, mais lancée depuis de nombreuses machines simultanément.

## Ingénierie sociale

L'**ingénierie sociale** (*social engineering*) exploite les failles humaines plutôt que techniques. Elle repose sur la manipulation psychologique pour obtenir des informations ou des accès.

### Techniques courantes

| Technique | Description |
|-----------|-------------|
| **Phishing** | Emails frauduleux imitant une organisation de confiance |
| **Vishing** | Phishing par appel téléphonique |
| **Pretexting** | Se faire passer pour quelqu'un d'autre (technicien, manager…) |
| **Baiting** | Laisser une clé USB infectée dans un lieu public |
| **Tailgating** | Suivre physiquement quelqu'un dans une zone sécurisée |

> L'ingénierie sociale est souvent plus efficace que les attaques techniques — **la faille principale est l'humain**.

### Contre-mesures

- Sensibilisation et formation des employés
- Procédures de vérification d'identité strictes
- Politique de "ne jamais communiquer de mot de passe par téléphone/email"
- Simulations d'attaques (phishing tests)

## Normes et référentiels

### ISO 2700x — Sécurité de l'information

| Norme | Contenu |
|-------|---------|
| **ISO 27001** | Système de Management de la Sécurité de l'Information (SMSI) — exigences |
| **ISO 27002** | Bonnes pratiques de sécurité — 93 mesures organisées en 4 thèmes |
| **ISO 27005** | Gestion des risques de sécurité |

**Certification ISO 27001** : démontre qu'une organisation a mis en place un SMSI conforme — valorisé commercialement et réglementairement.

### ISO 9000x — Qualité

Normes de management de la qualité (hors cybersécurité mais souvent requises conjointement).

## Types de menaces et d'attaques

### Attaques sur les mots de passe

```
Attaque par dictionnaire  → teste des mots courants
Attaque par force brute   → teste toutes les combinaisons
Rainbow table            → précalcul de hashes courants
```

**Contre-mesures :**
- Mots de passe longs (≥ 14 caractères), complexes
- Sel (*salt*) lors du hachage
- Authentification multi-facteurs (MFA)
- Limitation des tentatives de connexion

### Malwares

| Type | Comportement |
|------|-------------|
| **Virus** | Se propage en s'attachant à des fichiers légitimes |
| **Trojan** (Cheval de Troie) | Logiciel apparemment légitime, cache une backdoor |
| **Ransomware** | Chiffre les données et demande une rançon |
| **Backdoor** | Accès caché installé par un développeur malveillant |
| **Spyware** | Surveille l'activité de l'utilisateur discrètement |

### Attaques réseau

```
Man-in-the-Middle (MitM) : interception d'une communication
SQL Injection            : injection de code SQL dans un formulaire
XSS (Cross-Site Scripting): injection de JS malveillant dans une page web
CSRF                     : forcer le navigateur de la victime à exécuter des requêtes
```

## Défense en profondeur

La sécurité repose sur plusieurs couches — si une couche est franchie, les suivantes résistent.

```
Couche 1 : Physique    — contrôle d'accès, badges, CCTV
Couche 2 : Réseau      — pare-feu, IDS/IPS, VLAN
Couche 3 : Hôte        — antivirus, EDR, durcissement OS
Couche 4 : Application — authentification, MFA, RBAC
Couche 5 : Données     — chiffrement, backup, DLP
```

## Analyse de risques (EBIOS, MEHARI)

La gestion des risques suit ce cycle :

1. **Identifier** les actifs à protéger
2. **Identifier** les menaces et vulnérabilités
3. **Évaluer** le risque = Probabilité × Impact
4. **Traiter** : réduire, éviter, transférer (assurance), accepter
5. **Surveiller** en continu

## Résumé

- La sécurité repose sur trois piliers : **Confidentialité, Intégrité, Disponibilité** (CIA).
- L'ingénierie sociale exploite l'humain — la technique seule ne suffit pas.
- ISO 27001 est le standard international de management de la sécurité de l'information.
- La défense en profondeur multiplier les couches de protection — aucune couche n'est infaillible seule.

## Références

- Cours Cybersécurité — Tahir, S6 2024-2025
- Fichiers source : `2025-02-06.md`, `2025-02-14.md`
- Référentiel ANSSI : `https://cyber.gouv.fr/`
