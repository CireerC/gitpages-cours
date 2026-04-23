---
layout: course
title: "http server"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

# Support de Travaux Pratiques: CrÃ©ation d'un Serveur HTTP Simple en C

## Objectif

L'objectif de ce TP est de familiariser les Ã©tudiants avec l'utilisation des **sockets** en langage C. Ils apprendront Ã  implÃ©menter un serveur HTTP trÃ¨s simple capable de rÃ©pondre Ã  des requÃªtes GET et PUT. Nous allons explorer la gestion des connexions TCP, la lecture et lâ€™Ã©criture de fichiers Ã  partir du serveur. Il n'y a aucune gestion de la sÃ©curitÃ©. L'accent est mis sur la comprÃ©hension des concepts de base.

## PrÃ©-requis

- MaÃ®triser les bases du langage C (gestion des chaÃ®nes de caractÃ¨res, boucles, fonctions).
- Avoir une connaissance Ã©lÃ©mentaire du protocole HTTP (principalement les mÃ©thodes GET et PUT).
- Comprendre le fonctionnement gÃ©nÃ©ral des sockets pour la communication rÃ©seau.

## Rappel des concepts ClÃ©s

### 1. Qu'est-ce qu'une Socket ?

Une **socket** est un point de communication utilisÃ© pour envoyer et recevoir des donnÃ©es d'une application (processus) Ã  un autre Ã  travers un rÃ©seau. Elle permet de relier un client et un serveur. En C, les sockets sont crÃ©Ã©es et manipulÃ©es grÃ¢ce Ã  la bibliothÃ¨que `sys/socket.h` de la librairies `glibc`. La documentation officielle est disponible ici : https://www.gnu.org/software/libc/manual/html_node/Sockets.html .

### 2. Ouverture d'une Socket Client

