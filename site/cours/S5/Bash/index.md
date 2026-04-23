---
layout: course
title: "Scripting Bash"
semestre: "S5"
type_cours: "dev"
tags: ["bash", "shell", "scripts", "automatisation"]
---

## Introduction

Le **Bash** (*Bourne Again Shell*) est le shell par défaut sur la plupart des systèmes GNU/Linux. Ce cours couvre l'écriture de scripts Bash pour automatiser des tâches d'administration système, de traitement de fichiers et de gestion de données.

## Bases du scripting

### Shebang et exécution

```bash
#!/bin/bash
# Première ligne obligatoire : indique l'interpréteur

echo "Bonjour, monde !"
```

```bash
chmod +x monscript.sh   # rendre exécutable
./monscript.sh           # exécuter
```

### Variables

```bash
NOM="Alice"
AGE=21

echo "Nom : $NOM, âge : $AGE"
echo "Nom : ${NOM}"     # forme explicite (recommandée dans les strings)

# Lecture au clavier
read -p "Entrez votre nom : " UTILISATEUR
```

### Arguments positionnels

```bash
# $0 = nom du script, $1 = premier arg, $# = nombre d'args
echo "Script : $0"
echo "Premier argument : $1"
echo "Nombre d'arguments : $#"
```

## Structures de contrôle

### Conditions

```bash
if [ "$1" == "bonjour" ]; then
    echo "Salutation reçue"
elif [ "$1" == "aurevoir" ]; then
    echo "Au revoir !"
else
    echo "Argument inconnu : $1"
fi

# Test de fichier
if [ -f "/etc/passwd" ]; then
    echo "Le fichier existe."
fi

if [ -d "/tmp" ]; then
    echo "Le répertoire existe."
fi
```

**Opérateurs de comparaison :**

| Numérique | Chaîne | Signification |
|-----------|--------|--------------|
| `-eq` | `==` | Égal |
| `-ne` | `!=` | Différent |
| `-lt` | `<` | Inférieur |
| `-gt` | `>` | Supérieur |
| `-le` | `<=` | Inférieur ou égal |
| `-ge` | `>=` | Supérieur ou égal |

### Boucles

```bash
# for
for i in 1 2 3 4 5; do
    echo "Itération : $i"
done

# for avec séquence
for i in $(seq 1 10); do
    echo "Ligne $i"
done

# while
COUNT=0
while [ $COUNT -lt 5 ]; do
    echo "Compteur : $COUNT"
    COUNT=$((COUNT + 1))
done
```

## Manipulation de chaînes et fichiers

```bash
# Substitution de commande
DATE=$(date +"%Y-%m-%d")
echo "Aujourd'hui : $DATE"

# Opérations arithmétiques
RESULT=$((5 + 3 * 2))
echo "Résultat : $RESULT"

# Manipulation de chaînes
STR="hello_world"
echo ${STR^^}         # HELLO_WORLD (majuscules)
echo ${STR//_/ }      # hello world (remplacer _ par espace)
echo ${#STR}          # 11 (longueur)
```

## Traitement de fichiers

```bash
# Lire un fichier ligne par ligne
while IFS= read -r ligne; do
    echo "$ligne"
done < fichier.txt

# Traitement CSV
while IFS=',' read -r nom age ville; do
    echo "Nom : $nom, Âge : $age, Ville : $ville"
done < donnees.csv
```

## Projet S5 — Météo et Pokémon

Les projets Bash du semestre portaient sur :

1. **Météo** — script `meteo.sh` qui récupère et affiche des données météorologiques.
2. **Pokémon** — traitement du fichier `Pokemon.csv` pour filtrer, trier et afficher des statistiques.

> **Note** : les archives `.tar.gz` du cours contiennent les données des exercices pratiques (alice.tar.gz, user.tar).

### Exemple — analyse d'un CSV Pokémon

```bash
#!/bin/bash
# Afficher les Pokémons de type Feu
grep "Fire" Pokemon.csv | sort -t',' -k2 | head -10
```

## Résumé

- Un script Bash est un fichier texte exécutable — toujours commencer par `#!/bin/bash`.
- Les variables ne se typent pas — tout est chaîne par défaut, `$((…))` pour l'arithmétique entière.
- `while read` est le pattern idiomatique pour lire des fichiers ligne par ligne.
- Combiner `grep`, `awk`, `sed`, `sort`, `uniq` et des pipes `|` permet de traiter n'importe quel fichier texte sans écrire de code complexe.

## Références

- Cours Scripting Bash, S5 2024-2025
- Fichiers source : `Projet_newsur_meteo.pdf`, `Projet_pokemon.pdf`, `meteo.sh`, `Pokemon.csv`
- Archives de données : `alice.tar.gz`, `user.tar`
