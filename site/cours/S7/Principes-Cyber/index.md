---
layout: course
title: "Principes de la cybersécurité"
semestre: "S7"
type_cours: "cybersec"
tags: ["CIA triad", "ANSSI", "ISO 27001", "OWASP", "threat modeling", "MITRE ATT&CK", "EBIOS", "kill chain"]
---

## Introduction

Ce cours pose les bases conceptuelles et méthodologiques de la cybersécurité : modèles de sécurité, gestion des risques, cadres de référence et cycle de vie des attaques.

---

## Triade CIA et extensions

### Triade fondamentale

| Propriété | Description | Menaces associées |
|-----------|-------------|-----------------|
| **Confidentialité** | Seules les personnes autorisées accèdent à l'information | Interception, vol de données, espionnage |
| **Intégrité** | L'information n'est pas modifiée de façon non autorisée | Falsification, injection, MITM |
| **Disponibilité** | L'information est accessible quand nécessaire | DDoS, ransomware, panne |

### Extensions (AAA + Non-répudiation)

- **Authentification** : vérifier l'identité ("es-tu bien qui tu prétends être ?")
- **Autorisation** : vérifier les droits ("as-tu le droit d'accéder à ceci ?")
- **Auditabilité** : tracer toutes les actions
- **Non-répudiation** : impossibilité de nier une action (signature numérique)

---

## Classification des données

| Niveau | Description | Exemple |
|--------|-------------|---------|
| **Public** | Diffusable librement | Site web, plaquettes |
| **Interne** | Usage interne seulement | Procédures internes |
| **Confidentiel** | Accès restreint | Données RH, contrats |
| **Secret / Critique** | Impact grave si divulgué | R&D, données médicales |

---

## Threat Modeling — STRIDE

**STRIDE** (Microsoft) : 6 catégories de menaces.

