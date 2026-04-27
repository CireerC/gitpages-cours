---
layout: course
title: "Nuit de l'Info — S7"
semestre: "S7"
type_cours: "projet"
tags: ["nuit de l'info", "hackathon", "développement", "web", "compétition", "24h", "équipe", "créativité"]
---

## Présentation

La **Nuit de l'Info** est un hackathon national organisé chaque année en décembre (de 17h à 8h du matin). Des équipes d'étudiants de toute la France développent une application web en une nuit sur un sujet commun révélé au lancement de l'événement.

**Site officiel :** [nuitdelinfo.com](https://www.nuitdelinfo.com)

---

## Format de l'événement

| Aspect | Détails |
|--------|---------|
| **Durée** | ~15h (17h → 8h) |
| **Équipes** | 3-10 étudiants |
| **Sujet** | Révélé le soir même à 17h |
| **Défi principal** | Développer une application web |
| **Défis annexes** | 15-20 défis proposés par des entreprises partenaires |
| **Jury** | National (sujet principal) + entreprises (défis annexes) |
| **Notation** | Originalité, technique, UX, réalisation |

---

## Stratégie de réussite

### Organisation de l'équipe (première heure)

```
17h00 — Révélation du sujet
  ↓ 15 min — Brainstorming (toutes les idées, sans filtre)
  ↓ 15 min — Sélection et affinage de l'idée
  ↓ 15 min — Architecture technique et découpage des tâches
  ↓ 15 min — Setup (repo Git, CI, déploiement vide)

Rôles à répartir :
  ├── 1-2 Back-end (API, BDD)
  ├── 1-2 Front-end (UI, UX)
  ├── 1   DevOps / Déploiement
  └── 1   Défis annexes (si grosse équipe)
```

### Priorisation MoSCoW

```
MUST have (finir avant 4h du matin)
  → Fonctionnalité principale qui répond au sujet
  → Interface minimale fonctionnelle
  → Déploiement en ligne

SHOULD have (si le temps le permet)
  → Défis annexes à forte valeur
  → Animations / polish UI

COULD have (bonus)
  → Fonctionnalités secondaires
  → Intégrations API tierces

WON'T have (à couper sans hésiter)
  → Tout ce qui n'est pas essentiel
```

---

## Stack recommandée

### Setup ultra-rapide (< 30 min)

```bash
# Frontend — Next.js + Tailwind
npx create-next-app@latest nuit-info \
  --typescript --tailwind --app --src-dir

# Backend — Express + TypeScript
mkdir api && cd api
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install prisma @prisma/client dotenv

# Base de données — Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=nuitinfo \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:15-alpine

# Déploiement instantané
# Frontend : Vercel (push Git → deploy automatique)
# Backend  : Railway / Render (gratuit)
# BD       : Neon / Supabase (PostgreSQL managed gratuit)
```

### Template de départ (Next.js App Router)

```typescript
// app/page.tsx — Page principale
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          Nuit de l'Info 2024
        </h1>
        {/* Votre application ici */}
      </div>
    </main>
  );
}

// app/api/data/route.ts — API Route
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API ready!' });
}

export async function POST(req: Request) {
  const body = await req.json();
  // Traitement...
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Défis annexes — Approche

### Catégories de défis typiques

| Catégorie | Exemples | Temps estimé |
|-----------|---------|--------------|
| **Design** | Intégrer une charte graphique donnée | 30-60 min |
| **Accessibilité** | Score Lighthouse accessibilité > 90 | 1-2h |
| **API entreprise** | Utiliser l'API de l'entreprise partenaire | 1-3h |
| **Performance** | Score Lighthouse perf > 90 | 1-2h |
| **Sécurité** | HTTPS, headers sécurité, audit OWASP | 1h |
| **Fun / Créativité** | Intégrer un easter egg, un mini-jeu | 30 min |
| **Open Data** | Utiliser des données publiques (data.gouv.fr) | 1-2h |

### Défis à cibler en priorité

```
✓ Défis rapides (< 1h) → faire le maximum
✓ Défis pour lesquels vous avez déjà les compétences
✓ Défis alignés avec votre application (pas de refactoring)
✗ Éviter les défis très longs si le principal n'est pas fini
✗ Ne pas fragmenter l'équipe si le sujet principal souffre
```

---

## Qualité du code en conditions de stress

### Ce qu'on peut sacrifier (hackathon)

```
→ Tests (sauf si défi spécifique)
→ Documentation complète
→ Refactoring exhaustif
→ Gestion d'erreurs parfaite
→ Optimisations prématurées
```

### Ce qu'on ne doit pas sacrifier

```
→ Git : committer régulièrement (toutes les 30-45 min)
→ Déploiement : avoir une URL fonctionnelle en avance
→ Fonctionnalité principale : terminer avant tout le reste
→ README : écrire les instructions de démo en avance
```

### Git — workflow minimal

```bash
# Au lancement
git init
git remote add origin https://github.com/equipe/nuit-info

# Branches par fonctionnalité
git checkout -b feature/auth
# ... développement ...
git add -A && git commit -m "feat: authentication"
git push origin feature/auth

# Intégration régulière sur main
git checkout main
git merge feature/auth --no-ff
git push origin main
# → Déploiement automatique Vercel

# En cas de merge conflict → résoudre immédiatement
```

---

## Présentation finale (8h du matin)

### Structure de démo (5-7 min)

```
0:00 – Pitch (30s)
  "Notre application [nom] permet de [problème résolu].
   En réponse au sujet, nous avons choisi [angle]."

0:30 – Démo live (3-4 min)
  → Suivre un parcours utilisateur cohérent
  → Montrer les fonctionnalités principales
  → Mentionner les défis annexes réalisés

4:30 – Architecture (1 min)
  → Stack technique
  → Ce qui a bien fonctionné / difficultés

5:30 – Bilan (30s)
  → Ce qu'on aurait fait avec plus de temps
```

### Conseils pour la présentation

```
✓ Avoir une démo offline prête (si internet défaille)
✓ Présenter depuis l'URL de prod (pas localhost)
✓ Mettre en avant les défis annexes réussis
✓ Rire des bugs — c'est une Nuit de l'Info !
✓ Valoriser l'organisation et les compromis techniques
✗ Éviter "on n'a pas eu le temps de..." → parler de ce qui fonctionne
```

---

## Gestion de l'énergie

```
Conseils physiques :
  ✓ Manger léger (éviter le sucre qui fatigue vite)
  ✓ S'hydrater (eau, pas seulement café)
  ✓ Courtes pauses de 5 min toutes les 2h
  ✓ Si blocage > 20 min : changer de tâche ou demander de l'aide
  ✓ Sieste de 20 min possible vers 3-4h (power nap)

Gestion des blocages :
  → Technique : committer ce qui fonctionne, simplifier la feature
  → Motivation : rappeler l'objectif, célébrer les petites victoires
  → Désaccords : décider vite (vote), documenter la décision
```

---

## Retour d'expérience

### Erreurs classiques à éviter

| Erreur | Conséquence | Solution |
|--------|-------------|---------|
| Choisir une techno inconnue | Perte de temps sur le setup | Utiliser ce qu'on maîtrise |
| Sous-estimer la complexité du sujet | Fonctionnalité principale incomplète | MVP d'abord, features ensuite |
| Pas de déploiement anticipé | Bug de prod en fin de nuit | Déployer un hello world à 17h30 |
| Trop de défis en parallèle | Rien de terminé | 1 défi à la fois |
| Négliger le README | Jury ne comprend pas la démo | 15 min pour le README à 7h |
