---
layout: course
title: "Comptabilité et Finance d'entreprise"
semestre: "S8"
type_cours: "tronc"
tags: ["comptabilité", "bilan", "compte de résultat", "SIG", "ratios", "trésorerie", "CAF", "finance", "analyse financière"]
---

## Introduction

La comptabilité est le langage universel de l'entreprise. Ce cours donne les bases pour lire et interpréter les états financiers d'une entreprise — compétence essentielle pour tout ingénieur évoluant en entreprise ou créant sa startup.

---

## Le bilan comptable

Le bilan est une **photographie du patrimoine** de l'entreprise à un instant T. Il présente ce que l'entreprise **possède** (actif) et comment c'est **financé** (passif).

$$\text{Actif} = \text{Passif} \quad (\text{toujours équilibré})$$

### Structure du bilan

```
ACTIF (Emplois)                    PASSIF (Ressources)
────────────────────────────────   ──────────────────────────────────
ACTIF IMMOBILISÉ                   CAPITAUX PROPRES
  Immobilisations incorporelles      Capital social
    Fonds de commerce, brevets       Réserves (bénéfices antérieurs)
    Logiciels, R&D activée           Résultat de l'exercice
  Immobilisations corporelles      ─────────────────────────────────
    Terrains, constructions         PROVISIONS
    Machines, matériel informatique   Risques et charges à venir
  Immobilisations financières      ─────────────────────────────────
    Participations, prêts accordés  DETTES
────────────────────────────────     Emprunts bancaires (> 1 an)
ACTIF CIRCULANT                      Dettes fournisseurs (< 1 an)
  Stocks                             Dettes fiscales et sociales
  Créances clients (factures dues)   Autres dettes d'exploitation
  Disponibilités (trésorerie, banque)
────────────────────────────────   ──────────────────────────────────
TOTAL ACTIF                  =     TOTAL PASSIF
```

### Notions clés du bilan

| Terme | Définition |
|-------|-----------|
| **Capital social** | Apport des associés lors de la création |
| **Réserves** | Bénéfices des années précédentes non distribués |
| **Amortissement** | Constatation de la dépréciation d'un bien (immobilisations ÷ durée de vie) |
| **Provision** | Charge probable future déjà enregistrée (prudence) |
| **Créances clients** | Ventes réalisées mais non encore encaissées |
| **Dettes fournisseurs** | Achats effectués mais non encore payés |

---

## Le compte de résultat

Le compte de résultat mesure la **performance** sur une période (généralement 1 an). Il recense les **produits** (entrées) et **charges** (sorties) pour déterminer le résultat.

$$\text{Résultat} = \text{Produits} - \text{Charges}$$

### Structure simplifiée

```
PRODUITS D'EXPLOITATION
  Chiffre d'affaires (ventes de biens et services)    1 200 000 €
  Production stockée / immobilisée                       +30 000 €
  Subventions d'exploitation                             +20 000 €
                                                     ─────────────
CHARGES D'EXPLOITATION
  Achats de marchandises / matières premières           -350 000 €
  Variation de stocks                                    -20 000 €
  Autres achats externes (loyers, sous-traitance)       -180 000 €
  Charges de personnel (salaires + charges)             -420 000 €
  Dotations aux amortissements                           -60 000 €
  Autres charges d'exploitation                         -40 000 €
                                                     ─────────────
RÉSULTAT D'EXPLOITATION (REX)                          +180 000 €

  ± Résultat financier (intérêts emprunts)              -15 000 €
                                                     ─────────────
RÉSULTAT COURANT AVANT IMPÔTS (RCAI)                   +165 000 €

  ± Résultat exceptionnel                                +5 000 €
                                                     ─────────────
RÉSULTAT AVANT IMPÔTS                                  +170 000 €
  - Impôt sur les sociétés (IS, ~25%)                   -42 500 €
                                                     ═════════════
RÉSULTAT NET                                           +127 500 €
```

---

## Les Soldes Intermédiaires de Gestion (SIG)

Les SIG décomposent la formation du résultat en étapes successives, permettant une analyse fine de la performance.

| SIG | Formule | Interprétation |
|-----|---------|----------------|
| **Marge commerciale** | Ventes de marchandises − Achats de marchandises | Rentabilité activité négoce |
| **Valeur ajoutée (VA)** | Marge commerciale + Production − Consommations externes | Richesse créée par l'entreprise |
| **EBE** (Excédent Brut d'Exploitation) | VA − Charges de personnel − Impôts et taxes | Rentabilité opérationnelle brute |
| **Résultat d'exploitation (REX)** | EBE − Amortissements − Provisions | Résultat de l'activité courante |
| **RCAI** | REX + Résultat financier | Résultat avant exceptionnel et IS |
| **Résultat net** | RCAI ± Résultat exceptionnel − IS | Bénéfice/perte finale |

### Capacité d'Autofinancement (CAF)

La CAF représente les ressources générées par l'activité qui resteront dans l'entreprise.

$$\text{CAF} = \text{Résultat net} + \text{Dotations aux amortissements et provisions} - \text{Reprises sur provisions} \pm \text{Valeurs comptables cessions}$$

> L'amortissement est une charge **non décaissée** : il réduit le résultat (et donc l'IS) mais n'entraîne pas de sortie d'argent.

---

