---
layout: course
title: "Challenge Développement Logiciel"
semestre: "S7"
type_cours: "projet"
tags: ["challenge", "développement", "agile", "architecture", "API", "DevOps", "CI/CD", "code review", "compétition"]
---

## Présentation du projet

Le **Challenge Développement Logiciel** est un projet compétitif inter-équipes axé sur la qualité du code, l'architecture et les pratiques DevOps. Les équipes développent une application complète en 4 à 6 semaines sur un sujet commun, évaluées sur la qualité technique autant que sur le résultat final.

---

## Format et organisation

| Aspect | Détails |
|--------|---------|
| **Durée** | 4-6 semaines |
| **Équipes** | 3-5 étudiants |
| **Organisation** | Sprints Scrum de 1 semaine |
| **Livrable 1** | Backlog + architecture initiale |
| **Livrable 2** | Application déployée + tests |
| **Livrable 3** | Rapport d'architecture |
| **Soutenance** | Démo live + questions |

---

## Organisation Agile

### Backlog et User Stories

```
Epic : Système de gestion d'événements

US-01 : Création d'événement
  En tant qu'organisateur,
  Je veux pouvoir créer un événement avec titre, date, lieu et capacité,
  Afin de permettre aux participants de s'inscrire.
  
  Critères d'acceptation :
  ✓ Formulaire avec validation côté client et serveur
  ✓ Confirmation par email automatique
  ✓ Événement visible immédiatement sur la liste publique
  
  Story points : 5

US-02 : Inscription à un événement
  En tant que participant,
  Je veux m'inscrire à un événement,
  Afin d'y participer.
  
  Critères d'acceptation :
  ✓ Vérification des places disponibles
  ✓ Gestion de liste d'attente si complet
  ✓ QR code de confirmation envoyé
  
  Story points : 8
```

### Planning de sprints

```
Sprint 0 (semaine 1) — Setup
  ✓ Définition backlog + priorisation
  ✓ Architecture technique
  ✓ Setup environnement (Git, CI, Docker)
  ✓ Maquettes UX

Sprint 1 (semaine 2) — Core features
  → US-01 Création d'événement
  → US-02 Inscription
  → Auth (login/register)

Sprint 2 (semaine 3) — Features avancées
  → US-05 Dashboard organisateur
  → US-06 Notifications email
  → US-07 Recherche et filtres

Sprint 3 (semaine 4) — Qualité & Deploy
  → Tests E2E
  → Optimisations performance
  → Déploiement prod
  → Documentation API
```

---

## Architecture de référence

### Architecture hexagonale (Ports & Adapters)

```
┌─────────────────────────────────────────┐
│              Interface (Controllers)     │
│   REST API │ GraphQL │ WebSocket │ CLI   │
└────────────────┬────────────────────────┘
                 │ Ports d'entrée
┌────────────────▼────────────────────────┐
│           Application (Use Cases)        │
│  CreateEvent │ RegisterUser │ SendEmail  │
│         (Logique métier pure)            │
└────────────────┬────────────────────────┘
                 │ Ports de sortie
┌────────────────▼────────────────────────┐
│           Infrastructure (Adapters)      │
│  PostgreSQL │ Redis │ SMTP │ S3 │ Kafka  │
└─────────────────────────────────────────┘
```

### Stack technique moderne

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
      REDIS_URL:    redis://redis:6379
      JWT_SECRET:   ${JWT_SECRET}
    depends_on: [db, redis]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    environment:
      VITE_API_URL: http://localhost:3000

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB:       app
      POSTGRES_USER:     user
      POSTGRES_PASSWORD: pass

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

volumes:
  postgres_data:
```

---

## API REST — Bonnes pratiques

```typescript
// Conventions REST
// GET    /api/v1/events           → Liste des événements
// POST   /api/v1/events           → Créer un événement
// GET    /api/v1/events/:id       → Un événement
// PUT    /api/v1/events/:id       → Remplacer un événement
// PATCH  /api/v1/events/:id       → Modifier partiellement
// DELETE /api/v1/events/:id       → Supprimer

