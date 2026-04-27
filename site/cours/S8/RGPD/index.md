---
layout: course
title: "RGPD et Cybersécurité"
semestre: "S8"
type_cours: "tronc"
tags: ["RGPD", "GDPR", "DPO", "DPIA", "données personnelles", "CNIL", "cybersécurité", "consentement", "vie privée"]
---

## Introduction

Le **Règlement Général sur la Protection des Données (RGPD)** — ou GDPR en anglais — est le règlement européen (UE 2016/679) entré en vigueur le 25 mai 2018. Il harmonise la protection des données personnelles dans l'UE et impose des obligations aux organisations traitant ces données.

**Champ d'application** : toute organisation qui traite des données de personnes situées dans l'UE, quel que soit son pays d'établissement (**extraterritorialité**).

---

## Concepts fondamentaux

### Définitions clés

| Terme | Définition |
|-------|-----------|
| **Donnée personnelle** | Toute information permettant d'identifier directement ou indirectement une personne physique (nom, IP, empreinte, cookie...) |
| **Traitement** | Toute opération sur des données (collecte, stockage, utilisation, transfert, suppression...) |
| **Responsable de traitement (RT)** | Entité qui détermine les finalités et moyens du traitement |
| **Sous-traitant** | Entité traitant des données pour le compte du RT |
| **Personne concernée** | La personne physique dont les données sont traitées |
| **DPO** | Délégué à la Protection des Données |
| **DPIA** | Data Protection Impact Assessment (PIA en français) |

### Données sensibles (art. 9)

