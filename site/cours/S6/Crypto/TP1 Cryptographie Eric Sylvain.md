---
layout: course
title: "TP1 Cryptographie Eric Sylvain"
semestre: "S6"
type_cours: "cours"
tags:
  - cours
---

# Partie 1 

Eric : Bob 
Sylvain : Alice 

## Etape 1

Bob choisit les paramÃ¨tres communs :

```bash
openssl dhparam -out dhp.pem 2048
```


```
Generating DH parameters, 2048 bit long safe prime
... (gÃ©nÃ©ration en cours) ...
```

Un fichier `dhp.pem` est gÃ©nÃ©rÃ© contenant les paramÃ¨tres communs (module et gÃ©nÃ©rateur).

### VÃ©rification des paramÃ¨tres :

```bash
cat dhp.pem
openssl pkeyparam -in dhp.pem -text -noout
```

Bob transmet le fichier `dhp.pem` Ã  Alice via Netcat.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Bob) :

```bash
cat dhp.pem | nc 172.20.10.2 1234
```

### Commande exÃ©cutÃ©e (cÃ´tÃ© Alice) :

```bash
nc -l -p 1234 > dhp.pem
```

Alice reÃ§oit `dhp.pem` et peut maintenant lâ€™utiliser.

---

## Etape 2

Chaque participant gÃ©nÃ¨re sa clÃ© privÃ©e Ã  partir des paramÃ¨tres DH.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Bob) :

```bash
openssl genpkey -paramfile dhp.pem -out dhpriv_bob.pem
```

Une clÃ© privÃ©e `dhpriv_bob.pem` est gÃ©nÃ©rÃ©e.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Alice) :

```bash
openssl genpkey -paramfile dhp.pem -out dhpriv_alice.pem
```

Une clÃ© privÃ©e `dhpriv_alice.pem` est gÃ©nÃ©rÃ©e.

### VÃ©rification de la clÃ© privÃ©e :

```bash
openssl pkey -in dhpriv_bob.pem -text -noout
openssl pkey -in dhpriv_alice.pem -text -noout
```

---

## Etape 3

Chaque participant extrait sa clÃ© publique pour l'envoyer Ã  l'autre.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Bob) :

```bash
openssl pkey -in dhpriv_bob.pem -pubout -out dhpub_bob.pem
```
Une clÃ© publique `dhpub_bob.pem` est gÃ©nÃ©rÃ©e.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Alice) :

```bash
openssl pkey -in dhpriv_alice.pem -pubout -out dhpub_alice.pem
```

Une clÃ© publique `dhpub_alice.pem` est gÃ©nÃ©rÃ©e.

### VÃ©rification de la clÃ© publique :

```bash
openssl pkey -pubin -in dhpub_bob.pem -text -noout
openssl pkey -pubin -in dhpub_alice.pem -text -noout
```

---

## Etape 4

Les clÃ©s publiques sont Ã©changÃ©es via Netcat.

### Envoi de la clÃ© publique de Bob Ã  Alice :

```bash
cat dhpub_bob.pem | nc 172.20.10.2 9748
```

### RÃ©ception cÃ´tÃ© Alice :

```bash
nc -l -p 9748 > dhpub_bob.pem
```

Alice reÃ§oit la clÃ© publique `dhpub_bob.pem`.

### Envoi de la clÃ© publique dâ€™Alice Ã  Bob :

```bash
cat dhpub_alice.pem | nc 172.20.10.5 9748
```

### RÃ©ception cÃ´tÃ© Bob :

```bash
nc -l -p 9748 > dhpub_alice.pem
```

Bob reÃ§oit la clÃ© publique `dhpub_alice.pem`.

---

## Etape 5

Chaque participant gÃ©nÃ¨re le secret partagÃ© en combinant sa clÃ© privÃ©e avec la clÃ© publique de lâ€™autre.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Bob) :

```bash
openssl pkeyutl -derive -inkey dhpriv_bob.pem -peerkey dhpub_alice.pem -out secret.bin
```

Le fichier `secret.bin` est gÃ©nÃ©rÃ©.

### Commande exÃ©cutÃ©e (cÃ´tÃ© Alice) :

```bash
openssl pkeyutl -derive -inkey dhpriv_alice.pem -peerkey dhpub_bob.pem -out secret.bin
```

Le fichier `secret.bin` est gÃ©nÃ©rÃ©.

---

## Etape 6

Alice et Bob convertissent le secret partagÃ© en une clÃ© AES de 256 bits via SHA-256.

### Commande exÃ©cutÃ©e :

```bash
openssl dgst -sha256 secret.bin
```

Code retour (Bob) :

```
SHA256(secret.bin)= 74f30bbbde250e4ae48748785cb5470b95e3d077917cd87fdce8f64fc443d81b
```

Commande exÃ©cutÃ©e (Alice) :

```bash
openssl dgst -sha256 secret.bin
```

Code retour (Alice) :

```
SHA256(secret.bin)= 74f30bbbde250e4ae48748785cb5470b95e3d077917cd87fdce8f64fc443d81b
```

 Les deux clÃ©s AES sont identiques, confirmant un Ã©change sÃ©curisÃ© rÃ©ussi !



