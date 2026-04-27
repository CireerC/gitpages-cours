---
layout: course
title: "Réseaux Nouvelle Génération"
semestre: "S8"
type_cours: "réseaux"
tags: ["SDN", "NFV", "5G", "MPLS", "BGP", "Segment Routing", "OpenFlow", "P4", "slicing", "cloud native"]
---

## Introduction

Les réseaux de nouvelle génération transforment l'infrastructure réseau traditionnelle via la programmabilité (SDN), la virtualisation (NFV), et de nouvelles architectures (5G, Segment Routing). Ce cours aborde les paradigmes qui remplacent progressivement les réseaux matériels rigides.

---

## SDN — Software Defined Networking

### Architecture SDN

```
┌─────────────────────────────────────────┐
│         Plan de gestion (Management)     │
│    (Orchestration, politiques, NMS)      │
└─────────────┬───────────────────────────┘
              │ Interface nordique (REST, NETCONF)
┌─────────────▼───────────────────────────┐
│         Plan de contrôle (Control)       │
│         Contrôleur SDN centralisé        │
│   (OpenDaylight, ONOS, Ryu, Floodlight) │
└─────────────┬───────────────────────────┘
              │ Interface sudique (OpenFlow, P4Runtime, NETCONF)
┌─────────────▼───────────────────────────┐
│           Plan de données (Data)         │
│    Équipements réseau programmables      │
│    (Switches OpenFlow, P4 targets)       │
└─────────────────────────────────────────┘
```

**Avantages SDN :**
- Vue globale du réseau → routage optimal
- Reconfiguration rapide par logiciel
- Séparation contrôle/données → matériel générique
- Automatisation et programmabilité

### OpenFlow — Protocole SDN

```
Table de flux OpenFlow :
┌────────────┬──────────────┬──────────────────┐
│ Match      │ Priority     │ Actions          │
├────────────┼──────────────┼──────────────────┤
│ IP_DST=    │ 100          │ OUTPUT:port2     │
│ 10.0.0.1   │              │                  │
├────────────┼──────────────┼──────────────────┤
│ ETH_TYPE=  │ 50           │ OUTPUT:FLOOD     │
│ ARP        │              │                  │
├────────────┼──────────────┼──────────────────┤
│ *          │ 0            │ OUTPUT:CONTROLLER│
│ (table miss)│             │ (demander décision)│
└────────────┴──────────────┴──────────────────┘

Champs match :  in_port, eth_src/dst, ip_src/dst,
                ip_proto, tcp/udp_src/dst, vlan_id...
Actions :       OUTPUT, DROP, MODIFY_FIELD, PUSH/POP_VLAN
```

### Contrôleur Ryu (Python)

```python
from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import MAIN_DISPATCHER, set_ev_cls
from ryu.ofproto import ofproto_v1_3
from ryu.lib.packet import packet, ethernet, ipv4

class L3Switch(app_manager.RyuApp):
    OFP_VERSIONS = [ofproto_v1_3.OFP_VERSION]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.mac_to_port = {}      # {dpid: {mac: port}}
        self.routing_table = {}    # {ip_dst: (mac_dst, port)}

    @set_ev_cls(ofp_event.EventOFPPacketIn, MAIN_DISPATCHER)
    def packet_in_handler(self, ev):
        msg    = ev.msg
        dp     = msg.datapath
        ofp    = dp.ofproto
        parser = dp.ofproto_parser

        pkt = packet.Packet(msg.data)
        eth = pkt.get_protocol(ethernet.ethernet)
        ip  = pkt.get_protocol(ipv4.ipv4)

        if ip:
            # Chercher la route
            if ip.dst in self.routing_table:
                mac_dst, out_port = self.routing_table[ip.dst]

                # Installer un flux permanent (évite les packet_in suivants)
                match   = parser.OFPMatch(eth_type=0x0800, ipv4_dst=ip.dst)
                actions = [parser.OFPActionOutput(out_port)]
                self.add_flow(dp, priority=10, match=match, actions=actions)

                # Forwarder le paquet actuel
                self.send_packet(dp, out_port, msg.data)
            else:
                self.logger.info(f"Destination inconnue : {ip.dst}")

    def add_flow(self, dp, priority, match, actions, idle_timeout=0):
        ofp    = dp.ofproto
        parser = dp.ofproto_parser
        inst   = [parser.OFPInstructionActions(ofp.OFPIT_APPLY_ACTIONS, actions)]
        mod    = parser.OFPFlowMod(
            datapath=dp, priority=priority, match=match,
            instructions=inst, idle_timeout=idle_timeout
        )
        dp.send_msg(mod)
```

---

