---
layout: course
title: "Cybersécurité avancée"
semestre: "S7"
type_cours: "cybersec"
tags: ["PKI", "TLS", "firewall", "IDS", "SIEM", "Zero Trust", "hardening", "audit"]
---

## Introduction

Ce cours approfondit les mécanismes de sécurité en entreprise : infrastructure à clés publiques, protocoles cryptographiques modernes, défense en profondeur et outils de détection/réponse aux incidents.

---

## Infrastructure à Clés Publiques (PKI)

### Certificats X.509

Un certificat X.509 lie une **clé publique** à une **identité** (domaine, organisation) et est signé par une **Autorité de Certification (CA)**.

```
Champs principaux d'un certificat X.509 v3 :
  Version         : 3
  Serial Number   : 7A:B3:C1:...
  Issuer          : CN=Let's Encrypt R3, O=Let's Encrypt
  Validity        : 2024-01-01 → 2024-04-01
  Subject         : CN=example.com
  Public Key      : RSA 2048 bits
  Extensions      :
    SAN           : DNS:example.com, DNS:www.example.com
    Key Usage     : Digital Signature, Key Encipherment
    Basic Constraints: CA:FALSE
  Signature       : SHA256withRSA
```

### Chaîne de confiance

```
Root CA (auto-signé, stocké dans OS/navigateur)
    └── Intermediate CA (signé par Root CA)
            └── Certificat final (signé par Intermediate CA)
```

> Le Root CA ne signe jamais directement les certificats finaux — une compromission de l'intermédiaire ne nécessite que sa révocation (CRL/OCSP).

### Commandes utiles

```bash
# Inspecter un certificat
openssl x509 -in cert.pem -text -noout

# Générer une CSR (Certificate Signing Request)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout private.key -out request.csr \
  -subj "/CN=monsite.fr/O=MaSociete/C=FR"

# Vérifier la chaîne de confiance
openssl verify -CAfile chain.pem cert.pem

# Vérifier la date d'expiration
openssl x509 -noout -dates -in cert.pem

# Tester OCSP
openssl ocsp -issuer issuer.crt -cert cert.pem \
  -url http://ocsp.example.com -resp_text
```

---

## TLS 1.3 — Handshake

TLS 1.3 réduit la latence (1-RTT au lieu de 2-RTT en TLS 1.2) et supprime les algorithmes faibles.

```
Client                                          Serveur
  │                                               │
  │──── ClientHello (TLS versions, ciphersuites,  │
  │     key_share: ECDHE public key) ────────────►│
  │                                               │
  │◄─── ServerHello (chosen ciphersuite,          │
  │     key_share: server ECDHE public key,        │
  │     Certificate, CertificateVerify,            │
  │     Finished) ──────────────────────────────── │
  │                                               │
  │──── Finished ────────────────────────────────►│
  │                                               │
  │◄════════ Application data (chiffrée) ══════════│
```

**Suites supportées en TLS 1.3 :**
- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_GCM_SHA256`

```bash
# Tester la configuration TLS d'un serveur
nmap --script ssl-enum-ciphers -p 443 example.com
openssl s_client -connect example.com:443 -tls1_3

# Vérifier le grade avec testssl.sh
./testssl.sh example.com
```

---

## Firewalls

### Évolution des générations

| Génération | Inspection | Exemple |
|-----------|-----------|---------|
| Packet filter | En-têtes IP/TCP | iptables |
| Stateful | États des connexions | nftables, pfSense |
| Application (L7) | Contenu applicatif | Palo Alto, FortiGate |
| NGFW | L7 + IPS + DPI + URL filtering | Checkpoint, Cisco FTD |

### nftables (Linux moderne)

```bash
# Structure : tables → chaînes → règles
nft add table inet firewall
nft add chain inet firewall input { type filter hook input priority 0 \; policy drop \; }
nft add chain inet firewall forward { type filter hook forward priority 0 \; policy drop \; }
nft add chain inet firewall output { type filter hook output priority 0 \; policy accept \; }

# Autoriser SSH uniquement depuis un sous-réseau de gestion
nft add rule inet firewall input ip saddr 10.0.0.0/24 tcp dport 22 accept

# Autoriser le trafic établi et lié
nft add rule inet firewall input ct state established,related accept
nft add rule inet firewall input iif lo accept

# Limiter le taux pour les connexions entrantes (anti-scan)
nft add rule inet firewall input tcp flags syn limit rate 50/second accept

# Afficher les règles
nft list ruleset
```

---

## IDS/IPS — Détection d'intrusions

### Snort 3 — Signatures

```
# Règle Snort : détection d'un scan SYN
alert tcp any any -> $HOME_NET any \
  (msg:"SYN Scan détecté"; flags:S; threshold:type both, track by_src, count 20, seconds 1; sid:1000001; rev:1;)

