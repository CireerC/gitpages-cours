---
layout: default
title: "Algo en C - Cookies"
semestre: "S5"
type_cours: "dev"
tags:
  - cours
  - algo-c
  - reseaux
  - http
---

# Algo en C - Cookies

## Informations
- `Semestre` : S5
- `Type` : dev
- `UE / Module` : Algo en C
- `Sujet` : Gestion des cookies HTTP entre client et serveur

## Mini plan
1. Cookie envoye par le serveur (`Set-Cookie`)
2. Cookie renvoye par le client (`Cookie`)
3. Regles de securite et de portee
4. Resume des champs importants

## Ce que l'on aborde
- Le role des cookies dans HTTP pour conserver un etat entre plusieurs requetes.
- Les attributs de `Set-Cookie`: `Expires`, `Max-Age`, `Domain`, `Path`, `Secure`, `HttpOnly`, `SameSite`.
- Les conditions d'envoi d'un cookie par le navigateur vers le serveur.
- Les bonnes pratiques de securite (HTTPS, XSS, CSRF).

## Resume complet
Dans HTTP, les cookies servent a memoriser des informations entre plusieurs requetes, par exemple une session utilisateur, une langue ou une preference d'interface. Le serveur cree un cookie dans la reponse via l'entete `Set-Cookie`. Le navigateur stocke ensuite ce cookie et le renvoie plus tard dans l'entete `Cookie` si les regles de domaine, chemin, securite et expiration sont respectees.

Le serveur peut definir la duree de vie d'un cookie avec `Expires` (date fixe) ou `Max-Age` (duree en secondes). Il peut aussi limiter sa portee avec `Domain` et `Path`. Pour la securite, `Secure` force l'envoi uniquement en HTTPS, `HttpOnly` empeche l'acces JavaScript direct (protection XSS), et `SameSite` controle les envois inter-sites (reduction des risques CSRF).

Cote client, le navigateur ne renvoie pas tous les cookies: seulement ceux qui correspondent au domaine et au chemin de la requete, et qui ne sont pas expires. En pratique, bien configurer les attributs est essentiel pour combiner fonctionnement applicatif et securite web.

## Notes detaillees

### 1. Envoi d'un cookie depuis le serveur

Le serveur envoie un cookie dans la reponse HTTP avec l'entete `Set-Cookie`.

```http
Set-Cookie: sessionId=abc123; Expires=Wed, 09 Oct 2024 10:00:00 GMT; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=Lax
```

Champs principaux:
- `Set-Cookie: nom=valeur` : definit le cookie.
- `Expires` : date d'expiration.
- `Max-Age` : duree de vie en secondes.
- `Domain` : domaine autorise.
- `Path` : chemin autorise.
- `Secure` : HTTPS uniquement.
- `HttpOnly` : inaccessible via JavaScript.
- `SameSite` : controle les requetes inter-sites (`Strict`, `Lax`, `None`).

### 2. Envoi d'un cookie depuis le client

Le navigateur renvoie les cookies dans l'entete `Cookie`.

```http
Cookie: sessionId=abc123; theme=dark; lang=fr
```

Chaque paire `nom=valeur` correspond a un cookie valide pour la requete courante.

### 3. Regles d'envoi cote client

Le navigateur envoie un cookie seulement si:
- le domaine et le chemin correspondent,
- le cookie n'est pas expire,
- la contrainte `Secure` est satisfaite (HTTPS),
- la politique `SameSite` autorise l'envoi.

### 4. Resume rapide

- Serveur -> Client: `Set-Cookie` pour creer/configurer.
- Client -> Serveur: `Cookie` pour renvoyer.
- Securite: `Secure`, `HttpOnly`, `SameSite` sont essentiels.
