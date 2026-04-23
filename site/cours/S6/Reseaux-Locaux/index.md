---
layout: course
title: "Réseaux locaux"
semestre: "S6"
type_cours: "réseaux"
tags: ["LAN", "VLAN", "commutation", "spanning tree", "Cisco", "IPv6"]
---

## Introduction

Ce cours approfondit les réseaux locaux (LAN) — architecture des switches, VLANs, protocoles de niveau 2 et introduction à IPv6. Il complète le cours de Principes des Réseaux (S5) en se concentrant sur les équipements et configurations pratiques.

## Architecture des réseaux locaux

### Switch vs Routeur

| Appareil | Couche OSI | Fonction |
|---------|-----------|---------|
| **Hub** | Couche 1 | Diffuse à tous (obsolète) |
| **Switch** | Couche 2 | Commute selon les adresses MAC |
| **Routeur** | Couche 3 | Route selon les adresses IP |
| **Switch L3** | Couches 2+3 | Commute ET route |

### Table CAM (Content Addressable Memory)

Le switch apprend les adresses MAC des équipements connectés à chacun de ses ports et les stocke dans sa **table CAM** :

```
Port 1 → AA:BB:CC:DD:EE:01
Port 2 → AA:BB:CC:DD:EE:02
Port 3 → AA:BB:CC:DD:EE:03
```

Si l'adresse MAC de destination est inconnue → le switch **diffuse** (flood) sur tous les ports sauf celui d'entrée.

## VLANs — Réseaux Locaux Virtuels

Un **VLAN** (*Virtual LAN*) segmente logiquement un réseau physique en plusieurs réseaux isolés.

### Avantages

- **Sécurité** : isoler les équipements sensibles (serveurs, IoT, administration)
- **Performance** : réduire les domaines de diffusion (broadcast)
- **Flexibilité** : regrouper des équipements distants dans le même réseau logique

### Trunk et Access ports

| Type de port | Usage | Trame |
|-------------|-------|-------|
| **Access** | Connecte un équipement terminal (PC, imprimante) | Trame Ethernet standard |
| **Trunk** | Connecte deux switches | Trame 802.1Q taguée (VLAN ID) |

```
PC (VLAN 10) ──[access]── Switch1 ──[trunk 802.1Q]── Switch2 ──[access]── PC (VLAN 10)
```

### Configuration Cisco IOS

```bash
# Créer les VLANs
Switch(config)# vlan 10
Switch(config-vlan)# name Etudiants
Switch(config)# vlan 20
Switch(config-vlan)# name Administration

# Configurer un port access
Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

# Configurer un port trunk
Switch(config)# interface gi0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20
```

## Spanning Tree Protocol (STP)

**STP** (IEEE 802.1D) empêche les boucles de niveau 2 dans un réseau commuté redondant.

### Fonctionnement

1. **Élection du pont racine** (*Root Bridge*) — le switch avec le **BID** (Bridge ID) le plus bas
2. **Calcul du chemin le moins coûteux** vers le pont racine
3. **Blocage des ports redondants** pour casser les boucles

### États STP des ports

```
Blocking → Listening → Learning → Forwarding
  (15s)       (15s)       →    (stable)
```

### Améliorations : RSTP et MSTP

- **RSTP** (802.1w) : convergence rapide (≤ 1s au lieu de 30–50s)
- **MSTP** (802.1s) : un STP par groupe de VLANs

## Protocoles de niveau 2

### ARP — Résolution MAC/IP

```bash
# Consulter le cache ARP
arp -a

# Sur Cisco
show arp
```

### DHCP Snooping

Protège contre les serveurs DHCP frauduleux (*rogue DHCP*) sur le réseau local.

```bash
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 10
Switch(config)# interface fa0/24
Switch(config-if)# ip dhcp snooping trust  # Port vers le vrai serveur DHCP
```

## Introduction à IPv6

IPv4 : 32 bits (~4 milliards d'adresses, épuisées depuis 2011).
IPv6 : 128 bits → $3.4 \times 10^{38}$ adresses.

### Format d'adresse IPv6

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

**Abréviation** :
- Supprimer les zéros en tête de chaque groupe
- Remplacer un seul groupe de `0000` consécutifs par `::`

```
2001:db8:85a3::8a2e:370:7334
```

### Types d'adresses IPv6

| Type | Préfixe | Portée |
|------|---------|--------|
| **Lien-local** | `fe80::/10` | Liaison (non routable) |
| **Unique-local** | `fc00::/7` | Site privé (≈ RFC1918) |
| **Global unicast** | `2000::/3` | Internet public |
| **Multicast** | `ff00::/8` | Groupe d'interfaces |

### Découverte de voisins (NDP)

IPv6 remplace ARP par le protocole **NDP** (*Neighbor Discovery Protocol*) — utilise ICMPv6 et multicast.

```bash
# Voir la table de voisins IPv6 (≈ table ARP)
ip -6 neighbor show
```

## Résumé

- Les **VLANs** segmentent logiquement le réseau — indispensables en entreprise pour la sécurité et les performances.
- **STP** prévient les boucles de niveau 2 — préférer RSTP pour une convergence rapide.
- **DHCP Snooping** et **Port Security** protègent les réseaux locaux contre les attaques internes.
- **IPv6** est le successeur d'IPv4 — adoption progressive mais inévitable.

## Références

- Cours Réseaux Locaux, S6 2024-2025
- Fichiers source : `2025-04-10.md`, `TP DE FOU.md`
- Supports PDF : challenge, activité Packet Tracer
- MOOC IPv6 : `https://www.fun-mooc.fr/` (modules A17, A27, A37)