# Règle : détection SQLi basique
alert http any any -> $HTTP_SERVERS $HTTP_PORTS \
  (msg:"SQLi UNION SELECT"; flow:to_server,established; \
   http.uri; content:"UNION"; nocase; content:"SELECT"; nocase; distance:0; \
   sid:1000002; rev:1;)
```

### Suricata — Eve JSON

```yaml
# suricata.yaml — sortie JSON
outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: /var/log/suricata/eve.json
      types:
        - alert:
            payload: yes
            packet: yes
        - http
        - dns
        - tls
```

```bash
# Analyser les alertes en temps réel
tail -f /var/log/suricata/eve.json | jq 'select(.event_type=="alert") | .alert.signature'
```

---

## SIEM — Security Information and Event Management

Architecture ELK/Elastic SIEM :

```
Sources (syslog, beats) ──► Logstash (parse) ──► Elasticsearch (stockage/indexation)
                                                           ▲
                                                     Kibana (visualisation)
                                                     Elastic SIEM (alertes)
```

### Filebeat — Agent de collecte

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
  - type: filestream
    id: auth-logs
    paths:
      - /var/log/auth.log
      - /var/log/syslog
    fields:
      source: linux-auth

output.elasticsearch:
  hosts: ["https://elasticsearch:9200"]
  username: "beats_user"
  password: "${BEATS_PASSWORD}"
  ssl.certificate_authorities: ["/etc/beats/ca.crt"]
```

### Requêtes KQL utiles

```
# Connexions SSH échouées
event.dataset: "auth" AND system.auth.ssh.event: "Failed"

# Connexions hors heures ouvrées
event.action: "logged-in" AND NOT (hour_of_day >= 8 AND hour_of_day <= 18)

# Exécution de commandes privilégiées
process.name: "sudo" AND event.type: "start"
```

---

## Modèle Zero Trust

> « Ne jamais faire confiance, toujours vérifier » — aucun utilisateur ni device n'est considéré comme sûr par défaut, même à l'intérieur du réseau.

### Principes NIST SP 800-207

1. **Vérification continue** de l'identité (MFA, certificats)
2. **Moindre privilège** : accès minimal nécessaire
3. **Micro-segmentation** : isolation des workloads
4. **Inspection du trafic** : chiffrement et surveillance end-to-end
5. **Visibilité** : journalisation de toutes les actions

```
Utilisateur ──► Identity Provider (Entra ID, Okta)
                        │ MFA + Conditional Access
                        ▼
              Policy Engine (vérifie device health, risque, heure)
                        │
                        ▼
              Policy Enforcement Point (proxy, ZTNA)
                        │
                        ▼
                   Ressource cible
```

---

## Hardening Linux

```bash
# Désactiver les services inutiles
systemctl disable bluetooth avahi-daemon cups

# SSH hardening (/etc/ssh/sshd_config)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers admin deploy
MaxAuthTries 3
ClientAliveInterval 300
X11Forwarding no
AllowTcpForwarding no

# Paramètres kernel sécurisés (/etc/sysctl.d/99-security.conf)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
kernel.randomize_va_space = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0

# Appliquer immédiatement
sysctl --system

# Audit : lister les fichiers SUID/SGID
find / -perm /4000 -o -perm /2000 2>/dev/null | sort

# Lynis — audit automatisé
lynis audit system --quick
```

---

## Audit de sécurité

### Méthodologie

1. **Périmètre** : définir le scope (IPs, services, applications)
2. **Reconnaissance passive** : DNS, WHOIS, Certificate Transparency
3. **Scan** : Nmap, Nessus, OpenVAS
4. **Analyse des résultats** : CVSS scoring
5. **Rapport** : synthèse executive + détail technique + recommandations

### Scoring CVSS v3.1

| Vecteur | Description | Valeurs |
|--------|-------------|---------|
| AV | Attack Vector | Network / Adjacent / Local / Physical |
| AC | Attack Complexity | Low / High |
| PR | Privileges Required | None / Low / High |
| UI | User Interaction | None / Required |
| C/I/A | Impact CIA | High / Low / None |

> Score CVSS = f(Base) × f(Temporal) × f(Environmental). Score ≥ 9.0 = Critique.

---

## Résumé

| Domaine | Outil principal | Points clés |
|---------|----------------|-------------|
| Chiffrement | OpenSSL | TLS 1.3, certificats X.509 |
| Filtrage réseau | nftables / NGFW | Stateful, L7, NGFW |
| Détection | Snort / Suricata | Signatures, anomalies |
| Centralisation | ELK SIEM | Corrélation, alertes |
| Identité | Zero Trust / IAM | MFA, RBAC, moindre privilège |
| Audit | Lynis / Nessus | CVSS, rapport |
