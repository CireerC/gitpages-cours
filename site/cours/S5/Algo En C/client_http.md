---
layout: course
title: "client http"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

### Client HTTP Simple en C

Dans cette partie, vous allez implÃ©menter un client capable d'envoyer des requÃªtes HTTP `GET` et `PUT` Ã  un serveur. Le client devra :
1. Accepter une URL en paramÃ¨tre.
2. Par dÃ©faut, envoyer une requÃªte `GET`.
3. Si l'utilisateur souhaite faire une requÃªte `PUT`, il pourra spÃ©cifier le fichier Ã  envoyer Ã  l'aide de l'option `--putfile`.

---

### Ã‰tapes de rÃ©alisation du Client HTTP

Voici les diffÃ©rentes Ã©tapes Ã  suivre pour construire ce client.

#### 1. CrÃ©er une Socket CÃ´tÃ© Client

Tout d'abord, pour Ã©tablir une communication avec le serveur, il faut crÃ©er une socket. Le client utilise la fonction `connect()` pour Ã©tablir une connexion avec le serveur.

Voici un squelette de code pour l'ouverture d'une socket cÃ´tÃ© client :

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <netdb.h>

#define PORT 8080

int create_client_socket(const char *hostname) {
    int sock;
    struct sockaddr_in server_addr;
    struct hostent *server;

    // CrÃ©ation du socket
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Erreur lors de la crÃ©ation du socket");
        exit(EXIT_FAILURE);
    }

    // RÃ©cupÃ©ration de l'adresse du serveur
    if ((server = gethostbyname(hostname)) == NULL) {
        fprintf(stderr, "Erreur, l'hÃ´te n'a pas Ã©tÃ© trouvÃ©\n");
        exit(EXIT_FAILURE);
    }

    // PrÃ©paration de l'adresse du serveur
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    bcopy((char *)server->h_addr, (char *)&server_addr.sin_addr.s_addr, server->h_length);

    // Connexion au serveur
    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Erreur lors de la connexion au serveur");
        exit(EXIT_FAILURE);
    }

    return sock;
}
```

1. **Exercice :** ComplÃ©tez le code ci-dessus. Ã€ quoi sert la fonction `gethostbyname()` ?

---

#### 2. RequÃªte HTTP GET

Pour une requÃªte `GET`, il suffit d'envoyer une ligne de commande HTTP au serveur et d'attendre une rÃ©ponse.

```c
void send_get_request(int socket, const char *path) {
    char buffer[1024];

    // Construction de la requÃªte GET
    sprintf(buffer, "GET %s HTTP/1.1\r\nHost: localhost\r\n\r\n", path);

    // Envoi de la requÃªte au serveur
    send(socket, buffer, strlen(buffer), 0);

    // Lecture de la rÃ©ponse
    int valread = read(socket, buffer, sizeof(buffer));
    buffer[valread] = '\0';
    printf("RÃ©ponse du serveur :\n%s\n", buffer);
}
```

3. **Exercice :** Quelles autres en-tÃªtes HTTP pourriez-vous ajouter dans la requÃªte ? Testez le client en appelant une URL sur votre serveur.

---

#### 3. RequÃªte HTTP PUT

Pour la requÃªte `PUT`, vous devez envoyer le contenu d'un fichier au serveur, en plus de la requÃªte HTTP elle-mÃªme.

```c
void send_put_request(int socket, const char *path, const char *filename) {
    char buffer[1024];
    FILE *file = fopen(filename, "r");

    if (file == NULL) {
        perror("Erreur lors de l'ouverture du fichier");
        return;
    }

    // Construction de la requÃªte PUT
    sprintf(buffer, "PUT %s HTTP/1.1\r\nHost: localhost\r\n\r\n", path);
    send(socket, buffer, strlen(buffer), 0);

    // Envoi du contenu du fichier
    while (fgets(buffer, sizeof(buffer), file)) {
        send(socket, buffer, strlen(buffer), 0);
    }
    fclose(file);

    // Lecture de la rÃ©ponse du serveur
    int valread = read(socket, buffer, sizeof(buffer));
    buffer[valread] = '\0';
    printf("RÃ©ponse du serveur :\n%s\n", buffer);
}
```

4. **Exercice :** Testez le client avec une requÃªte `PUT` en envoyant un fichier au serveur. Quelle mÃ©thode est utilisÃ©e pour lire le fichier et l'envoyer ? Pourquoi utilise-t-on `fgets()` ?

---

#### 4. Gestion des ParamÃ¨tres du Client

Nous allons maintenant mettre en place un gestionnaire de paramÃ¨tres pour dÃ©finir si le client envoie une requÃªte `GET` ou `PUT`, et gÃ©rer l'option `--putfile` pour spÃ©cifier un fichier.

```c
int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <URL> [--putfile <file>]\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    char *url = argv[1];
    char *putfile = NULL;
    int is_put = 0;

    // Analyse des options
    for (int i = 2; i < argc; i++) {
        if (strcmp(argv[i], "--putfile") == 0 && i + 1 < argc) {
            putfile = argv[++i];
            is_put = 1;
        }
    }

    // Extraire l'hÃ´te et le chemin de l'URL
    char *hostname = strtok(url, "/");
    char *path = strtok(NULL, "");

    if (path == NULL) path = "/";

    // CrÃ©ation de la socket client
    int sock = create_client_socket(hostname);

    // Envoi de la requÃªte appropriÃ©e
    if (is_put && putfile) {
        send_put_request(sock, path, putfile);
    } else {
        send_get_request(sock, path);
    }

    close(sock);
    return 0;
}
```

5. **Exercice :** Que fait la fonction `strtok()` ? Pourquoi est-elle utile ici ? Testez votre client avec plusieurs URLs et diffÃ©rentes options.

---

### Explications des Ã‰tapes

1. **Ouverture de la Socket Client :** Le client crÃ©e une socket avec la fonction `socket()`, et se connecte Ã  l'adresse du serveur via `connect()`.
   
2. **Analyse de l'URL :** Nous analysons l'URL pour extraire le nom de l'hÃ´te et le chemin (ex. `localhost/fichier.txt`). Cela permet d'envoyer la requÃªte HTTP correcte au serveur.

3. **RequÃªte GET :** Le client envoie une requÃªte GET Ã  l'URL fournie et reÃ§oit la rÃ©ponse du serveur. La rÃ©ponse est ensuite affichÃ©e dans la console.

4. **RequÃªte PUT :** Si l'utilisateur a spÃ©cifiÃ© `--putfile`, le client envoie une requÃªte `PUT` en lisant le contenu du fichier et en l'envoyant au serveur. Le client attend ensuite une rÃ©ponse et l'affiche.

---

### Conclusion

Vous avez maintenant un client HTTP simple qui peut envoyer des requÃªtes `GET` et `PUT` Ã  un serveur. Ce client peut Ãªtre Ã©tendu avec d'autres fonctionnalitÃ©s comme la gestion des rÃ©ponses HTTP plus dÃ©taillÃ©es ou la prise en charge d'autres mÃ©thodes HTTP comme `POST` ou `DELETE`.

### Bonus (si le temps le permet) :
- Ajoutez la gestion des erreurs HTTP cÃ´tÃ© client (par exemple, gestion des codes de rÃ©ponse 404, 500, etc.).
- ImplÃ©mentez une option pour modifier le port du serveur.
