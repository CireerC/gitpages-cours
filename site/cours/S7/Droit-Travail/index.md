---
layout: course
title: "Droit du travail et des affaires"
semestre: "S7"
type_cours: "tronc"
tags: ["contrat de travail", "droit social", "propriété intellectuelle", "RGPD", "droit commercial", "statuts juridiques"]
---

## Introduction

Ce cours donne les bases du droit applicables au contexte professionnel d'un ingénieur : contrats de travail, propriété intellectuelle, protection des données, et formes juridiques d'entreprise.

---

## Contrats de travail

### Types de contrats

| Contrat | Durée | Particularités |
|---------|-------|----------------|
| **CDI** | Indéterminée | Norme ; rupture = démission, licenciement ou rupture conventionnelle |
| **CDD** | Limitée (18 mois max) | Motif obligatoire (remplacement, surcroît) |
| **Intérim** | Limitée | Via agence ; 18 mois max |
| **Stage** | 6 mois max par an | Gratification obligatoire si > 2 mois |
| **Alternance** | 1-3 ans | Contrat pro ou apprentissage ; financement OPCO |

### Éléments clés du CDI

- **Période d'essai** : ingénieur/cadre → 4 mois (renouvelable 1 fois)
- **Préavis** : généralement 3 mois pour les cadres
- **Clause de non-concurrence** : doit être limitée dans le temps, l'espace et le domaine ; contrepartie financière obligatoire (≥ 1/3 salaire)
- **Clause de confidentialité** : permanente même après la rupture

### Rupture du contrat

| Mode | Initiateur | Indemnités |
|------|-----------|-----------|
| Démission | Salarié | Aucune (sauf CPF de transition) |
| Licenciement économique | Employeur | Indemnité légale + préavis |
| Licenciement faute grave | Employeur | Pas d'indemnité ni préavis |
| Rupture conventionnelle | Accord mutuel | Indemnité ≥ légale + chômage |

---

## Propriété intellectuelle en informatique

### Droits d'auteur sur le code

En France, **le code source est protégé par le droit d'auteur** automatiquement dès sa création (pas de dépôt nécessaire).

> **Cas particulier :** Le code créé par un salarié **dans le cadre de ses fonctions** appartient à **l'employeur** (art. L113-9 CPI). Cela inclut le code fait avec les ressources de l'entreprise, même à la maison.

### Licences logicielles

| Licence | Copyleft | Usage commercial | Conditions |
|---------|----------|-----------------|-----------|
| MIT | Non | Oui | Conserver la licence |
| Apache 2.0 | Non | Oui | Conserver la licence, mentionner les changements |
| GPL v3 | Fort | Oui (si open source) | Tout dérivé doit être GPL |
| LGPL | Faible | Oui | Peut être lié dans un logiciel propriétaire |
| AGPL | Fort (réseau) | Oui (si open source) | SaaS inclus dans le copyleft |
| Propriétaire | — | Selon contrat | Restrictions d'usage |

### Brevets logiciels

En Europe, les logiciels **en tant que tels** ne sont pas brevetables. Mais une **invention implémentée par ordinateur** (avec effet technique) peut l'être. En pratique, les grandes entreprises déposent de nombreux brevets.

---

## RGPD (aperçu)

| Principe | Application pratique |
|---------|---------------------|
| **Finalité** | Ne collecter que pour un but défini et déclaré |
| **Minimisation** | Ne collecter que les données strictement nécessaires |
| **Durée de conservation** | Supprimer les données après leur durée d'utilisation |
| **Consentement** | Opt-in clair, retrait facile |
| **Droits** | Accès, rectification, effacement, portabilité |

> En tant que développeur : ne jamais stocker des mots de passe en clair, toujours chiffrer les données sensibles, documenter les traitements dans le registre.

---

## Formes juridiques d'entreprise

| Forme | Capital min | Responsabilité | Usage |
|-------|------------|----------------|-------|
| **Auto-entrepreneur** | 0 | Illimitée | Freelance, petite activité |
| **EURL** | 1 € | Limitée aux apports | Entreprise solo |
| **SARL** | 1 € | Limitée | PME, < 100 associés |
| **SAS/SASU** | 1 € | Limitée | Startup, levée de fonds |
| **SA** | 37 000 € | Limitée | Cotation en bourse possible |

### SASU vs auto-entrepreneur pour un freelance

| Critère | Auto-entrepreneur | SASU |
|---------|-------------------|------|
| Charges sociales | ~23% | ~45% |
| Protection sociale | Faible | Salarié (si gérant assimilé) |
| CA max | 77 700 € (prestations) | Illimité |
| Comptabilité | Simplifiée | Bilan annuel obligatoire |
| Image pro | Limitée | Meilleure |