| Lettre | Menace | Propriété CIA compromise |
|--------|--------|--------------------------|
| **S** | Spoofing (usurpation d'identité) | Authentification |
| **T** | Tampering (altération) | Intégrité |
| **R** | Repudiation (répudiation) | Non-répudiation |
| **I** | Information Disclosure (divulgation) | Confidentialité |
| **D** | Denial of Service | Disponibilité |
| **E** | Elevation of Privilege | Autorisation |

### Processus d'analyse

```
1. Décomposer le système (DFD — Data Flow Diagram)
   ├── Acteurs externes
   ├── Processus
   ├── Stockages de données
   └── Flux de données

2. Identifier les assets et trust boundaries

3. Appliquer STRIDE à chaque composant

4. Évaluer la sévérité (DREAD : Damage, Reproducibility,
   Exploitability, Affected users, Discoverability)

5. Définir les contre-mesures
```

---

## MITRE ATT&CK

Référentiel de **Tactiques, Techniques et Procédures (TTP)** des attaquants réels.

### Structure (Enterprise Matrix)

```
Reconnaissance → Resource Development → Initial Access → Execution
→ Persistence → Privilege Escalation → Defense Evasion
→ Credential Access → Discovery → Lateral Movement
→ Collection → Command & Control → Exfiltration → Impact
```

### Exemples de techniques

| ID | Technique | Tactique |
|----|-----------|---------|
| T1566.001 | Phishing — Spearphishing Attachment | Initial Access |
| T1059.001 | PowerShell | Execution |
| T1547.001 | Registry Run Keys | Persistence |
| T1055 | Process Injection | Defense Evasion |
| T1003.001 | LSASS Memory (Mimikatz) | Credential Access |
| T1021.002 | SMB/Windows Admin Shares | Lateral Movement |
| T1486 | Data Encrypted for Impact (ransomware) | Impact |

> MITRE ATT&CK Navigator permet de visualiser les TTP d'un groupe APT et de mapper les contrôles de sécurité.

---

## OWASP Top 10 (2021)

| Rang | Catégorie | Description |
|------|-----------|-------------|
| A01 | Broken Access Control | Contrôle d'accès insuffisant (IDOR, privilege escalation) |
| A02 | Cryptographic Failures | Mauvais algorithmes, absence de chiffrement |
| A03 | Injection | SQL, LDAP, OS command injection |
| A04 | Insecure Design | Défauts architecturaux |
| A05 | Security Misconfiguration | Config par défaut, ports ouverts, verbose errors |
| A06 | Vulnerable & Outdated Components | Dépendances avec CVE connues |
| A07 | Authentication Failures | Mots de passe faibles, session fixation |
| A08 | Integrity Failures | Désérialisation non sécurisée, CI/CD |
| A09 | Logging & Monitoring Failures | Absence de détection |
| A10 | Server-Side Request Forgery | Appels vers des ressources internes |

---

## Gestion des risques — EBIOS RM

**EBIOS Risk Manager** (ANSSI, 2018) — méthode française de gestion des risques cyber.

### 5 ateliers

```
Atelier 1 : Cadrage et socle de sécurité
           → Périmètre, valeurs métier, biens supports, exigences de sécurité

Atelier 2 : Sources de risque
           → Identification des attaquants potentiels (État, cybercriminel,
             concurrent, initié...) et leurs objectifs

Atelier 3 : Scénarios stratégiques
           → Chemins d'attaque haut niveau (ex: compromettre le SI
             via un prestataire)

Atelier 4 : Scénarios opérationnels
           → Séquences d'attaque détaillées, probabilité, gravité

Atelier 5 : Traitement du risque
           → Mesures de sécurité, risques résiduels, plan d'action
```

### Évaluation des risques

```
Risque = Vraisemblance × Gravité

Vraisemblance (1-4) : probabilité que le scénario se réalise
Gravité (1-4)       : impact sur les valeurs métier

Matrice de risque :
         Gravité
         1   2   3   4
Vrais. 1 |F  |F  |M  |M  |
       2 |F  |M  |M  |E  |
       3 |M  |M  |E  |E  |
       4 |M  |E  |E  |E  |

F=Faible, M=Modéré, E=Élevé
```

---

## Cyber Kill Chain (Lockheed Martin)

```
1. Reconnaissance      Collecte d'informations sur la cible
         │
         ▼
2. Weaponization       Création de l'outil d'attaque (malware + exploit)
         │
         ▼
3. Delivery            Envoi du vecteur d'attaque (email, USB, drive-by)
         │
         ▼
4. Exploitation        Exécution de l'exploit (CVE, 0-day, social engineering)
         │
         ▼
5. Installation        Installation d'un backdoor/RAT
         │
         ▼
6. C2 (Command & Control) Établissement du canal de communication
         │
         ▼
7. Actions on Objectives  Exfiltration, chiffrement, destruction
```

> **Stratégie défensive :** bloquer ou détecter le plus tôt possible dans la kill chain. Bloquer à l'étape 3 est bien ; bloquer à l'étape 1 (empêcher la reconnaissance) est encore mieux.

---

## ISO 27001 — SMSI

**Système de Management de la Sécurité de l'Information** — certification internationale.

### Structure (cycle PDCA)

```
Plan  : Définir le périmètre, politique, évaluation des risques
Do    : Mettre en œuvre les contrôles (Annexe A — 93 contrôles)
Check : Audit interne, mesure des indicateurs
Act   : Actions correctives, amélioration continue
```

### Annexe A — Quelques contrôles

| Domaine | Exemples |
|---------|---------|
| Politiques de sécurité | Politique SSI, revue périodique |
| Contrôle d'accès | RBAC, MFA, revue des droits |
| Cryptographie | Politique de chiffrement, gestion des clés |
| Sécurité physique | Contrôle d'accès datacenter, clean desk |
| Relations fournisseurs | Évaluation, contrats, audits |
| Gestion des incidents | Procédure de réponse, notification CNIL |
| Continuité d'activité | PCA, PRA, tests de restauration |

---

## Résumé

| Framework | Origine | Usage principal |
|-----------|---------|----------------|
| CIA Triad | Universel | Bases conceptuelles |
| STRIDE | Microsoft | Threat modeling |
| MITRE ATT&CK | MITRE | TTP attaquants, détection |
| OWASP Top 10 | OWASP | Sécurité applicative web |
| EBIOS RM | ANSSI | Gestion des risques (France) |
| ISO 27001 | ISO | Certification SMSI |
| Cyber Kill Chain | Lockheed | Modélisation des attaques |