## NFV — Network Functions Virtualization

### Architecture NFV (ETSI)

```
┌───────────────────────────────────────────────┐
│              OSS/BSS (Opérateur)               │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│              MANO (Management & Orchestration) │
│  ┌──────────────┐  ┌──────────────┐           │
│  │   NFVO       │  │    VNFM      │           │
│  │ (Orchestration)│ │ (VNF Manager)│           │
│  └──────────────┘  └──────────────┘           │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│              NFVI (Infrastructure)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  VNF 1   │ │  VNF 2   │ │  VNF 3       │  │
│  │ (vRouter)│ │ (vFW)    │ │ (vIDS)       │  │
│  └──────────┘ └──────────┘ └──────────────┘  │
│  ─────────────── Hyperviseur ──────────────── │
│  ─────── Serveurs COTS (x86 standard) ─────── │
└───────────────────────────────────────────────┘
```

### VNF vs PNF

| | PNF (Physical) | VNF (Virtual) |
|--|----------------|----------------|
| **Matériel** | Dédié | COTS (x86) |
| **Flexibilité** | Faible | Haute |
| **Performances** | Maximales | Bonnes (DPDK) |
| **Déploiement** | Semaines | Minutes |
| **Coût** | Élevé | Réduit |
| **Exemples** | Router physique | vRouter Cisco CSR, vFW |

### Service Function Chaining (SFC)

```
Trafic entrant
    │
    ▼
[vFirewall] → [vIDS] → [vLoadBalancer] → [vNAT]
    │                                       │
    └───────── SFC = chaîne de services ────┘
                                            │
                                        Serveurs
```

---

## MPLS — Multiprotocol Label Switching

### Concepts fondamentaux

```
IP normal :  [IP Header | Data]  → routage par lookup IP à chaque saut (lent)
MPLS     :  [Label | IP Header | Data]  → forwarding par label (rapide)

Label :
  ┌────────────────────────────────────────────────────┐
  │  Label (20 bits) │ TC (3) │ Stack (1) │ TTL (8)   │
  └────────────────────────────────────────────────────┘
  Label  : identifiant du LSP (Label Switched Path)
  TC     : Traffic Class (QoS)
  S      : Bottom of Stack (1 = dernier label)
  TTL    : Time to Live

Rôles des routeurs :
  LER (Label Edge Router) : ingress → push label / egress → pop label
  LSR (Label Switch Router) : transit → swap label
```

### LSP et ingénierie de trafic

```
Réseau MPLS :
    A ──[LER]──── R1 ──── R2 ──── R3 ──── [LER]──── B
                   │     LSP 1 (label 100) │
                   └──── R4 ──── R5 ────── ┘
                         LSP 2 (label 200)

Ingénierie de trafic MPLS-TE (RSVP-TE) :
  - Réserver de la bande passante sur un chemin explicite
  - Choix du chemin basé sur les contraintes (BW, latence, SLA)
  - Reprise rapide sur panne (Fast Reroute < 50ms)
```

### VPN MPLS (L3VPN)

```
Topologie :
  Site A ── CE-A ── PE1 ─────────────── PE2 ── CE-B ── Site B
                      \    P (core)    /
                       └──── P1 ──────┘

CE : Customer Edge (appartient au client)
PE : Provider Edge (VRF par client)
P  : Provider core (ne connaît pas les routes clients)

VRF (Virtual Routing and Forwarding) :
  Chaque client a sa propre table de routage → isolation totale
  Route Distinguisher (RD) : rend les préfixes uniques dans le BGP

Signalement :
  BGP entre PE pour distribuer les routes clients
  MPLS pour forwarder le trafic (double label)
```

---

## BGP — Border Gateway Protocol

### Concepts

```
AS (Autonomous System) : ensemble de réseaux sous une même politique
  eBGP : entre AS différents (multihop, TTL=1 par défaut)
  iBGP : au sein d'un même AS (full mesh ou Route Reflector)

Attributs BGP (sélection du meilleur chemin) :
  1. Weight (Cisco uniquement, local)
  2. Local Preference (dans l'AS)
  3. Originated locally (AS source)
  4. AS_PATH (plus court)
  5. Origin (IGP < EGP < ?)
  6. MED (Multi-Exit Discriminator)
  7. eBGP > iBGP
  8. IGP metric (plus courte vers le next-hop)
```

### Configuration BGP (Cisco IOS)