# Partie 2

## Etape 1

Alice gÃ©nÃ¨re une clÃ© AES 256 bits :

```bash
openssl rand -hex 32 > cle_aes_alice
```
 Une clÃ© AES est gÃ©nÃ©rÃ©e dans `cle_aes_alice`.

Alice Ã©crit un message et le chiffre avec AES-256 :

```bash
echo "bonjour je voudrais installer kali linux , cisco nous ecoute et logan aussi" > secret.txt
openssl enc -aes-256-ecb -e -in secret.txt -out secret.txt.enc -K $(cat cle_aes_alice)
```

Le message chiffrÃ© est stockÃ© dans `secret.txt.enc`.

Alice chiffre la clÃ© AES avec la clÃ© publique RSA de Bob :

```bash
openssl pkeyutl -encrypt -in cle_aes_alice -pubin -inkey cle_publique_bob.pem -out cle_aes_alice_chiffre
```

La clÃ© AES chiffrÃ©e est stockÃ©e dans `cle_aes_alice_chiffre`.

Alice envoie les fichiers Ã  Bob :

```bash
cat cle_aes_alice_chiffre | nc 172.20.10.5 9748
cat secret.txt.enc | nc 172.20.10.5 9749
```

Bob reÃ§oit `cle_aes_alice_chiffre` et `secret.txt.enc`.

---

## Etape 2

Bob dÃ©chiffre la clÃ© AES avec sa clÃ© privÃ©e RSA :

```bash
openssl pkeyutl -decrypt -in cle_aes_alice_chiffre -inkey cle_rsa_bob.pem -out cle_aes_alice
```

Bob rÃ©cupÃ¨re la clÃ© AES dans `cle_aes_alice`.

---

## Etape 3

Bob utilise la clÃ© AES pour dÃ©chiffrer le message :

```bash
openssl enc -aes-256-ecb -d -in secret.txt.enc -out secret.txt -K $(cat cle_aes_alice)
```

Le message dÃ©chiffrÃ© est stockÃ© dans `secret.txt`.

Bob vÃ©rifie le message :

```bash
cat secret.txt
```


```
bonjour je voudrais installer kali linux , cisco nous ecoute et logan aussi
```

Le message a bien Ã©tÃ© transmis et dÃ©chiffrÃ© avec succÃ¨s ! 

# Partie 3 

## Etape 1

Alice gÃ©nÃ¨re une paire de clÃ©s RSA :

```bash
openssl genrsa -out cle_priv_alice.pem 2048
openssl rsa -in cle_priv_alice.pem -pubout -out cle_pub_alice.pem
```

Une clÃ© privÃ©e `cle_priv_alice.pem` et une clÃ© publique `cle_pub_alice.pem` sont gÃ©nÃ©rÃ©es.

Alice Ã©crit un message et le signe avec sa clÃ© privÃ©e :

```bash
echo "Bonjour Bob, voici un message signÃ© !" > message_Alice.txt
openssl dgst -sha256 -sign cle_priv_alice.pem -out signature_Alice message_Alice.txt
```

Le fichier `signature_Alice` contient la signature du message.

 Alice envoie les fichiers Ã  Bob :

```bash
cat message_Alice.txt | nc 172.20.10.5 9748
cat signature_Alice | nc 172.20.10.5 9749
cat cle_pub_alice.pem | nc 172.20.10.5 9750
```

Bob reÃ§oit `message_Alice.txt`, `signature_Alice` et `cle_pub_alice.pem`.

---

## Etape 2 

Bob Ã©coute et enregistre les fichiers envoyÃ©s par Alice.

```bash
nc -l -p 9748 > message_Alice.txt
nc -l -p 9749 > signature_Alice
nc -l -p 9750 > cle_pub_alice.pem
```

Bob rÃ©cupÃ¨re les fichiers nÃ©cessaires pour vÃ©rifier la signature.

---

## Etape 3

 Bob vÃ©rifie lâ€™authenticitÃ© du message avec la clÃ© publique dâ€™Alice :

```bash
openssl dgst -sha256 -verify cle_pub_alice.pem -signature signature_Alice message_Alice.txt
```

La signature est valide :

```
Verified OK
```

Le message nâ€™a pas Ã©tÃ© altÃ©rÃ© et a bien Ã©tÃ© signÃ© par Alice.

# Partie 4

On gÃ©nÃ¨re un certificat auto-signÃ© et une clÃ© privÃ©e RSA.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
```
 OpenSSL demande plusieurs informations (pays, ville, organisation, FQDN, email).
 

```bash
cat server.key  # Affiche la clÃ© privÃ©e
cat server.crt  # Affiche le certificat
openssl x509 -noout -text -in server.crt  # Affiche le contenu dÃ©taillÃ© du certificat
```

Le certificat contient les informations saisies et la clÃ© publique.

La clÃ© privÃ©e (`server.key`) **ne doit jamais Ãªtre partagÃ©e**.

On peut utiliser ce certificat (`server.crt`) pour sÃ©curiser une connexion HTTPS.

