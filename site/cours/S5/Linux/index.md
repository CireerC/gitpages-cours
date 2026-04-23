---
layout: course
title: "Administration Linux"
semestre: "S5"
type_cours: "dev"
tags: ["Linux", "bash", "commandes", "administration"]
---

## Introduction

Ce cours présente les commandes essentielles pour administrer un système GNU/Linux en ligne de commande. Ces notions sont complémentaires au cours Systèmes d'Exploitation (UNIX) et forment la base de tout travail sur serveur.

## Commandes fondamentales

### Navigation et fichiers

```bash
ls          # lister le contenu d'un répertoire
ls -la      # afficher les permissions, taille, date
cd /chemin  # changer de répertoire
pwd         # afficher le répertoire courant
mkdir nom   # créer un répertoire
rm fichier  # supprimer un fichier
rm -r doss  # supprimer un répertoire récursivement
cp src dst  # copier
mv src dst  # déplacer / renommer
```

### Lecture et recherche

```bash
cat fichier      # afficher un fichier
less fichier     # afficher page par page
grep "motif" f   # chercher un motif dans un fichier
grep -r "motif"  # cherche récursivement
find / -name "*.log"  # rechercher des fichiers par nom

tee fichier      # lire depuis stdin ET écrire dans un fichier simultanément
xargs            # passer la sortie d'une commande en arguments d'une autre
```

### Liens symboliques

```bash
ln -s /chemin/source /chemin/lien   # créer un lien symbolique
readlink /chemin/lien               # afficher la cible d'un lien
```

### Espace disque

```bash
df -h       # afficher l'espace disponible sur les systèmes de fichiers
du -sh *    # taille de chaque élément du répertoire courant
find . -type f -size +100M  # fichiers de plus de 100 Mo
```

## Droits et permissions

```bash
chmod 755 fichier   # rwxr-xr-x
chmod +x script.sh  # rendre exécutable
chown user:group f  # changer propriétaire
```

| Valeur | Permission | Signification |
|--------|-----------|---------------|
| 4 | r | Lecture (read) |
| 2 | w | Écriture (write) |
| 1 | x | Exécution (execute) |
| 0 | — | Aucun droit |

Exemple : `chmod 640` → propriétaire `rw-`, groupe `r--`, autres `---`.

## Processus et services

```bash
ps aux          # lister tous les processus
top / htop      # moniteur de ressources en temps réel
kill PID        # envoyer SIGTERM (arrêt propre)
kill -9 PID     # envoyer SIGKILL (arrêt forcé)

systemctl status service   # état d'un service
systemctl start service
systemctl stop service
journalctl -u service -f   # logs en temps réel
```

## Réseau

```bash
ip addr             # afficher les interfaces réseau
ping hôte           # tester la connectivité
curl http://url     # faire une requête HTTP
wget http://url     # télécharger un fichier
ss -tulnp           # afficher les ports en écoute
```

## Gestion des paquets (Debian/Ubuntu)

```bash
apt update            # mettre à jour la liste des paquets
apt upgrade           # mettre à jour les paquets installés
apt install paquet    # installer un paquet
apt remove paquet     # désinstaller
dpkg -l               # lister les paquets installés
```

## Scripts Bash

```bash
#!/bin/bash
# Exemple de script basique

NOM="Monde"
echo "Bonjour, $NOM !"

for i in 1 2 3; do
    echo "Itération $i"
done

if [ -f "/etc/passwd" ]; then
    echo "Le fichier existe."
fi
```

## Résumé

- La maîtrise de la ligne de commande est indispensable pour administrer un serveur sans GUI.
- `find`, `grep`, `xargs` et `tee` sont les outils de traitement de texte les plus puissants.
- Les permissions Unix (rwx) contrôlent finement qui peut lire, écrire et exécuter.
- SystemD gère le cycle de vie des services — toujours utiliser `systemctl` plutôt que de lancer les processus à la main.

## Références

- Cours Linux, S5 2024-2025
- Fichiers source : `Cours.md`, `linux-101.pdf`, `linux-102.pdf`
- Lab en ligne : `https://ebraux.gitlab.io/linux-labs/`
