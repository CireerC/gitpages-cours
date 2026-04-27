---
layout: course
title: "Écoconception logicielle"
semestre: "S8"
type_cours: "tronc"
tags: ["écoconception", "numérique responsable", "RGESN", "GreenIT", "performance", "carbone", "Green Software"]
---

## Introduction

L'**écoconception logicielle** vise à réduire l'impact environnemental d'un service numérique tout au long de son cycle de vie : conception, développement, déploiement, usage, fin de vie. Le numérique représente ~4% des émissions mondiales de GES et cette part croît de 8% par an.

---

## Impacts environnementaux du numérique

### Les 3 tiers d'un service numérique

```
                    Impact carbone
Fabrication terminaux ████████████████████ 45%
Usage terminaux       ████████████         30%
Infrastructure réseau ██████               15%
Datacenter            ████                 10%

→ L'essentiel de l'impact est côté client (terminal + réseau)
→ Alléger le front-end a plus d'impact qu'optimiser le serveur
```

### Facteurs d'impact

| Facteur | Impact | Leviers |
|---------|--------|---------|
| **Fabrication terminaux** | 45-80% impact smartphone | Durée de vie, réparabilité |
| **Consommation réseau** | ~0.06 kWh/Go mobile | Compression, cache, formats légers |
| **CPU/GPU client** | JS lourd → calcul terminal | Bundle JS minimal, lazy loading |
| **Datacenter** | PUE × énergie IT | PUE < 1.4, énergie renouvelable |
| **Données non nécessaires** | Stockage, transfert | Minimisation, TTL cache |

### Ordres de grandeur

```
Un email avec pièce jointe   ≈ 50 gCO₂e
Un email sans pièce jointe   ≈ 4 gCO₂e
Une heure de vidéo streaming ≈ 36 gCO₂e
Une requête Google            ≈ 0.2 gCO₂e
Un chargement page web (3Mo) ≈ 1.76 gCO₂e
1 Go de données mobiles      ≈ 60 gCO₂e (réseau 4G)
```

---

## RGESN — Référentiel Général d'Écoconception de Services Numériques

Publié par la **DINUM** (2022), le RGESN propose **79 critères** organisés en **8 thématiques** :

### Thématiques et critères clés

**1. Stratégie** (9 critères)
- Définir une stratégie d'écoconception documentée
- Mesurer et suivre l'impact environnemental du service
- Former l'équipe aux enjeux du numérique responsable

**2. Spécifications** (10 critères)
- Limiter le périmètre fonctionnel au strict nécessaire
- Prioriser les fonctionnalités à forte valeur ajoutée
- Évaluer l'accessibilité dès la conception

**3. Architecture** (13 critères)
```
✓ Utiliser des architectures adaptées (serverless vs toujours-allumé)
✓ Mutualiser les ressources serveur
✓ Limiter le nombre de composants tier (microservices vs monolithe)
✓ Choisir des hébergeurs avec bilan carbone documenté
✓ Adapter les ressources à la charge réelle (autoscaling)
```

**4. UX/UI** (6 critères)
```
✓ Limiter le nombre de pages et d'étapes pour accomplir une tâche
✓ Ne pas pré-charger du contenu non demandé
✓ Proposer des alternatives légères (version texte, résumé)
✓ Éviter l'autoplay vidéo
```

**5. Contenus** (11 critères)
```
✓ Optimiser les images (WebP, AVIF, compression, dimensions)
✓ Encoder les vidéos de manière adaptative (HLS, DASH)
✓ Préférer le SVG pour les icônes et pictogrammes
✓ Limiter les polices web (nombre et poids)
✓ Éviter les contenus générés automatiquement inutiles
```

**6. Front-end** (15 critères)
```
✓ Minifier et bundler les assets (JS, CSS)
✓ Mettre en cache côté client (headers Cache-Control)
✓ Utiliser un CDN pour les assets statiques
✓ Implémenter le lazy loading pour images et modules
✓ Éviter les animations CSS/JS non essentielles
✓ Préférer CSS à JS pour les animations
```

**7. Back-end** (10 critères)
```
✓ Mettre en cache les résultats de requêtes coûteuses
✓ Optimiser les requêtes SQL (N+1, index)
✓ Implémenter la pagination (ne pas tout charger)
✓ Choisir des algorithmes de complexité optimale
✓ Async par défaut pour les tâches I/O
```

**8. Hébergement** (5 critères)
```
✓ Choisir un hébergeur avec énergie renouvelable
✓ Documenter le PUE de l'infrastructure
✓ Adapter les ressources à la demande réelle
✓ Éteindre les environnements non-prod la nuit/weekend
```

---

## Green Software Foundation — Principes

### Les 8 principes du Green Software

1. **Carbon** : minimiser les émissions CO₂e
2. **Electricity** : minimiser la consommation électrique
3. **Carbon Intensity** : utiliser l'électricité quand elle est décarbonée
4. **Embodied Carbon** : prendre en compte la fabrication du matériel
5. **Energy Proportionality** : utiliser les ressources à leur plein potentiel
6. **Networking** : réduire les données transitant sur le réseau
7. **Demand Shaping** : déplacer les workloads quand l'énergie est verte
8. **Measurement** : mesurer et optimiser

