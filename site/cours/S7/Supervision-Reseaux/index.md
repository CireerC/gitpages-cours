---
layout: course
title: "Supervision et gestion des réseaux"
semestre: "S7"
type_cours: "réseaux"
tags: ["SNMP", "Zabbix", "Nagios", "syslog", "NetFlow", "QoS", "ITSM", "ITIL"]
---

## Introduction

La supervision réseau permet de surveiller l'état et les performances de l'infrastructure IT en temps réel. Ce cours couvre les protocoles de supervision, les outils de monitoring et la gestion des incidents selon ITIL.

---

## SNMP — Simple Network Management Protocol

### Architecture

```
Manager (Zabbix, Nagios)
    │
    │  GET / SET / GETBULK (UDP 161)
    │  TRAP / INFORM (UDP 162)
    │
    ▼
Agent SNMP (switch, routeur, serveur)
    │
    └── MIB (Management Information Base)
        └── OID tree : 1.3.6.1.2.1.1.1 = sysDescr
                       1.3.6.1.2.1.1.3 = sysUpTime
                       1.3.6.1.2.1.2.2 = ifTable
```

### Versions

| Version | Sécurité | Usage |
|---------|---------|-------|
| v1 | Community string (clair) | Obsolète |
| v2c | Community string (clair) | Encore répandu |
| v3 | Auth (MD5/SHA) + chiffrement (AES/DES) | Recommandé |

### Commandes snmpwalk/snmpget

```bash
# SNMP v2c — lire le descriptif système
snmpget -v2c -c public 192.168.1.1 1.3.6.1.2.1.1.1.0

# Parcourir toute la MIB
snmpwalk -v2c -c public 192.168.1.1 .1.3.6.1.2.1

# Uptime du switch
snmpget -v2c -c public 192.168.1.1 sysUpTime.0

# Statistiques des interfaces (ifTable)
snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.2.2.1.10  # ifInOctets
snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.2.2.1.16  # ifOutOctets

# SNMP v3 — authentification + chiffrement
snmpget -v3 -l authPriv -u adminuser \
  -a SHA -A "auth_password" \
  -x AES -X "priv_password" \
  192.168.1.1 sysUpTime.0

# Recevoir des traps
snmptrapd -f -Lo -c /etc/snmp/snmptrapd.conf
```

### Configuration SNMP v3 sur Cisco

```
# Configuration d'un groupe SNMPv3
snmp-server group MONITORING v3 priv
snmp-server user ZABBIX MONITORING v3 auth sha "MonMotDePasse" priv aes 128 "MonCle"
snmp-server view READONLY_VIEW iso included
snmp-server group MONITORING v3 priv read READONLY_VIEW

# Trap destination
snmp-server host 10.0.0.10 version 3 priv ZABBIX
snmp-server enable traps
```

---

## Syslog

### Niveaux de sévérité

| Code | Niveau | Description |
|------|--------|-------------|
| 0 | Emergency | Système inutilisable |
| 1 | Alert | Action immédiate requise |
| 2 | Critical | Conditions critiques |
| 3 | Error | Conditions d'erreur |
| 4 | Warning | Avertissement |
| 5 | Notice | Normal mais significatif |
| 6 | Informational | Messages informatifs |
| 7 | Debug | Débogage |

### Configuration rsyslog

```bash
# /etc/rsyslog.conf — centralisation des logs
# Réception des logs distants (UDP 514)
module(load="imudp")
input(type="imudp" port="514")
module(load="imtcp")
input(type="imtcp" port="514")

# Stockage par hôte et date
template(name="RemoteLogs" type="string"
  string="/var/log/remote/%HOSTNAME%/%$YEAR%-%$MONTH%-%$DAY%.log")

if $fromhost-ip != '127.0.0.1' then {
    action(type="omfile" DynaFile="RemoteLogs")
    stop
}

# Rotation automatique
# /etc/logrotate.d/remote-logs
/var/log/remote/*/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        systemctl kill -s HUP rsyslog
    endscript
}
```

```bash
# Configuration rsyslog sur l'équipement distant (Cisco/Linux)
# Linux
echo "*.* @192.168.1.100:514" >> /etc/rsyslog.conf   # UDP
echo "*.* @@192.168.1.100:514" >> /etc/rsyslog.conf  # TCP

# Cisco
logging host 192.168.1.100
logging trap informational
logging facility local7
```

---

## Zabbix — Supervision avancée

### Architecture

```
Zabbix Server (base de données + moteur d'alertes)
    │
    ├── Zabbix Proxy (supervision de sites distants)
    │       │
    │       ├── Agent actif (hôte Linux)
    │       └── Agent passif (hôte Windows)
    │
    └── SNMP / IPMI / JMX (sans agent)
```

### Template d'item SNMP