```
router bgp 65001
  bgp router-id 1.1.1.1
  neighbor 203.0.113.1 remote-as 65002   ! eBGP peer
  neighbor 10.0.0.2    remote-as 65001   ! iBGP peer
  neighbor 10.0.0.2    update-source Loopback0

  ! Annoncer nos réseaux
  network 192.0.2.0 mask 255.255.255.0

  ! Filtrage entrant avec route-map
  neighbor 203.0.113.1 route-map FILTER-IN in
  neighbor 203.0.113.1 route-map FILTER-OUT out

! Route Reflector (évite le full mesh iBGP)
router bgp 65001
  bgp cluster-id 1
  neighbor 10.0.0.2 route-reflector-client
  neighbor 10.0.0.3 route-reflector-client
```

---

## Segment Routing (SR)

### SR-MPLS

```
Concept : le routeur source encode le chemin complet dans l'en-tête
  → Pas besoin de RSVP-TE ou LDP pour signaler les LSP
  → Simplifie l'ingénierie de trafic

Segments :
  Node SID   : identifie un routeur (global)
  Adjacency SID : identifie un lien (local)
  Prefix SID : identifie un préfixe IP

Exemple :
  Chemin : R1 → R3 → R5 (éviter R2)
  Stack de labels : [SID_R3, SID_R5]
  R1 pop SID_R3 → arrive à R3
  R3 pop SID_R5 → arrive à R5

Avantages :
  ✓ Stateless sur les routeurs de transit
  ✓ Pas d'état de signalement à maintenir
  ✓ Flexible : chemin modifié à la source
```

### SRv6 — Segment Routing over IPv6

```
Utilise les adresses IPv6 comme segments
Extension header : Segment Routing Header (SRH)

Adresse SRv6 : Locator (48 bits) + Function (16 bits) + Args (32 bits)
Ex : 2001:db8:1::/48 = locator du routeur R1
     2001:db8:1::1 = R1 en transit (End function)
     2001:db8:1::2 = R1 fin de SID list (End.DT4 = décapsulation L3VPN)

Avantages vs SR-MPLS :
  ✓ Pas de plan de contrôle MPLS
  ✓ OAM natif IPv6
  ✓ Fonctionne sur Internet
  ✗ Overhead IPv6 plus important (40 octets header de base)
```

---

## Architecture 5G

### Architecture 5G SA (Standalone)

```
Accès Radio (RAN)
  ├── gNB (gNodeB) : NR (New Radio)
  └── NG-RAN : interface avec le cœur

Cœur 5G (5GC — Service Based Architecture)
  ├── AMF   : Access and Mobility Management Function
  ├── SMF   : Session Management Function
  ├── UPF   : User Plane Function (data path)
  ├── AUSF  : Authentication Server Function
  ├── UDM   : Unified Data Management
  ├── PCF   : Policy Control Function
  ├── NRF   : Network Repository Function (service discovery)
  └── NSSF  : Network Slice Selection Function

Interfaces SBI (Service Based Interface) :
  Protocole : HTTP/2 + JSON (APIs REST)
  Format    : OpenAPI 3.0
```

### Network Slicing

```
Slice 1 : eMBB (enhanced Mobile Broadband)
  Latence : ~10ms | Débit : 20 Gbps | Cas : vidéo 4K, AR/VR

Slice 2 : URLLC (Ultra-Reliable Low-Latency Communications)
  Latence : < 1ms | Fiabilité : 99.9999% | Cas : voiture autonome, chirurgie

Slice 3 : mMTC (massive Machine Type Communications)
  Densité : 1M appareils/km² | Débit faible | Cas : IoT, smart city

Chaque slice est une instance réseau dédiée (RAN + Core)
Isolation garantie par SDN/NFV
```

### Bandes de fréquences 5G

| Bande | Fréquence | Portée | Débit | Usage |
|-------|-----------|--------|-------|-------|
| FR1 sub-6GHz | 700 MHz – 2.6 GHz | Large | Moyen | Couverture nationale |
| FR1 mid-band | 3.4 – 4.2 GHz | Moyen | Haut | Zones denses |
| FR2 mmWave | 26 GHz+ | Faible (100m) | Très haut (>10 Gbps) | Stades, gares |

---

## Comparaison des technologies

| Technologie | Paradigme | Avantage principal | Challenge |
|-------------|-----------|-------------------|-----------|
| **SDN** | Contrôle centralisé | Programmabilité, vue globale | Point de défaillance unique |
| **NFV** | Virtualisation fonctions | Flexibilité, coût | Performance vs hardware dédié |
| **MPLS** | Label switching | QoS, VPN, TE | Complexité, signalement |
| **SR** | Source routing | Stateless transit, simplicité | Overhead header |
| **SRv6** | SR sur IPv6 | Internet-native | Header overhead |
| **5G SA** | Cloud-native, SBA | Slicing, ultra-faible latence | Densification, coût déploiement |