## Analyse financière — Ratios

### Ratios de structure financière

| Ratio | Formule | Interprétation | Norme indicative |
|-------|---------|----------------|-----------------|
| **Autonomie financière** | Capitaux propres / Total bilan | Part des fonds propres | > 30% |
| **Endettement net** | Dettes financières − Trésorerie | Dette nette | < 3× l'EBE |
| **Gearing** | Dettes financières / Capitaux propres | Levier financier | < 1 |
| **Couverture des immobilisations** | Capitaux permanents / Actif immobilisé | Règle d'or financière | > 1 |

### Ratios de rentabilité

| Ratio | Formule | Interprétation |
|-------|---------|----------------|
| **ROE** (Return on Equity) | Résultat net / Capitaux propres | Rentabilité pour l'actionnaire |
| **ROA** (Return on Assets) | Résultat net / Total actif | Rentabilité des actifs |
| **ROCE** | REX / (Capitaux propres + Dettes financières) | Rentabilité du capital employé |
| **Marge nette** | Résultat net / CA | % de bénéfice par € de vente |
| **Marge EBE** | EBE / CA | Rentabilité opérationnelle brute |

### Ratios de liquidité

| Ratio | Formule | Interprétation | Norme |
|-------|---------|----------------|-------|
| **Liquidité générale** | Actif circulant / Dettes CT | Couverture dettes CT | > 1 |
| **Liquidité réduite** | (AC − Stocks) / Dettes CT | Sans les stocks | > 0.8 |
| **Liquidité immédiate** | Disponibilités / Dettes CT | Trésorerie pure | > 0.3 |

---

## Fonds de Roulement (FR) et Besoin en Fonds de Roulement (BFR)

### Définitions

$$\text{FR} = \text{Capitaux permanents} - \text{Actif immobilisé}$$
$$\text{BFR} = \text{Stocks} + \text{Créances clients} - \text{Dettes fournisseurs}$$
$$\text{Trésorerie nette} = \text{FR} - \text{BFR}$$

### Interprétation

```
Cas favorable :
FR > BFR → Trésorerie > 0 → situation saine

Cas défavorable :
FR < BFR → Trésorerie < 0 → tension, risque de cessation de paiements

BFR négatif (grande distribution) :
  Les clients paient comptant mais les fournisseurs sont payés à 60 jours
  → Les fournisseurs financent l'activité (BFR = ressource)

Exemple :
  Stocks : 100 k€  |  Créances : 150 k€  |  Dettes fournisseurs : 80 k€
  BFR = 100 + 150 - 80 = 170 k€
  FR = 250 k€
  Trésorerie = 250 - 170 = +80 k€ ✓
```

---

## Plan de financement et budget de trésorerie

### Budget de trésorerie (tableau des flux)

```
                    Jan     Fév     Mar     ...
ENCAISSEMENTS
  Ventes TTC        80 000  90 000  75 000
  Subventions            0       0  50 000
  Emprunts               0       0       0
TOTAL ENCAISSEMENTS 80 000  90 000 125 000

DÉCAISSEMENTS
  Fournisseurs      40 000  45 000  38 000
  Salaires + charges 25 000  25 000  25 000
  Remboursement emprunt 2 000   2 000   2 000
  TVA                5 000   6 000   4 000
TOTAL DÉCAISSEMENTS 72 000  78 000  69 000

SOLDE DU MOIS       +8 000 +12 000 +56 000
SOLDE CUMULÉ        +8 000 +20 000 +76 000
```

---

## Valorisation d'entreprise

### Méthodes de valorisation

| Méthode | Formule | Usage |
|---------|---------|-------|
| **Multiple d'EBITDA** | Valeur = EBE × multiple (secteur) | PME, startups tech |
| **DCF** (Discounted Cash Flows) | Valeur = Σ CF_t / (1+r)^t | Projections long terme |
| **Comparable** | Prix × (Valeur / Indicateur pairs) | M&A, fonds |
| **Actif net** | Actif − Passif réel | Cas de liquidation |

### Multiples sectoriels indicatifs (2024)

| Secteur | Multiple EBE (EBITDA) |
|---------|----------------------|
| SaaS / Tech | 10–20× |
| Industrie | 5–8× |
| Distribution | 4–6× |
| Services | 6–10× |
| Startup pré-rentable | MRR × 3–8 |

---

## Lecture d'un rapport annuel

### Documents clés à analyser

```
Rapport annuel
├── Lettre aux actionnaires → message du PDG, orientations
├── Présentation de l'activité → marchés, produits, stratégie
├── Rapport de gestion → analyse des résultats par direction
├── États financiers consolidés
│   ├── Bilan consolidé
│   ├── Compte de résultat consolidé
│   ├── Tableau des flux de trésorerie
│   └── Annexes (notes explicatives)
└── Rapport des commissaires aux comptes → certification
```

### Signaux d'alerte

```
⚠️  BFR en forte hausse sans justification
⚠️  Trésorerie négative plusieurs exercices consécutifs
⚠️  Charges financières > 30% du REX (sur-endettement)
⚠️  CAF négative (l'activité consomme des liquidités)
⚠️  Écart important entre résultat net et CAF (manipulation ?)
⚠️  Rotation des stocks anormalement longue
⚠️  Délais clients >> délais fournisseurs (tension trésorerie)
```