// Codes HTTP corrects
// 200 OK          → GET, PUT, PATCH réussis
// 201 Created     → POST réussi (+ Location header)
// 204 No Content  → DELETE réussi
// 400 Bad Request → Validation échouée
// 401 Unauthorized → Non authentifié
// 403 Forbidden    → Authentifié mais pas autorisé
// 404 Not Found    → Ressource inexistante
// 409 Conflict     → Conflit (doublon, état incompatible)
// 422 Unprocessable → Données invalides (business rules)
// 429 Too Many     → Rate limiting
// 500 Internal     → Erreur serveur

// Réponse standard
{
  "data": { ... },           // Données
  "meta": {                  // Métadonnées pagination
    "total": 150,
    "page": 2,
    "perPage": 20
  },
  "error": null              // null si succès
}
```

### Validation avec Zod (TypeScript)

```typescript
import { z } from 'zod';

const CreateEventSchema = z.object({
  title:       z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  startDate:   z.string().datetime(),
  endDate:     z.string().datetime(),
  location:    z.string().min(2).max(200),
  capacity:    z.number().int().positive().max(100000),
  isPublic:    z.boolean().default(true),
}).refine(
  data => new Date(data.endDate) > new Date(data.startDate),
  { message: "La date de fin doit être après la date de début" }
);

// Middleware Express
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }
    req.body = result.data;
    next();
  };
}
```

---

## Tests

### Stratégie de tests (pyramide)

```
         ╱╲
        ╱E2E╲          5-10% — Playwright, lent, coûteux
       ╱──────╲
      ╱Intégra-╲       20-30% — Supertest, BD test
     ╱  tion    ╲
    ╱────────────╲
   ╱  Unitaires  ╲     60-70% — Jest/Vitest, rapide
  ╱────────────────╲
```

### Tests unitaires — Jest/Vitest

```typescript
// event.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';

vi.mock('./event.repository');

describe('EventService', () => {
  let service: EventService;
  let mockRepo: vi.Mocked<EventRepository>;

  beforeEach(() => {
    mockRepo = new EventRepository() as vi.Mocked<EventRepository>;
    service = new EventService(mockRepo);
  });

  it('crée un événement avec les bonnes données', async () => {
    const input = {
      title: 'Test Event',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-01T23:00:00'),
      capacity: 100,
    };
    mockRepo.create.mockResolvedValue({ id: 'uuid-1', ...input });

    const result = await service.createEvent(input);

    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Event',
    }));
    expect(result.id).toBe('uuid-1');
  });

  it('lève une erreur si la date de fin est avant la date de début', async () => {
    await expect(service.createEvent({
      title: 'Bad Event',
      startDate: new Date('2025-06-02'),
      endDate: new Date('2025-06-01'),
      capacity: 50,
    })).rejects.toThrow('La date de fin doit être après la date de début');
  });
});
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install
      run: npm ci

    - name: Lint
      run: npm run lint

    - name: Type check
      run: npm run type-check

    - name: Unit tests
      run: npm run test:unit

    - name: Integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://test:test@localhost:5432/testdb

    - name: Coverage
      run: npm run test:coverage
      # Fail si coverage < 80%

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: E2E tests
      run: |
        docker compose -f docker-compose.test.yml up -d
        npx playwright test
        docker compose down

  deploy:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: |
        docker build -t myapp:${{ github.sha }} .
        docker push registry/myapp:${{ github.sha }}
        kubectl set image deployment/api api=registry/myapp:${{ github.sha }}
```

---

## Critères d'évaluation

| Critère | Points |
|---------|--------|
| Architecture et qualité du code | 25 |
| Fonctionnalités implémentées | 20 |
| Tests (coverage, pertinence) | 20 |
| CI/CD et DevOps | 15 |
| Documentation (API, README) | 10 |
| Présentation et démo | 10 |
| **Total** | **100** |
