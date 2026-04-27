---
layout: course
title: "Programmation Web avancée"
semestre: "S8"
type_cours: "dev"
tags: ["React", "TypeScript", "Next.js", "GraphQL", "WebSocket", "REST", "PWA", "testing", "performance"]
---

## Introduction

Ce cours couvre le développement web full-stack moderne : React avec hooks avancés, TypeScript, le framework Next.js, GraphQL comme alternative à REST, les WebSockets pour le temps réel, et les bonnes pratiques de performance et de tests.

---

## TypeScript — Fondamentaux

### Types avancés

```typescript
// Types de base et union
type Status = 'pending' | 'active' | 'inactive';
type ID = string | number;

// Interfaces vs Types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Generics
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Utility types
type PartialUser = Partial<User>;               // Tous les champs optionnels
type RequiredUser = Required<User>;             // Tous les champs obligatoires
type PublicUser = Omit<User, 'createdAt'>;      // Sans createdAt
type UserPreview = Pick<User, 'id' | 'name'>;  // Seulement id et name
type UserRecord = Record<string, User>;         // Dictionnaire

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

// Mapped types
type ReadOnly<T> = { readonly [K in keyof T]: T[K] };

// Template literal types
type EventName = `on${Capitalize<string>}`;    // onClick, onChange...

// Discriminated unions (très utile pour les états)
type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

---

## React — Hooks avancés

### useReducer — Gestion d'état complexe

```typescript
interface State {
  count: number;
  status: 'idle' | 'loading' | 'error';
  data: string[] | null;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: string[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'idle', data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'RESET':
      return { count: 0, status: 'idle', data: null, error: null };
    default:
      return state;
  }
}