Une connexion client sert Ã  se connecter Ã  un serveur existant. Cela nÃ©cessite gÃ©nÃ©ralement trois Ã©tapes :
- CrÃ©er une socket avec `socket()` (reserve l'espace mÃ©moire, initialise les champs et l'enregistre auprÃ¨s du systÃ¨me d'exploitation).
- RÃ©soudre lâ€™adresse du serveur et ouvrir la connexion TCP (3-WAY HANDSHAKE) avec `connect()`.
- Envoyer et recevoir des donnÃ©es via `send()` et `recv()`.
- Fermer la connexion avec `close()`.

### 3. Ouverture d'une Socket Serveur

Un serveur doit attendre des connexions et y rÃ©pondre :
- CrÃ©er une socket avec `socket()`.
- Lier cette socket Ã  une adresse (IP, port) avec `bind()`.
- Mettre en Ã©coute les connexions entrantes avec `listen()`.
- Accepter les connexions avec `accept()`.
- Traiter les requÃªtes des clients en lisant et envoyant des donnÃ©es.
- Fermer la connexion avec `close()`.

Un serveur peut traiter plusieurs sockets simultanÃ©ment. Dans un premier temps, nous ne traiterons qu'une seule requÃªte Ã  la fois.

### 4. RequÃªtes HTTP GET et PUT

- **GET** : Le client demande une ressource (un fichier) au serveur.
- **PUT** : Le client envoie des donnÃ©es au serveur, qui les Ã©crit dans un fichier.

## Plan du TP

### Ã‰tape 1: Mise en place d'une socket serveur

Vous pouvez mettre tout votre code dans un mÃªme fichier serveur_http.c. Placez le rÃ©pertoire `etu/VotreNom/6_sockets/serveur_http.c` de votre fork du dÃ©pÃ´t https://git.inge.re/cours/3a/3a_s5_algoc.

#### 1.0 Ajout des includes

Ajoutez les includes nÃ©cessaires pour votre programme.
```c
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <fcntl.h> 
#include <unistd.h> 
#include <stdlib.h>
```

#### 1.1 CrÃ©ation de la socket

```c
int server_fd = socket(AF_INET, SOCK_STREAM, 0);
if (server_fd == -1) {
    perror("Socket creation failed");
    exit(EXIT_FAILURE);
}
```

Ici, `AF_INET` spÃ©cifie que nous utilisons IPv4, et `SOCK_STREAM` indique que nous utilisons un flux TCP.

#### 1.2 Lier la socket Ã  une adresse et un port

```c
struct sockaddr_in address;
address.sin_family = AF_INET;
address.sin_addr.s_addr = INADDR_ANY;  // Lier Ã  toutes les interfaces. C'est l'Ã©quivalent de l'adresse 0.0.0.0.
address.sin_port = htons(PORT);  // Conversion en format rÃ©seau

if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
    perror("Bind failed");
    exit(EXIT_FAILURE);
}
```

#### 1.3 Mise en Ã©coute des connexions

```c
if (listen(server_fd, 10) < 0) {
    perror("Listen failed");
    exit(EXIT_FAILURE);
}
```

Le paramÃ¨tre 10 passÃ© Ã  la fonction `listen` indique que le serveur est maintenant prÃªt Ã  accepter jusqu'Ã  10 connexions simultanÃ©es.

#### 1.4 Accepter une connexion

```c
int addrlen = sizeof(address);
int new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen);
if (new_socket < 0) {
    perror("Accept failed");
    exit(EXIT_FAILURE);
}
```

### Ã‰tape 2: Lecture et traitement des requÃªtes HTTP

#### 2.1 Lecture de la requÃªte

Les requÃªtes HTTP arrivent sous forme de texte. Nous devons les lire et les analyser.

```c
char buffer[1024] = {0};
read(new_socket, buffer, 1024);
printf("Request received: \n%s\n", buffer);
```

DÃ©tail de l'extrait de code :

##### 1. DÃ©claration du buffer
```c
char buffer[1024] = {0};
```
- **`char buffer[1024]`** : Cette ligne dÃ©clare un tableau de caractÃ¨res (une chaÃ®ne de caractÃ¨res) de taille **1024** octets.
  - Le tableau sera utilisÃ© pour stocker les donnÃ©es lues depuis le socket. Dans ce cas, il peut contenir jusqu'Ã  1024 caractÃ¨res, ce qui est courant pour lire des donnÃ©es reÃ§ues en paquets dans des communications rÃ©seau.
  
- **`= {0}`** : Cette partie initialise tous les Ã©lÃ©ments du tableau Ã  **0** (caractÃ¨re nul ou `\0` en C).
  - Cela assure que le **buffer** est vide au dÃ©part, et Ã©vite de potentielles erreurs dues Ã  des donnÃ©es non initialisÃ©es dans le tableau.

##### 2. Lecture des donnÃ©es depuis un socket
```c
read(new_socket, buffer, 1024);
```
- **`read(new_socket, buffer, 1024)`** : Cette fonction lit des donnÃ©es depuis le socket **`new_socket`** et les stocke dans le **buffer**.
  - **`new_socket`** : Il s'agit d'un descripteur de socket, gÃ©nÃ©ralement obtenu aprÃ¨s l'acceptation d'une connexion avec un client. Il reprÃ©sente la connexion rÃ©seau active entre le serveur et le client.
  - **`buffer`** : C'est lÃ  oÃ¹ les donnÃ©es lues depuis le socket seront stockÃ©es.
  - **`1024`** : La taille maximale de donnÃ©es Ã  lire dans cette opÃ©ration est de 1024 octets, ce qui correspond Ã  la taille du **buffer**.

La fonction **`read()`** lit les donnÃ©es envoyÃ©es par l'autre partie de la connexion (par exemple, un client web ou un programme distant). Elle renvoie le nombre d'octets rÃ©ellement lus ou **-1** en cas d'erreur.

##### 3. Affichage des donnÃ©es reÃ§ues
```c
printf("Request received: \n%s\n", buffer);
```
- **`printf()`** : Cette fonction affiche du texte sur la sortie standard (souvent la console).
  - **`"Request received: \n%s\n"`** : La chaÃ®ne de format indique qu'on veut afficher du texte, suivi d'une nouvelle ligne (**`\n`**), puis les donnÃ©es contenues dans le **buffer**.
  - **`%s`** : Ce spÃ©cificateur de format est utilisÃ© pour afficher une chaÃ®ne de caractÃ¨res en **C**. Il affiche le contenu du **buffer** jusqu'Ã  rencontrer un caractÃ¨re nul **`\0`** (la fin de la chaÃ®ne).
  
- En rÃ©sumÃ©, cette ligne affiche le message **"Request received: "** suivi des donnÃ©es lues dans le **buffer**, puis une nouvelle ligne. Si le client a envoyÃ© une requÃªte ou un message via le socket, ce message sera imprimÃ©.


#### 2.2 Analyser la mÃ©thode HTTP

Nous allons traiter uniquement les mÃ©thodes GET et PUT.

```c
if (strncmp(buffer, "GET", 3) == 0) {
    // Traiter la requÃªte GET
} else if (strncmp(buffer, "PUT", 3) == 0) {
    // Traiter la requÃªte PUT
}
```

### Ã‰tape 3: ImplÃ©mentation de la mÃ©thode GET

Pour une requÃªte GET, nous devons lire un fichier et renvoyer son contenu au client.

#### 3.1 Lire le fichier demandÃ©

Nous allons extraire le nom du fichier depuis la requÃªte.

```c
char file_name[256];
sscanf(buffer, "GET /%s HTTP/1.1", file_name);

FILE *file = fopen(file_name, "r");
if (file == NULL) {
    char *response = "HTTP/1.1 404 Not Found\n\n";
    send(new_socket, response, strlen(response), 0);
} else {
    char response[1024];
    char file_buffer[1024];
    size_t bytes_read;
    
    // En-tÃªte de la rÃ©ponse
    snprintf(response, sizeof(response), "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n");
    send(new_socket, response, strlen(response), 0);
    
    // Lire et envoyer le contenu du fichier
    while ((bytes_read = fread(file_buffer, 1, sizeof(file_buffer), file)) > 0) {
        send(new_socket, file_buffer, bytes_read, 0);
    }
    fclose(file);
}
```

DÃ©tail du code :

##### 3.1.1. DÃ©claration du tableau `file_name`
```c
char file_name[256];
```
- **`char file_name[256];`** : Cette ligne dÃ©clare un tableau de caractÃ¨res (une chaÃ®ne de caractÃ¨res) de taille **256**. Il sera utilisÃ© pour stocker le nom du fichier extrait de la requÃªte HTTP. 
  - Cela signifie que le fichier demandÃ© par le client ne peut pas avoir un nom de plus de **255** caractÃ¨res, car il faut rÃ©server un caractÃ¨re pour le caractÃ¨re de fin de chaÃ®ne (`\0`).

##### 3.1.2. Utilisation de `sscanf`
```c
sscanf(buffer, "GET /%s HTTP/1.1", file_name);
```
- **`sscanf`** : La fonction **`sscanf()`** lit les donnÃ©es contenues dans une chaÃ®ne de caractÃ¨res (`buffer` dans ce cas) et les analyse selon un **format spÃ©cifiÃ©**.
  - Le premier argument est **`buffer`**, la chaÃ®ne de caractÃ¨res contenant la requÃªte HTTP complÃ¨te envoyÃ©e par le client (par exemple, une requÃªte GET).
  - Le deuxiÃ¨me argument est la chaÃ®ne de **format** **`"GET /%s HTTP/1.1"`**. Il spÃ©cifie ce que **`sscanf`** doit rechercher dans **`buffer`** et comment elle doit extraire les informations. Voici ce que cette chaÃ®ne de format signifie :
    - **`"GET "`** : La fonction attend la prÃ©sence du mot **"GET "** au dÃ©but de la chaÃ®ne. C'est typique d'une requÃªte HTTP GET.
    - **`"/%s "`** : Cela signifie qu'il doit y avoir un slash (`/`) suivi d'une **chaÃ®ne de caractÃ¨res** (indiquÃ©e par `%s`). Cette chaÃ®ne est le **nom du fichier** demandÃ©, et sera stockÃ©e dans **`file_name`**.
    - **`"HTTP/1.1"`** : Enfin, **`sscanf`** s'attend Ã  voir **"HTTP/1.1"**, indiquant la version du protocole HTTP.




### Ã‰tape 4: ImplÃ©mentation de la mÃ©thode PUT

Pour une requÃªte PUT, nous devons Ã©crire les donnÃ©es reÃ§ues dans un fichier.

#### 4.1 Ã‰crire dans le fichier

```c
char file_name[256];
sscanf(buffer, "PUT /%s HTTP/1.1", file_name);

FILE *file = fopen(file_name, "w");
if (file == NULL) {
    char *response = "HTTP/1.1 500 Internal Server Error\n\n";
    send(new_socket, response, strlen(response), 0);
} else {
    char *data_start = strstr(buffer, "\r\n\r\n") + 4;  // Contenu aprÃ¨s les en-tÃªtes
    fwrite(data_start, sizeof(char), strlen(data_start), file);
    fclose(file);

    char *response = "HTTP/1.1 201 Created\n\n";
    send(new_socket, response, strlen(response), 0);
}
```

Bien entendu, on se limite ici au contenu d'un fichier qui tiendrait dans le buffer dans lequel on a placÃ© la requÃªte.

### Ã‰tape 5: ClÃ´ture de la connexion

Une fois la requÃªte traitÃ©e, il faut fermer la socket :

```c
close(new_socket);
```

### Exemple de communication client-serveur

1. **RequÃªte GET**

   ```
   GET /index.txt HTTP/1.1
   ```

   RÃ©ponse (si le fichier existe) :

   ```
   HTTP/1.1 200 OK
   Content-Type: text/plain
   
   Contenu du fichier index.txt
   ```

2. **RequÃªte PUT**

   ```
   PUT /data.txt HTTP/1.1
   Content-Length: 11
   
   Hello World
   ```

   RÃ©ponse :

   ```
   HTTP/1.1 201 Created
   ```


## A rendre

Lorsque votre serveur est fonctionnel, vous devez communiquer l'adresse IP et le port Ã  l'enseignant. Celui ci fera une requÃªte :
```c
curl http://votreip:votreport/index.txt
```

Le fichier doit contenir votre nom, prÃ©nom, adresse email et la note que vous souhaitez obtenir.

Le code doit Ãªtre sur votre GIT.

## BONUS COOKIES

### Ajout d'un champs d'entÃªte
Ajouter le champs d'entÃªte `Email` Ã  la rÃ©ponse du serveur. La valeur du champs doit Ãªtre votre email.

### Gestion des cookies

Ajouter la gestion des cookies au serveur. Si l'utilisateur n'a pas spÃ©cifiÃ© de cookie, le serveur doit en crÃ©er un et l'envoyer Ã  l'utilisateur. Si l'utilisateur a spÃ©cifiÃ© un cookie, le serveur doit le lire et l'afficher. Il doit le retourner Ã  l'utilisateur dans le corps du message sur la page `/whatismycookie.html` est demandÃ©e.

Se rÃ©fÃ©rer au document suivant : [cookies](./cookies.md)

### GÃ©rer plus d'une connexion

Pour l'instant votre code se termine Ã  la fin d'une connexion. Il faut que votre serveur puisse gÃ©rer plusieurs connexions Ã  la suite.

Lorsque vous aurez eu des cours sur les systÃ¨mes d'exploitation et l'utilisation des threads, vous pourrez utiliser un thread par connexion et traiter les requÃªtes en parallÃ¨le. Ce n'est pas d'actualitÃ©.


