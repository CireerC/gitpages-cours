---
layout: course
title: "Principes des réseaux"
semestre: "S5"
type_cours: "réseaux"
tags: ["OSI", "TCP/IP", "protocoles", "couches réseau"]
---

## Introduction

Ce cours présente les principes fondamentaux des réseaux informatiques à travers le modèle en couches OSI/TCP-IP. Chaque couche est étudiée indépendamment — son rôle, ses protocoles et ses mécanismes de contrôle.

## Le modèle en couches

### Couche 7 — Application

La couche applicative identifie les services via des **numéros de port**. Elle est responsable de la sémantique des échanges (HTTP, DNS, FTP…).

- Un port identifie un processus sur une machine donnée.
- Problème de **congestion** : si l'application émet trop vite, les tampons (*buffers*) se remplissent, provoquant des pertes de paquets et une augmentation de la latence.

### Couche 4 — Transport

La couche transport est exécutée par le **socket**, au niveau du système d'exploitation.

**TCP — Transmission Control Protocol**

TCP est un protocole fiable orienté connexion. Il gère :

- **Contrôle de congestion** : algorithme *Slow Start* — la fenêtre de congestion commence à 1 paquet, double à chaque ACK reçu (`1 → 2 → 4 → 8…`) jusqu'à une perte, puis est divisée par deux. On passe ensuite en *Additive Increase / Multiplicative Decrease* (AIMD).
- **Contrôle de flux** : fenêtre de réception annoncée par le destinataire — l'émetteur ne doit pas dépasser ce que le récepteur peut absorber.

**UDP — User Datagram Protocol**

Sans connexion, sans garantie de livraison. Utilisé quand la latence prime sur la fiabilité (voix sur IP, jeux en ligne, LoRa).

### Couche 3 — Réseau (IP)

Exécutée sur le CPU, par le système d'exploitation.

- **Adressage** : chaque hôte est identifié par une adresse IP (IPv4 32 bits, IPv6 128 bits).
- **Routage** : acheminement des paquets de saut en saut grâce aux **tables de routage**.
- **Algorithmes de routage** : algorithme du plus court chemin (Dijkstra → OSPF), vecteur de distance (RIP).
- **Qualité de service (QoS)** : *best effort* par défaut ; possibilité de réserver du débit ou prioriser des flux.
- **Pare-feu** : filtrage des paquets à la couche 3.

### Couche 2 — Liaison de données

Exécutée sur la **carte réseau**.

- **Adressage MAC** (48 bits) — identifiant physique unique de l'interface.
- **Fiabilité locale** : détection d'erreurs par CRC (*Cyclic Redundancy Check*) ou checksum.
- **Half duplex vs Full duplex** :
  - *Half duplex* : un seul sens à la fois (WiFi, talkie-walkie).
  - *Full duplex* : deux canaux séparés permettent l'émission et la réception simultanées (Ethernet câblé).

**Protocoles d'accès au canal**

| Protocole | Description |
|-----------|-------------|
| ALOHA | Émettre sans écouter → collision si deux hôtes émettent simultanément |
| CSMA | Écouter avant d'émettre (*Carrier Sense*) |
| CSMA/CD | CSMA + détection de collision (Ethernet câblé) |
| CSMA/CA | CSMA + évitement de collision (WiFi) |

**Nuance WiFi vs Ethernet**

- **Ethernet** : écoute le canal et émet dès qu'il est libre.
- **WiFi** : même si le canal est libre, l'hôte tire une valeur aléatoire de *backoff* (entre 0 et 31 slots) avant d'émettre — évite les collisions simultanées au moment où le canal se libère.

**LoRa** : ne fait pas de CSMA car l'écoute du canal est trop consommatrice en énergie pour des capteurs IoT.

## Notions clés supplémentaires

### Délai de propagation

Le délai de propagation est le temps que met un signal pour parcourir un lien physique. Les ondes électromagnétiques se propagent plus vite que les ondes sonores — c'est pourquoi les réseaux câblés peuvent avoir de très faibles latences.

### Table de commutation (plan de données)

Chaque équipement réseau (routeur, switch) maintient une table de commutation qui associe une destination à une interface de sortie. C'est le **plan de données** (data plane). La construction de cette table est assurée par les **protocoles de routage** (plan de contrôle).

## Résumé

- Le modèle en couches permet d'isoler les responsabilités : chaque couche offre un service à la couche supérieure.
- TCP assure la fiabilité et le contrôle de congestion ; UDP sacrifie la fiabilité pour la performance.
- La couche 2 gère le partage du canal physique via des protocoles d'accès (CSMA/CD, CSMA/CA).
- La couche 3 route les paquets entre réseaux différents à l'aide d'algorithmes de plus court chemin.

## Références

- Cours magistraux et TD de Principes des Réseaux (S5)
- Fichiers : `cours.md`, `Correction TD.md`, slides Chapitres 1–4 (PPTX)
- Analyse Wireshark : `Wireshark_IP_v8.1 fr.odt`
