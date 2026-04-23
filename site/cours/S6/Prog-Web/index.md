---
layout: course
title: "Programmation Web avancée"
semestre: "S6"
type_cours: "dev"
tags: ["HTML", "CSS", "JavaScript", "DOM", "événements", "timers"]
---

## Introduction

Ce cours approfondit le développement web côté client — manipulation du DOM, gestion des événements, animations via timers, et bonnes pratiques JavaScript.

## Structure HTML fondamentale

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ma page</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body onload="init()">
  <!-- Contenu -->
</body>
</html>
```

### Balises essentielles

| Balise | Type | Usage |
|--------|------|-------|
| `<div>` | Bloc | Conteneur générique |
| `<span>` | Inline | Mise en forme partielle |
| `<p>`, `<h1>`–`<h6>` | Bloc | Texte structuré |
| `<ul>`, `<li>` | Bloc | Listes |
| `<img src="…" />` | Inline | Image |
| `<a href="…">` | Inline | Lien hypertexte |
| `<input>`, `<form>` | Bloc | Formulaires |
| `<canvas>` | Bloc | Dessin 2D (jeux, graphiques) |

## CSS — Ciblage et styles

```css
/* Par identifiant */
#monId { color: red; font-size: 1.2em; }

/* Par classe */
.maClasse { font-weight: bold; margin: 0.5rem; }

/* Par balise */
p { line-height: 1.6; }

/* Pseudo-classe */
button:hover { background: #007bff; color: white; }

/* Positionnement absolu */
.case {
  position: absolute;
  left: 100px;
  top: 50px;
  width: 20px;
  height: 20px;
}
```

> **Règle d'or** : préférer modifier `element.style.backgroundColor` plutôt que `element.style = "…"` — le second écrase **tous** les styles inline existants.

## JavaScript — Bases du langage

### Déclarations et types

```js
let x = 5;           // variable réaffectable
const PI = 3.14;     // constante (ne peut pas être réaffectée)

let nom = "Alice";
let actif = true;
let liste = [1, 2, 3];
```

### Conditions

```js
if (x === 5) {
  console.log("cinq");
} else if (x > 5) {
  console.log("plus de cinq");
} else {
  console.log("moins de cinq");
}

switch (couleur) {
  case "rouge": alert("Stop !"); break;
  case "vert":  alert("Go !");   break;
  default:      alert("Attends.");
}
```

### Boucles

```js
for (let i = 0; i < 10; i++) {
  console.log(i);
}

while (condition) {
  // ...
}
```

### Fonctions

```js
// Déclaration classique
function addition(a, b) {
  return a + b;
}

// Fonction fléchée (arrow function)
const carre = (n) => n * n;

// Template string (interpolation)
let prenom = "Éric";
let msg = `Bonjour ${prenom}, tu as ${2024 - 2003} ans.`;
```

## DOM — Manipulation dynamique

Le **DOM** (*Document Object Model*) est la représentation en arbre de la page HTML, manipulable via JavaScript.

### Sélection d'éléments

```js
let el   = document.getElementById("monId");
let els  = document.getElementsByTagName("div");
let el2  = document.querySelector(".maClasse");        // premier élément
let els2 = document.querySelectorAll(".maClasse");      // tous
```

### Modification du contenu

```js
el.innerHTML  = "<b>Nouveau HTML</b>";   // interprète le HTML
el.textContent = "Texte brut";           // texte uniquement (plus sûr)
el.setAttribute("class", "actif");
el.className  += " nouvelleClasse";      // ⚠️ ajouter un espace !
```

### Création et insertion d'éléments

```js
function createCase(x, y, n) {
  const div = document.createElement("div");
  div.innerText = n;
  div.style.cssText = `
    width: 20px; height: 20px;
    position: absolute; left: ${x}px; top: ${y}px;
    text-align: center; line-height: 20px;
    border: 1px solid black; cursor: pointer;
  `;
  return div;
}

document.body.appendChild(createCase(100, 50, 7));
```

## Événements

### Déclaration

```js
// Attribut HTML (déconseillé dans le code moderne)
// <button onclick="doSomething()">Clique</button>

// Propriété JS
el.onclick = () => { alert("cliqué !"); };

// addEventListener (recommandé — plusieurs listeners possibles)
el.addEventListener("click", (e) => {
  console.log("clic sur", e.target);
});
```

### Événements courants

| Événement | Déclencheur |
|-----------|-------------|
| `click` | Clic souris |
| `mouseover` / `mouseout` | Survol |
| `keydown` / `keyup` | Touche clavier |
| `change` | Modification d'un champ |
| `submit` | Soumission de formulaire |
| `load` | Chargement de la page |

## Timers et animations

```js
// Exécuter une fois après un délai
const id = setTimeout(() => {
  console.log("2 secondes plus tard");
}, 2000);

// Exécuter périodiquement
let timerId = setInterval(() => {
  console.log("toutes les secondes");
}, 1000);

// Stopper le timer
clearTimeout(id);
clearInterval(timerId);
```

### Pattern : animation pendant un temps limité

```js
// Animation pendant 6 secondes, rafraîchie toutes les 100 ms
let anim = setInterval(miseAJour, 100);
setTimeout(() => clearInterval(anim), 6000);
```

### Chronomètre avec affichage formaté

```js
function formatTime(min, sec) {
  const mm = min < 10 ? `0${min}` : min;
  const ss = sec < 10 ? `0${sec}` : sec;
  return `${mm}:${ss}`;
}
```

## Projet pratique — Jeu de Loto

**Objectif** : créer une grille de 49 numéros, permettre à l'utilisateur d'en sélectionner 6, puis tirer 6 numéros aléatoires et afficher les correspondances.

```js
// Tirage sans doublon
function tirage() {
  const nums = [];
  while (nums.length < 6) {
    const n = Math.floor(Math.random() * 49) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

// Limiter la sélection à 6 cases
let selection = [];
div.onclick = () => {
  if (selection.length < 6 && !selection.includes(n)) {
    selection.push(n);
    div.style.backgroundColor = "yellow";
  }
};
```

## Aléatoire dans une plage

```js
// Nombre entier entre min (inclus) et max (exclu)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
```

## Résumé

- Toujours modifier les propriétés CSS individuellement (`el.style.backgroundColor`) plutôt que d'écraser tout le style.
- `addEventListener` est préférable à `onclick=` — permet plusieurs listeners sans conflit.
- `setTimeout` pour une action différée unique, `setInterval` pour une répétition — toujours stocker l'ID pour pouvoir annuler.
- Le DOM est un arbre — on peut créer, insérer, modifier ou supprimer n'importe quel nœud à l'exécution.

## Références

- Cours Programmation Web — Denis Payet, S6 2024-2025
- Fichiers source : `RECAP.md`, `COURS/TD Cours.md`
- MDN Web Docs : `https://developer.mozilla.org/fr/`