function DataComponent() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0, status: 'idle', data: null, error: null
  });

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: String(e) });
    }
  };
  // ...
}
```

### useCallback & useMemo — Mémoïsation

```typescript
function ExpensiveList({ items, onDelete }: Props) {
  // useMemo : recalculer seulement si items change
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  // useCallback : stabiliser la référence de fonction
  const handleDelete = useCallback((id: number) => {
    onDelete(id);
  }, [onDelete]);  // Ne recrée la fonction que si onDelete change

  return (
    <ul>
      {sortedItems.map(item => (
        <ListItem key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

### Custom hooks — Réutilisation de logique

```typescript
// Hook de fetching générique
function useFetch<T>(url: string) {
  const [state, setState] = useState<ApiState<T>>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;  // Évite les race conditions
    setState({ status: 'loading' });

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then(data => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', error: err.message });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}

// Utilisation
function UserList() {
  const state = useFetch<User[]>('/api/users');

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <Error message={state.error} />;
  if (state.status === 'success') return (
    <ul>{state.data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
  );
  return null;
}
```

### Context API — État global léger

```typescript
// Contexte d'authentification
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await authService.login(credentials);
    setUser(user);
    localStorage.setItem('token', user.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour consommer le contexte avec vérification
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## Next.js — Framework full-stack

### App Router (Next.js 13+)

```
app/
├── layout.tsx          ← Layout racine (HTML, body)
├── page.tsx            ← Page d'accueil /
├── loading.tsx         ← UI de chargement (Suspense)
├── error.tsx           ← Gestion d'erreur
├── not-found.tsx       ← Page 404
├── api/
│   └── users/
│       └── route.ts    ← Route Handler (API)
├── users/
│   ├── page.tsx        ← /users
│   └── [id]/
│       └── page.tsx    ← /users/:id (route dynamique)
└── (auth)/             ← Route group (pas dans l'URL)
    ├── login/page.tsx
    └── register/page.tsx
```

### Server Components vs Client Components

```typescript
// Server Component (défaut) — s'exécute côté serveur
// Peut accéder directement à la base de données
// Ne peut pas utiliser useState, useEffect, événements
async function UserList() {
  const users = await db.user.findMany();  // Accès BD direct

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// Client Component — s'exécute dans le navigateur
"use client"

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c+1)}>{count}</button>;
}
```

### Route Handlers (API)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1');

  const users = await db.user.findMany({
    skip: (page - 1) * 20,
    take: 20,
  });

  return NextResponse.json({ users, page });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validation
  const result = userSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const user = await db.user.create({ data: result.data });
  return NextResponse.json(user, { status: 201 });
}
```

### Metadata et SEO

```typescript
// Metadata statique
export const metadata: Metadata = {
  title: 'Mon App',
  description: 'Description de mon application',
  openGraph: {
    title: 'Mon App',
    images: ['/og-image.png'],
  },
};

// Metadata dynamique
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.id);
  return {
    title: `${user.name} — Mon App`,
    description: user.bio,
  };
}
```

---

## GraphQL

### Schéma et résolveurs

```typescript
// schema.graphql
type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

type Subscription {
  userCreated: User!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

input CreateUserInput {
  name: String!
  email: String!
}
```

```typescript
// Résolveurs avec Apollo Server
const resolvers = {
  Query: {
    users: async (_, __, { dataSources }) => {
      return dataSources.usersAPI.getAll();
    },
    user: async (_, { id }, { dataSources }) => {
      return dataSources.usersAPI.getById(id);
    },
  },
  Mutation: {
    createUser: async (_, { input }, { dataSources, user }) => {
      if (!user) throw new AuthenticationError('Non authentifié');
      return dataSources.usersAPI.create(input);
    },
  },
  User: {
    // Résolveur de champ — éviter le N+1 avec DataLoader
    posts: async (parent, _, { loaders }) => {
      return loaders.postsByUserId.load(parent.id);
    },
  },
};
```

### DataLoader — Résolution du problème N+1

```typescript
import DataLoader from 'dataloader';

// Sans DataLoader : 1 requête par user (N+1)
// Avec DataLoader : 1 requête pour tous les users (batching)

const postsByUserIdLoader = new DataLoader(async (userIds: readonly string[]) => {
  const posts = await db.post.findMany({
    where: { userId: { in: [...userIds] } }
  });
  // Grouper par userId et retourner dans le même ordre
  return userIds.map(id => posts.filter(p => p.userId === id));
});
```

### Client GraphQL (React)

```typescript
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`;

function UserManagement() {
  const { data, loading, error } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: ['GetUsers'],  // Rafraîchir après mutation
    optimisticResponse: {          // Mise à jour optimiste
      createUser: { __typename: 'User', id: 'temp', name: 'New User' }
    }
  });

  if (loading) return <Spinner />;
  if (error) return <Error />;

  return (
    <>
      <UserList users={data.users} />
      <CreateUserForm onSubmit={createUser} />
    </>
  );
}
```

---

## WebSockets et temps réel

### Serveur WebSocket (Node.js + ws)

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface Client {
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
}

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map<string, Client>();

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const userId = authenticate(req);   // JWT depuis query params
  const clientId = crypto.randomUUID();

  clients.set(clientId, { ws, userId, rooms: new Set() });

  ws.on('message', (raw: Buffer) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.type) {
      case 'JOIN_ROOM':
        clients.get(clientId)!.rooms.add(msg.room);
        break;
      case 'CHAT_MESSAGE':
        broadcast(msg.room, {
          type: 'CHAT_MESSAGE',
          from: userId,
          text: msg.text,
          timestamp: Date.now(),
        }, clientId);
        break;
    }
  });

  ws.on('close', () => clients.delete(clientId));
});

function broadcast(room: string, data: object, excludeId?: string) {
  const payload = JSON.stringify(data);
  clients.forEach((client, id) => {
    if (id !== excludeId && client.rooms.has(room) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}
```

### Client WebSocket avec reconnexion

```typescript
function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };

    wsRef.current.onclose = () => {
      // Reconnexion automatique après 3s
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { messages, send };
}
```

---

## Performance web

### Core Web Vitals

| Métrique | Description | Seuil "Bon" |
|----------|-------------|------------|
| **LCP** (Largest Contentful Paint) | Chargement du contenu principal | < 2.5s |
| **FID** / **INP** (Interaction to Next Paint) | Réactivité aux interactions | < 200ms |
| **CLS** (Cumulative Layout Shift) | Stabilité visuelle | < 0.1 |
| **TTFB** (Time to First Byte) | Réponse serveur | < 800ms |
| **FCP** (First Contentful Paint) | Premier pixel affiché | < 1.8s |

### Optimisations Next.js

```typescript
// 1. Image optimisée (lazy loading + formats modernes)
import Image from 'next/image';
<Image src="/hero.jpg" width={800} height={400} priority alt="Hero" />

// 2. Font optimisée (évite CLS)
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// 3. Bundle splitting automatique
// Les pages ne chargent que leur code JS

// 4. Streaming SSR avec Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>

// 5. Incremental Static Regeneration (ISR)
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(p => ({ id: p.id }));
}

export const revalidate = 3600;  // Regénérer toutes les heures
```

---

## Tests front-end

### Vitest + React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('affiche une erreur si les champs sont vides', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /connexion/i }));

    expect(screen.getByText(/email requis/i)).toBeInTheDocument();
  });

  it('appelle onSubmit avec les bonnes valeurs', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /connexion/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});
```

### Playwright — Tests E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('login avec identifiants valides', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name=email]', 'user@test.com');
    await page.fill('[name=password]', 'secret');
    await page.click('button[type=submit]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Bienvenue')).toBeVisible();
  });

  test('redirige si non authentifié', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
```