### Carbon Aware SDK

```python
# Décaler un traitement batch vers une période moins carbonée
from carbonaware import CarbonAwareClient

client = CarbonAwareClient()

# Trouver la meilleure heure dans les 24h pour une région
forecast = await client.get_best_execution_time(
    location="westeurope",
    window_size=4,        # Fenêtre de 4h
    duration=1            # Durée du traitement : 1h
)

print(f"Lancer à : {forecast.optimal_time}")
print(f"Intensité carbone : {forecast.carbon_intensity} gCO₂eq/kWh")
```

---

## Pratiques concrètes par couche

### Optimisation des images

```html
<!-- Formats modernes avec fallback -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy"
       width="800" height="600">
</picture>

<!-- Responsive images (évite de charger une image 4K sur mobile) -->
<img
  srcset="image-320.webp 320w, image-640.webp 640w, image-1280.webp 1280w"
  sizes="(max-width: 640px) 100vw, 50vw"
  src="image-640.webp"
  alt="Description"
  loading="lazy"
  decoding="async">
```

```bash
# Conversion et optimisation en lot
# WebP
cwebp -q 80 image.jpg -o image.webp

# AVIF (meilleure compression)
avifenc --min 30 --max 50 image.png image.avif

# Optimisation PNG/JPG
optipng -o5 image.png
jpegoptim --strip-all --max=85 image.jpg
```

### Cache HTTP

```http
# Assets statiques versionnés → cache long
Cache-Control: public, max-age=31536000, immutable
# (hash dans le nom de fichier : app.a3f9d2.js)

# Pages HTML → revalidation rapide
Cache-Control: no-cache
ETag: "a1b2c3d4"

# API données → cache court
Cache-Control: public, max-age=300, stale-while-revalidate=60

# Données personnelles → jamais en cache partagé
Cache-Control: private, no-store
```

### Optimisation JS

```javascript
// ❌ Charger tout le JS au départ
import { heavyChart } from './chartlib';

// ✅ Chargement dynamique (code splitting)
const loadChart = async () => {
  const { heavyChart } = await import('./chartlib');
  heavyChart('#container', data);
};

// ✅ Intersection Observer pour lazy-loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadChart();
      observer.unobserve(entry.target);
    }
  });
});
observer.observe(document.querySelector('#chart-container'));
```

### Optimisation SQL

```sql
-- ❌ N+1 : une requête par auteur
SELECT * FROM articles;
-- Pour chaque article : SELECT * FROM users WHERE id = ?

-- ✅ JOIN : une seule requête
SELECT a.id, a.title, u.name AS author_name
FROM articles a
JOIN users u ON a.author_id = u.id;

-- ✅ Pagination (ne pas tout charger)
SELECT id, title, created_at
FROM articles
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;   -- Page 3 (0-indexed)

-- ✅ Index sur les colonnes de filtre/tri
CREATE INDEX idx_articles_created ON articles(created_at DESC);
```

---

## Mesure et monitoring

### Outils de mesure

| Outil | Usage | Indicateurs |
|-------|-------|------------|
| **GreenFrame.io** | Mesure CO₂ d'un parcours utilisateur | gCO₂e/heure d'usage |
| **Website Carbon** | Estimation émissions d'une page | gCO₂ par visite |
| **EcoGrader** | Audit écoconception | Score sur 100 |
| **Lighthouse** | Performance + bonnes pratiques | Score 0-100 |
| **WebPageTest** | Analyse détaillée | LCP, TBT, CLS, taille assets |
| **Scaphandre** | Consommation serveur | Watts par processus |

### Métriques clés à suivre

```
Poids de la page  (HTML + CSS + JS + images + fonts)
  Cible : < 1 Mo (page simple), < 3 Mo (page riche)

Nombre de requêtes HTTP
  Cible : < 50 requêtes initiales

Score Lighthouse Performance
  Cible : > 80

Taille bundle JS
  Cible : < 300 Ko parsé (non gzippé)

Time to Interactive (TTI)
  Cible : < 3.8s (connexion 4G simulée)
```

---

## Écoconception organisationnelle

### Cycle de vie d'un service numérique

```
1. Cadrage         → Limiter le périmètre, prioriser (MoSCoW)
2. UX Research     → Parcours utilisateur simplifiés, sobriété
3. Design          → Maquettes allégées, pas d'animation superflue
4. Dev             → Optimisations techniques, tests perf
5. Test            → Audit écoconception (RGESN, Lighthouse)
6. Production      → Monitoring énergie, alertes dérive
7. Itérations      → Mesurer l'impact des nouvelles fonctionnalités
```

### Labels et certifications

| Label | Organisme | Description |
|-------|-----------|-------------|
| **Label Numérique Responsable (LNR)** | INR | Bonnes pratiques IT durables |
| **GreenIT** | Alliance Green IT | Réduction impact systèmes et logiciels |
| **ISO 14001** | ISO | Management environnemental |
| **ITU-T L.1030** | UIT | Écoconception équipements télécom |