Catégories nécessitant une protection renforcée :
- Origine raciale ou ethnique
- Opinions politiques, convictions religieuses
- Données biométriques / génétiques (à des fins d'identification)
- Données de santé
- Vie ou orientation sexuelle
- Appartenance syndicale

> **Traitement interdit** sauf exceptions explicites (consentement explicite, intérêt public, médecine...).

---

## Les 7 principes fondamentaux (art. 5)

| Principe | Description | Application pratique |
|---------|-------------|---------------------|
| **Licéité** | Base légale requise | Consentement, contrat, obligation légale, intérêt légitime... |
| **Loyauté et transparence** | Information claire des personnes | Politique de confidentialité, mentions légales |
| **Limitation des finalités** | Collecte pour un but précis, non modifiable | Ne pas réutiliser les données pour autre chose |
| **Minimisation** | Collecter uniquement le nécessaire | Pas de champs inutiles dans les formulaires |
| **Exactitude** | Données à jour | Permettre la correction, MAJ régulières |
| **Limitation de conservation** | Durée limitée et définie | Politique de purge, archives |
| **Intégrité et confidentialité** | Sécurité des données | Chiffrement, contrôle d'accès, pseudonymisation |

**+ Responsabilité (Accountability)** : pouvoir prouver la conformité (art. 5.2).

---

## Bases légales du traitement (art. 6)

Il faut **une et une seule** base légale par traitement :

| Base légale | Conditions | Exemples |
|-------------|-----------|---------|
| **Consentement** | Libre, spécifique, éclairé, univoque, retirable | Newsletter, cookies non essentiels |
| **Contrat** | Nécessaire à l'exécution | Livraison adresse, facturation |
| **Obligation légale** | Imposée par la loi | Déclarations fiscales, RH |
| **Sauvegarde des intérêts vitaux** | Situation d'urgence | Données médicales urgentes |
| **Mission d'intérêt public** | Service public | Administration, recherche académique |
| **Intérêt légitime** | Intérêt proportionné, ne prévaut pas sur les droits | Lutte contre la fraude, sécurité IT interne |

---

## Droits des personnes concernées

| Droit | Article | Description |
|-------|---------|-------------|
| **Information** | 13-14 | Être informé de la collecte (mentions légales) |
| **Accès** | 15 | Obtenir une copie de ses données |
| **Rectification** | 16 | Corriger des données inexactes |
| **Effacement** (droit à l'oubli) | 17 | Supprimer ses données sous conditions |
| **Limitation** | 18 | Geler le traitement le temps d'un litige |
| **Portabilité** | 20 | Recevoir ses données dans un format lisible par machine |
| **Opposition** | 21 | S'opposer au traitement (marketing direct : absolu) |
| **Décision automatisée** | 22 | Refuser les décisions purement automatisées |

**Délai de réponse** : 1 mois (extensible à 3 mois si complexe).

---

## Le DPO — Délégué à la Protection des Données

### Désignation obligatoire (art. 37)

- **Organismes publics** (tous)
- Entreprises dont l'activité **principale** est un traitement à grande échelle de :
  - Données sensibles
  - Suivi systématique à grande échelle de personnes

### Missions du DPO (art. 39)

1. Informer et conseiller le RT et les employés
2. Contrôler le respect du RGPD en interne
3. Conseiller sur les DPIA
4. Coopérer avec la CNIL / autorité de contrôle
5. Être le point de contact pour les personnes concernées

> Le DPO ne peut pas être sanctionné pour avoir exercé ses missions. Il doit être indépendant.

---

## DPIA — Analyse d'impact (art. 35)

### Quand est-elle obligatoire ?

Traitement **susceptible d'engendrer un risque élevé** pour les droits et libertés :
- Évaluation/profilage systématique
- Traitement à grande échelle de données sensibles
- Surveillance systématique à grande échelle d'un espace public
- Croisement de données à grande échelle
- Données de personnes vulnérables (enfants, patients...)
- Nouvelles technologies (biométrie, IoT, IA)

### Contenu d'une DPIA

```
1. Description du traitement et de ses finalités
2. Évaluation de la nécessité et proportionnalité
3. Évaluation des risques pour les droits et libertés
   ├── Accès illégitime (confidentialité)
   ├── Modification non désirée (intégrité)
   └── Disparition des données (disponibilité)
4. Mesures envisagées pour faire face aux risques
5. Avis du DPO
6. Consultation préalable CNIL si risque résiduel élevé
```

---

## Registre des traitements (art. 30)

Obligatoire pour toutes les organisations (sauf PME < 250 personnes sans traitement risqué).

### Contenu minimal

```yaml
# Exemple d'entrée dans le registre
traitement:
  nom: "Gestion des candidatures RH"
  responsable: "Entreprise XYZ — DRH"
  finalite: "Recrutement et gestion des candidats"
  categories_personnes: "Candidats, employés"
  categories_donnees:
    - "Identité (nom, prénom, adresse)"
    - "CV (formation, expérience)"
    - "Email, téléphone"
  destinataires: "RH, managers, prestataire ATS"
  transferts_hors_UE: "Non"
  duree_conservation: "2 ans après le dernier contact"
  mesures_securite: "Accès restreint, chiffrement BD, logs"
```

---

## Sécurité des données (art. 32)

### Mesures techniques et organisationnelles

```python
# ✅ Chiffrement des données au repos
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)
encrypted = cipher.encrypt(b"donnee_sensible")

# ✅ Hachage des mots de passe (JAMAIS en clair)
import bcrypt
password = b"mot_de_passe_utilisateur"
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))

# ✅ Pseudonymisation — remplacer par un ID
import uuid
def pseudonymize(email: str, salt: str) -> str:
    import hashlib
    return hashlib.sha256((email + salt).encode()).hexdigest()[:16]

# ✅ Minimisation à la sélection SQL
# ❌ SELECT * FROM users WHERE id = ?
# ✅ SELECT first_name, email FROM users WHERE id = ?
```

### Mesures organisationnelles

| Mesure | Description |
|--------|-------------|
| **Politique MdP** | Complexité, rotation, pas de réutilisation |
| **Contrôle d'accès** | Principe du moindre privilège (RBAC) |
| **Traçabilité** | Logs d'accès aux données personnelles |
| **Formation** | Sensibilisation RGPD des employés |
| **Clause sous-traitance** | Contrat DPA (Data Processing Agreement) |
| **Gestion des incidents** | Procédure de notification de violation |

---

## Violation de données (art. 33-34)

### Procédure en cas de violation

```
DÉTECTION DE LA VIOLATION
        ↓
Évaluation du risque
  Faible → Documentation interne uniquement
  Élevé  →
        ↓ (dans les 72h)
Notification à la CNIL
  • Nature de la violation
  • Catégories et nombre de personnes/données concernées
  • Mesures prises
        ↓ (si risque élevé pour les personnes)
Notification aux personnes concernées
  • Dans les meilleurs délais
  • En langage clair
```

### Critères d'évaluation du risque

- Sensibilité des données (santé, finances, mots de passe...)
- Nombre de personnes concernées
- Facilité d'identification des personnes
- Conséquences potentielles (discrimination, fraude, réputation)

---

## Transferts hors UE (Chapitre V)

Pour transférer des données vers un pays tiers, il faut une garantie :

| Mécanisme | Description |
|-----------|-------------|
| **Décision d'adéquation** | Pays reconnu par la Commission UE (USA via Privacy Shield 2.0 / EU-US DPF, UK, Japon...) |
| **Clauses contractuelles types (CCT)** | Contrats standardisés validés par la Commission |
| **Règles d'entreprise contraignantes (BCR)** | Pour groupes multinationaux |
| **Consentement explicite** | Cas exceptionnels uniquement |

---

## Sanctions (art. 83)

| Niveau | Montant maximal | Infractions |
|--------|-----------------|-------------|
| **Niveau 1** | 10 M€ ou 2% CA mondial | Obligations DPO, registre, DPIA, notification |
| **Niveau 2** | 20 M€ ou 4% CA mondial | Principes fondamentaux, droits des personnes, transferts |

**Exemples réels :**
- Google (CNIL 2022) : 150 M€ (cookies)
- WhatsApp (IE DPC 2021) : 225 M€ (transparence)
- Amazon (LU 2021) : 746 M€ (consentement pub)
- Meta (IE DPC 2023) : 1,2 Md€ (transferts US)

---

## RGPD et développement logiciel

### Privacy by Design (art. 25)

**7 principes fondateurs :**
1. Proactif, pas réactif (anticiper)
2. Vie privée par défaut (paramètres stricts par défaut)
3. Vie privée intégrée à la conception
4. Fonctionnalité totale (pas de faux compromis)
5. Sécurité bout en bout
6. Visibilité et transparence
7. Respect de la vie privée des utilisateurs

### Checklist développeur

```
☐ Collecte minimale (formulaires épurés)
☐ Consentement explicite avant cookies non essentiels
☐ Politique de confidentialité accessible et compréhensible
☐ Mots de passe hachés (bcrypt/argon2)
☐ Données sensibles chiffrées en base
☐ Logs d'accès aux données personnelles
☐ Durée de conservation définie et automatisée
☐ Endpoint de suppression de compte
☐ Export des données (portabilité)
☐ Pas de logs contenant des données personnelles en clair
☐ Headers sécurité HTTP (HTTPS obligatoire, HSTS)
☐ DPA signé avec chaque sous-traitant (AWS, GCP, etc.)
```

---

## CNIL — Rôle et pouvoirs

| Pouvoir | Description |
|---------|-------------|
| **Conseil** | Recommandations, référentiels, guides |
| **Contrôle** | Vérifications sur place ou à distance |
| **Mise en demeure** | Délai pour se mettre en conformité |
| **Sanction** | Amendes administratives (voir art. 83) |
| **Mesures provisoires** | Suspension d'un traitement en urgence |

> La CNIL est l'autorité de contrôle française. Chaque État membre a la sienne. Le mécanisme du **guichet unique** permet de traiter les cas transfrontaliers via l'autorité du pays d'établissement principal.