```xml
<!-- Item Zabbix : débit entrant interface eth0 -->
Nom     : Interface eth0 - Inbound traffic
Clé     : net.if.in[eth0]
Type    : Zabbix agent
Unité   : bps
Calcul  : change/s (pour delta)

<!-- Via SNMP -->
Clé SNMP  : 1.3.6.1.2.1.2.2.1.10.{#SNMPINDEX}
Type      : SNMP agent
OID       : .1.3.6.1.2.1.2.2.1.10.{#SNMPINDEX}
```

### Déclencheur (trigger)

```
Condition: {host:system.cpu.load.avg(5m)} > 80
Sévérité : Warning

Condition: {host:agent.ping.nodata(3m)} = 1
Sévérité : High

Condition: {host:net.if.in[eth0].last()} > 900000000
Sévérité : Warning (bande passante > 900 Mbit/s sur 1 Gbit/s)
```

---

## NetFlow / sFlow

**NetFlow** (Cisco) et **sFlow** (RFC 3176) analysent les flux IP pour la comptabilité, la détection d'anomalies et le capacity planning.

```
Équipement réseau
    │
    │ Export NetFlow (UDP 2055)
    ▼
Collecteur NetFlow (nfdump, ntopng)
    │
    └── Analyse, graphes, alertes
```

### nfdump — Analyse NetFlow

```bash
# Démarrer le collecteur nfcapd
nfcapd -w -D -l /var/cache/nfdump/ -p 2055

# Analyser les flux (top 10 sources par volume)
nfdump -R /var/cache/nfdump/nfcapd.202401010000 \
  -n 10 -s srcip/bytes \
  -o "fmt:%sa -> %da : %pkt pkts, %byt bytes"

# Filtrer les flux suspects (trop de connexions depuis une IP)
nfdump -R /var/cache/nfdump/ \
  -A srcip \
  'proto tcp and flags S and not flags AFRPU' \
  -n 20 -s srcip/flows

# Exporter vers CSV
nfdump -R /var/cache/nfdump/ -o csv > flows.csv
```

---

## QoS — Qualité de Service

### Modèles QoS

| Modèle | Description | Mécanisme |
|--------|-------------|-----------|
| **Best Effort** | Aucune garantie | Par défaut |
| **IntServ** | Réservation par flux (RSVP) | Complexe, scalabilité limitée |
| **DiffServ** | Classes de trafic par DSCP | Standard industrie |

### DSCP (Differentiated Services Code Point)

```
En-tête IP (byte ToS) :
[ DSCP (6 bits) ][ ECN (2 bits) ]

Classes DSCP :
  EF  (46) : Expedited Forwarding — voix, vidéo temps réel
  AF41(34) : Assured Forwarding — vidéoconférence
  AF21(18) : Assured Forwarding — data critique
  CS0 ( 0) : Best Effort — trafic standard
```

### Configuration QoS sur Linux (tc)

```bash
# HTB (Hierarchical Token Bucket) — garantir 50 Mbit/s pour la VoIP
tc qdisc add dev eth0 root handle 1: htb default 30

# Classe parente (100 Mbit/s total)
tc class add dev eth0 parent 1: classid 1:1 htb rate 100mbit

# VoIP — garanti 10 Mbit/s, burst 15 Mbit/s
tc class add dev eth0 parent 1:1 classid 1:10 htb rate 10mbit ceil 15mbit prio 1

# Best effort — reste de la bande passante
tc class add dev eth0 parent 1:1 classid 1:30 htb rate 1mbit ceil 100mbit prio 3

# Filtre : VoIP identifiée par DSCP EF (46)
tc filter add dev eth0 parent 1:0 protocol ip u32 \
  match ip dscp 46 0xfc flowid 1:10
```

---

## ITIL — Gestion des incidents

### Cycle de vie d'un incident

```
Détection (monitoring) → Journalisation (ITSM) → Catégorisation
          → Priorisation (Impact × Urgence) → Diagnostic
          → Résolution → Fermeture → Retour d'expérience
```

### Matrice de priorité

| Urgence \ Impact | Faible | Moyen | Élevé |
|----------------|--------|-------|-------|
| **Faible** | P4 | P3 | P2 |
| **Moyen** | P3 | P2 | P1 |
| **Élevé** | P2 | P1 | P1 |

### SLA (Service Level Agreement) types

| Priorité | Délai d'accusé de réception | Délai de résolution |
|---------|-----------------------------|--------------------|
| P1 — Critique | 15 min | 4 heures |
| P2 — Élevé | 30 min | 8 heures |
| P3 — Moyen | 2 heures | 24 heures |
| P4 — Faible | 8 heures | 72 heures |

---

## Résumé

| Outil | Protocole/Standard | Usage |
|-------|-------------------|-------|
| Zabbix | SNMP, agent, IPMI | Supervision multi-protocole |
| Prometheus | Pull HTTP /metrics | Métriques cloud-native |
| Grafana | — | Visualisation et alertes |
| rsyslog | Syslog RFC 5424 | Centralisation des logs |
| nfdump | NetFlow v5/v9, IPFIX | Analyse de flux |
| tcpdump/Wireshark | Raw packets | Debugging réseau |
