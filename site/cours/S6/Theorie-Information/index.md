---
layout: course
title: "Théorie de l'information"
semestre: "S6"
type_cours: "informatique théorique"
tags: ["entropie", "compression", "Shannon", "codage", "information"]
---

## Introduction

La théorie de l'information, fondée par **Claude Shannon** en 1948, quantifie l'information contenue dans un message et définit les limites théoriques de la compression et de la transmission de données.

## Notion d'information

### Surprise et information

L'information apportée par un événement est d'autant plus grande qu'il est **improbable** :

$$I(x) = -\log_2 P(x) \quad \text{(en bits)}$$

- Événement certain ($P = 1$) : $I = 0$ bit — aucune information apportée.
- Événement très rare ($P = 0.001$) : $I \approx 10$ bits — très informatif.

### Entropie de Shannon

L'**entropie** $H$ mesure l'information moyenne d'une source :

$$H(X) = -\sum_{x \in \mathcal{X}} P(x) \log_2 P(x) \quad \text{(bits/symbole)}$$

**Exemple** : source binaire équiprobable ($P(0) = P(1) = 0.5$) :

$$H = -\left(0.5 \cdot \log_2 0.5 + 0.5 \cdot \log_2 0.5\right) = 1 \text{ bit}$$

L'entropie est **maximale** lorsque tous les symboles sont équiprobables, et **nulle** si un symbole a probabilité 1.

## Théorème de Shannon — Limite de compression

> *Il est impossible de compresser une source en dessous de son entropie sans perte d'information.*

$$L_{moy} \geq H(X)$$

Toute compression sans perte vise à s'approcher de cette borne inférieure.

## Codes de compression sans perte

### Code de Huffman

Le **code de Huffman** est un code à longueur variable qui assigne des codes courts aux symboles fréquents et des codes longs aux symboles rares.

**Construction :**
1. Trier les symboles par probabilité croissante.
2. Fusionner les deux symboles de plus faible probabilité en un nœud.
3. Répéter jusqu'à former un arbre binaire complet.
4. Assigner `0` à chaque branche gauche et `1` à chaque branche droite.

**Exemple :**

| Symbole | P | Code |
|---------|---|------|
| A | 0.40 | `0` |
| B | 0.25 | `10` |
| C | 0.20 | `110` |
| D | 0.15 | `111` |

Longueur moyenne : $L = 0.4 \times 1 + 0.25 \times 2 + 0.20 \times 3 + 0.15 \times 3 = 1.95$ bits/symbole.

Entropie : $H \approx 1.93$ bits/symbole → très proche de la limite !

### Code de Lempel-Ziv (LZ77, LZ78, LZW)

Les algorithmes **LZ** exploitent la redondance dans les données en référençant des séquences déjà vues :

- **LZ77** : fenêtre glissante — références `(offset, longueur, prochain_symbole)`
- **LZW** : dictionnaire dynamique (utilisé dans GIF, TIFF, ZIP)
- **Deflate** : combinaison LZ77 + Huffman (utilisé dans ZIP, PNG, HTTP gzip)

```python
# Exemple d'encodage RLE (Run-Length Encoding) — cas simple
def rle_encode(s):
    result = []
    i = 0
    while i < len(s):
        count = 1
        while i + count < len(s) and s[i + count] == s[i]:
            count += 1
        result.append((s[i], count))
        i += count
    return result

rle_encode("AAABBBCCDDDDDD")
# → [('A', 3), ('B', 3), ('C', 2), ('D', 6)]
```

## Transmission — Canal et bruit

### Capacité du canal (Shannon)

Le **théorème de Shannon-Hartley** donne la capacité maximale $C$ d'un canal bruité :

$$C = B \log_2\left(1 + \frac{S}{N}\right) \quad \text{(bits/s)}$$

où :
- $B$ = bande passante du canal (Hz)
- $S/N$ = rapport signal/bruit (SNR)

> Plus le SNR est élevé ou la bande passante large, plus on peut transmettre d'information.

### Codes correcteurs d'erreurs

Quand le canal est bruité, on ajoute de la **redondance** pour détecter/corriger les erreurs.

| Code | Redondance | Capacité de correction |
|------|-----------|----------------------|
| Parité | 1 bit | Détecte 1 erreur |
| Hamming (7,4) | 3 bits | Corrige 1 erreur |
| Reed-Solomon | Variable | Corrections multiples (CD, QR codes) |
| Turbo codes / LDPC | Variable | Proche de la capacité de Shannon |

### Distance de Hamming

La **distance de Hamming** $d(u,v)$ entre deux mots est le nombre de positions où ils diffèrent :

$$d(\text{1011}, \text{1001}) = 1$$

Un code capable de corriger $t$ erreurs doit avoir une distance minimale $d_{min} \geq 2t + 1$.

## Entropie conditionnelle et information mutuelle

### Entropie conditionnelle

$$H(Y|X) = -\sum_{x,y} P(x,y) \log_2 P(y|x)$$

Mesure l'incertitude restante sur $Y$ quand on connaît $X$.

### Information mutuelle

$$I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)$$

Quantifie l'information partagée entre $X$ et $Y$ — utilisée en sélection de features (ML) et en traitement du signal.

## Résumé

- L'entropie de Shannon mesure l'information moyenne d'une source — limite inférieure de la compression sans perte.
- Huffman est optimal pour un code à longueur variable sans mémoire.
- LZ/Deflate exploite la redondance contextuelle — bien supérieur à Huffman seul sur du texte réel.
- La capacité de Shannon fixe la limite théorique de transmission sur un canal bruité — les codes modernes (LDPC, Turbo) s'en approchent.

## Références

- Cours Théorie de l'information, S6 2024-2025
- Fichier source : `2025-01-28.md`
- Shannon, C.E. (1948) — *A Mathematical Theory of Communication*
