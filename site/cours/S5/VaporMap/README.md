---
layout: course
title: "README"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

## Partie 1 
#### Fonctionnement et Architecture
- SÃ©paration Frontend/Backend
- Point d'accÃ¨s unique via Nginx (port 8000)
- Isolation des services (Gunicorn sur `127.0.0.1`)
#### Performance
- Serveur performant pour l'API (Gunicorn)
- Cache pour les fichiers statiques (Nginx)
- Monitoring des logs (accÃ¨s et erreurs)
#### SÃ©curitÃ©
- Isolation de lâ€™API via Gunicorn (interface locale)
- Point d'accÃ¨s centralisÃ© et sÃ©curisÃ© via Nginx
- Utilisation des variables dâ€™environnement pour les donnÃ©es sensibles
- Gestion des logs et audit

---
## Partie 2 


![Schema](images/image1.png)



---
## Partie 3 

### Mettre Ã  jour le systÃ¨me
```bash
sudo apt update 
```

### Installer les utilitaires de base
```bash
sudo apt install curl git vim nano jq
```

### CrÃ©er un utilisateur `app-vapormap`
Pour crÃ©er un utilisateur de type systÃ¨me avec les spÃ©cifications demandÃ©es, utilisons la commande suivante :
```bash
sudo useradd -r -d /home/app-vapormap -s /bin/sh -c 'Vapormap App system-user' app-vapormap
```

- `-r` : CrÃ©e un compte de type systÃ¨me.
- `-d /home/app-vapormap` : DÃ©finit le rÃ©pertoire personnel de lâ€™utilisateur.
- `-s /bin/sh` : SpÃ©cifie le shell de lâ€™utilisateur.
- `-c 'Vapormap App system-user'` : Ajoute une description au compte.

### VÃ©rifions si le compte est de type systÃ¨me: 

```bash
id -u app-vapormap
```

- Si l'UID est infÃ©rieur Ã  1000, il est probable que l'utilisateur soit de type systÃ¨me.

Si il ne l'est pas (notre cas): 

```bash 
sudo usermod -u 999 app-vapormap
```
Cette commande est a faire dans le root. 

---
## Partie 4 
### Installation de la base de donnÃ©es

1. **Installer les packages de MariaDB** :
     ```bash
     sudo apt install -y software-properties-common mariadb-server
     ```

2. **Activer MariaDB au redÃ©marrage du serveur** :
     ```bash
     sudo systemctl enable mariadb
     ```

3. **CrÃ©er la base de donnÃ©es et lâ€™utilisateur pour Vapormap** :
     ```bash
     sudo mysql -e "CREATE DATABASE db_vapormap;"
     sudo mysql -e "GRANT ALL PRIVILEGES ON db_vapormap.* TO 'user_vapormap'@'localhost' IDENTIFIED BY 'vapormap';"
     sudo mysql -e "GRANT ALL PRIVILEGES ON db_vapormap.* TO 'user_vapormap'@'%' IDENTIFIED BY 'vapormap';"
     sudo mysql -e "FLUSH PRIVILEGES;"
     ```

4. **Tester la connexion Ã  MariaDB** :
   - Utilisons la commande suivante pour vÃ©rifier que lâ€™utilisateur `user_vapormap` peut se connecter Ã  la base `db_vapormap` :
     ```bash
     mysql -h localhost -u user_vapormap -pvapormap -D db_vapormap
     ```
   - Pour lister les bases de donnÃ©es et confirmer que `db_vapormap` est crÃ©Ã©e :
     ```sql
     SHOW DATABASES;
     ```
![Schema2](images/image2.png)
### Installation des prÃ©requis Python

1. **Installer Python et les outils associÃ©s** :
     ```bash
     sudo apt install -y python3 python3-pip python3-venv
     ```

2. **Installer le client MariaDB pour Python** :
   ```bash
     sudo apt install -y mariadb-client libmariadb-dev pkg-config
     ```

### Installation de l'application

1. **Se connecter en tant quâ€™utilisateur `app-vapormap`** :
   ```bash
   su - app-vapormap
   ```

2. **Cloner le dÃ©pÃ´t Vapormap** :
     ```bash
     git clone https://gitlab.com/vapormap/vapormap-src.git ~/vapormap-prod
     ```

3. **CrÃ©er et activer un environnement virtuel Python** :
   ```bash
   cd ~/vapormap-prod
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Installer les dÃ©pendances Python** :
   - Installons `wheel` pour gÃ©rer les packages, puis installons les dÃ©pendances listÃ©es dans `requirements/production.txt` :
     ```bash
     pip install wheel
     pip install -r requirements/production.txt
     ```

### Initialisation de la base de donnÃ©es

1. **Configurer les variables d'environnement** :
   - Ajout ces variables pour que Flask accÃ¨de Ã  la base de donnÃ©es :
     ```bash
     export VAPOR_DBNAME=db_vapormap
     export VAPOR_DBUSER=user_vapormap
     export VAPOR_DBPASS=vapormap
     export VAPOR_DBHOST=localhost
     export FLASK_APP=app
     export SETTINGS_FILE=production
     ```

2. **Initialiser la base de donnÃ©es avec Flask** :
   - ExÃ©cutons la commande pour crÃ©er les tables nÃ©cessaires :
     ```bash
     flask db upgrade
     ```

3. **VÃ©rifier la crÃ©ation des tables** :
   - Connectons-nous Ã  la base de donnÃ©es avec MariaDB et exÃ©cutons `SHOW TABLES;` pour confirmer que les tables sont bien crÃ©Ã©es.

### Test du bon fonctionnement de l'API

1. **Lancer le serveur Gunicorn pour tester l'API** :
   - Assurons-nous d'Ãªtre dans l'environnement Python et d'avoir configurÃ© les variables dâ€™environnement :
     ```bash
     export PYTHONDONTWRITEBYTECODE=1
     export PYTHONUNBUFFERED=1
     export PYTHONPATH=$HOME/vapormap-prod/api
     export FLASK_APP=app
     export SETTINGS_FILE=production
     cd ~/vapormap-prod/api
     gunicorn --bind 0.0.0.0:5001 wsgi:app
     ```

2. **Tester l'API avec `curl` ou un navigateur** :
     ```bash
     curl http://localhost:5001/api/points/
     ```
   - Nous pouvons Ã©galement ouvrir `http://localhost:5001/api/points/` dans un navigateur pour vÃ©rifier l'accÃ¨s.

3. **ArrÃªter le serveur Gunicorn et sortir de l'environnement** :
   - Pour arrÃªter Gunicorn: `Ctrl + C`.
   - DÃ©sactivons lâ€™environnement virtuel et quittons la session `app-vapormap` :
     ```bash
     deactivate
     exit
     ```

Ces Ã©tapes configurent et lancent l'API en local.

---
## Partie 5 

Configurer lâ€™API Vapormap pour quâ€™elle sâ€™exÃ©cute en tant que service SystemD. Lancer automatiquement lâ€™API au dÃ©marrage du serveur et de sâ€™assurer de son fonctionnement continu.

#### Ã‰tapes:

1. **PrÃ©parer le fichier de template pour SystemD**
   - Le fichier de template `app/api-systemd.conf.template` contient les configurations nÃ©cessaires pour lancer lâ€™API en tant que service. Ce fichier utilise des variables dâ€™environnement qui doivent Ãªtre dÃ©finies pour Ãªtre substituÃ©es par `envsubst`.
`api-systemd.conf.template` :
```ini
Description=Gunicorn for VaporMap
After=network.target

[Service]
User=${VAPORMAP_USER}
Group=${VAPORMAP_GROUP}
WorkingDirectory=${VAPORMAP_DIR}
Environment="PATH=${VAPORMAP_PATH}"
Environment="PYTHONPATH=${VAPORMAP_PATH}"
Environment=PYTHONDONTWRITEBYTECODE=1
Environment=PYTHONUNBUFFERED=1
Environment=SETTINGS_FILE="production"
Environment=VAPOR_DBUSER=${VAPOR_DBUSER}
Environment=VAPOR_DBPASS=${VAPOR_DBPASS}
Environment=VAPOR_DBHOST=${VAPOR_DBHOST}
Environment=VAPOR_DBNAME=${VAPOR_DBNAME}
ExecStart=${VAPORMAP_PATH}/gunicorn wsgi:app --bind 0.0.0.0:${VAPORMAP_API_PORT}

[Install]
WantedBy=multi-user.target
```

2. **DÃ©finir les variables dâ€™environnement**
     ```bash
     export VAPORMAP_USER="app-vapormap"
     export VAPORMAP_GROUP="app-vapormap"
     export VAPORMAP_DIR="/home/app-vapormap/vapormap-prod/api"
     export VAPORMAP_PATH="/home/app-vapormap/vapormap-prod/venv/bin"
     export VAPORMAP_API_PORT="5001"
     export VAPOR_DBUSER="user_vapormap"
     export VAPOR_DBPASS="vapormap"
     export VAPOR_DBHOST="localhost"
     export VAPOR_DBNAME="db_vapormap"
     ```

3. **GÃ©nÃ©rer le fichier de configuration final avec `envsubst`**
     ```bash
     envsubst < app/api-systemd.conf.template | sudo tee /etc/systemd/system/vapormap-api.service
     ```

4. **Ajuster les permissions du fichier de service**
     ```bash
     sudo chown root:root /etc/systemd/system/vapormap-api.service
     sudo chmod 755 /etc/systemd/system/vapormap-api.service
     ```

5. **DÃ©marrer et vÃ©rifier le service**
   - Rechargons la configuration de SystemD pour prendre en compte le nouveau service, puis dÃ©marrons le service et vÃ©rifions son Ã©tat :
     ```bash
     sudo systemctl daemon-reload
     sudo systemctl start vapormap-api
     sudo systemctl status vapormap-api
     ```

6. **Tester lâ€™accÃ¨s Ã  lâ€™API**
     ```bash
     curl http://localhost:5001/api/points/
     ```
7. **Activer le service au dÃ©marrage du serveur**
     ```bash
     sudo systemctl enable vapormap-api
     ```

En suivant ces Ã©tapes, nous avons configurÃ© lâ€™API Vapormap pour quâ€™elle sâ€™exÃ©cute en tant que service SystemD, assurant ainsi quâ€™elle dÃ©marre automatiquement et fonctionne en continu.

---
## Partie 6 

### DÃ©ploiement du frontend avec Nginx

1. **Installer Nginx**
     ```bash
     sudo apt install nginx-light
     ```

2. **Activer Nginx au dÃ©marrage**
     ```bash
     sudo systemctl enable nginx
     ```

3. **Configurer lâ€™accÃ¨s Ã  lâ€™API depuis le frontend**
     ```bash
     su - app-vapormap
     export VAPORMAP_URL_SERVERNAME="0.0.0.0"
     export VAPORMAP_URL_PORT="8000"
     export VAPORMAP_FRONTEND_ROOT="/home/app-vapormap/vapormap-prod/frontend/html"
     envsubst < frontend/config.json.template > frontend/html/config.json
     ```

4. **GÃ©nÃ©rer le fichier de configuration de Nginx pour le frontend**
   - Le dÃ©pÃ´t contient Ã©galement un fichier de template pour Nginx, `frontend/nginx.conf.template`, qui doit Ãªtre modifiÃ© et placÃ© dans le rÃ©pertoire de configuration de Nginx pour le dÃ©ploiement.
   
   - Utilisons `envsubst` pour remplacer les variables dans le template et gÃ©nÃ©rer le fichier de configuration Nginx dans `/etc/nginx/sites-available/vapormap` :
     ```bash
     envsubst < frontend/nginx.conf.template | sudo tee /etc/nginx/sites-available/vapormap
     ```

5. **Activer la configuration de Nginx pour Vapormap**
   - CrÃ©ons un lien symbolique dans `/etc/nginx/sites-enabled` pour activer la configuration :
     ```bash
     sudo ln -s /etc/nginx/sites-available/vapormap /etc/nginx/sites-enabled/
     ```

6. **VÃ©rifier la configuration de Nginx**
   - Testons la configuration de Nginx pour vÃ©rifier qu'il nâ€™y a pas dâ€™erreurs :
     ```bash
     sudo nginx -t
     ```
   - Si la configuration est correcte, redÃ©marront Nginx pour appliquer les changements :
     ```bash
     sudo systemctl restart nginx
     ```

7. **Configurer les permissions pour le frontend**
     ```bash
     sudo chown -R app-vapormap:www-data /home/app-vapormap/vapormap-prod/frontend
     sudo chmod -R 750 /home/app-vapormap/vapormap-prod/frontend
     ```

8. **Tester l'accÃ¨s au frontend**
   - AccÃ©dons Ã  l'application en ouvrant un navigateur et en nous connectant Ã  `http://0.0.0.0:8000`. 


---
#### RÃ©solution d'erreur 404: 
 Pour rÃ©soudre l'erreur 404 rencontrÃ©e sur la page lors du dÃ©ploiement de Vapormap avec Nginx:

1. **Modification de la directive `try_files`** :
   - Dans le fichier `vapormap`, on a ajoutÃ© `$uri $uri` dans la directive `try_files` pour rÃ©soudre le problÃ¨me de l'erreur 404. Cela permet Ã  Nginx de chercher le fichier demandÃ© ou le rÃ©pertoire correspondant avant de renvoyer une erreur 404.

2. **Commande de correction** :
     ```nginx
     location / {
         try_files $uri $uri/ =404;
     }
     ```


--- 
## Partie 7 

Cette Ã©tape vise Ã  vÃ©rifier que l'application Vapormap fonctionne correctement en production. 

#### Ã‰tapes de validation :

2. **Validation du fonctionnement de l'API**
     ```bash
     curl http://localhost:5001/api/points/
     ```
   - Cela devrait renvoyer un tableau JSON contenant les points.

3. **Validation de la persistance des donnÃ©es**
   - On s'assure que les donnÃ©es crÃ©Ã©es ou modifiÃ©es via l'API ou le frontend sont bien stockÃ©es dans la base de donnÃ©es :
     - On se connecte Ã  MariaDB :
       ```bash
       mysql -u user_vapormap -pvapormap -D db_vapormap
       ```
     - VÃ©rifions que les points sont bien enregistrÃ©s dans la table :
       ```sql
       SELECT * FROM point;
       ```

4. **Validation aprÃ¨s redÃ©marrage**
   - RedÃ©marrons le serveur pour nous assurer que tous les services (Gunicorn, Nginx, MariaDB) redÃ©marrent correctement et que les donnÃ©es persistent.
   
5. **VÃ©rification des logs**
   - Consultons les logs des services pour dÃ©tecter dâ€™Ã©ventuelles erreurs :
     - Logs Gunicorn :
       ```bash
       sudo journalctl -u vapormap-api -f
       ```
     - Logs Nginx :
       ```bash
       sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
       ```

---

#### ProblÃ¨me rencontrÃ© : Points non affichÃ©s
Pendant la validation, nous avons constatÃ© que les points ne sâ€™affichaient pas dans lâ€™application. Nous avons pensÃ© rÃ©soudre le problÃ¨me en faisant:

1. **Mauvaise communication entre le frontend et l'API** :
   - Nous avons chercher si Gunicorn Ã©tait bien sur le port `5001` et si c'est que qui Ã©tait le problÃ¨me. Or ce n'Ã©tait pas le cas.

2. **Fichier `config.json` vide** :
   - Nous avons remarquÃ© que fichier `config.json` Ã©tait vide et qu'il contenait seulement :
     ```json
     { "apiUrl": "http://:" }
     ```

4. **Solution** :
   - Nous avons corrigÃ© les variables d'environnement et utilisÃ© `envsubst` pour rÃ©gÃ©nÃ©rer correctement le fichier `config.json` :
     ```bash
     export VAPORMAP_BACKEND_HOST="localhost"
     export VAPORMAP_BACKEND_PORT="5001"
     envsubst < config.json.template > /home/app-vapormap/vapormap-prod/frontend/html/config.json
     ```
   - AprÃ¨s cette correction, le frontend a pu communiquer avec l'API, et les points ont Ã©tÃ© affichÃ©s correctement.

--- 
## Partie 8 

### Configurer Gunicorn :
#### Ã‰tapes pour configurer les logs :

1. **Modifier le fichier de service SystemD**
   ```ini
     [Service]
     User=app-vapormap
     Group=app-vapormap
     WorkingDirectory=/home/app-vapormap/vapormap-prod/api
     Environment="PATH=/home/app-vapormap/vapormap-prod/venv/bin"
     Environment="PYTHONPATH=/home/app-vapormap/vapormap-prod/venv/bin"
     Environment=PYTHONDONTWRITEBYTECODE=1
     Environment=PYTHONUNBUFFERED=1
     Environment=SETTINGS_FILE="production"
     Environment=VAPOR_DBUSER=user_vapormap
     Environment=VAPOR_DBPASS=vapormap
     Environment=VAPOR_DBHOST=localhost
     Environment=VAPOR_DBNAME=db_vapormap
     ExecStart=/home/app-vapormap/vapormap-prod/venv/bin/gunicorn wsgi:app --bind 0.0.0.0:5001 \
       --access-logfile /var/log/vapormap/gunicorn-access.log \
       --error-logfile /var/log/vapormap/gunicorn-error.log

     [Install]
     WantedBy=multi-user.target ```

2. **CrÃ©er les rÃ©pertoires pour les logs**
     ```bash
     sudo mkdir -p /var/log/vapormap
     sudo chown app-vapormap:app-vapormap /var/log/vapormap
     sudo chmod 755 /var/log/vapormap
     ```

3. **Recharger et redÃ©marrer le service**
     ```bash
     sudo systemctl daemon-reload
     sudo systemctl restart vapormap-api
     sudo systemctl enable vapormap-api
     ```

4. **VÃ©rifier que les logs fonctionnent**
     - Logs dâ€™accÃ¨s :
       ```bash
       tail -f /var/log/vapormap/gunicorn-access.log
       ```
     - Logs dâ€™erreurs :
       ```bash
       tail -f /var/log/vapormap/gunicorn-error.log
       ```

5. **Tester lâ€™application**
     ```bash
     curl http://localhost:5001/api/points/
     ```
   - VÃ©rifions que les requÃªtes sont enregistrÃ©es dans `gunicorn-access.log` et que les Ã©ventuelles erreurs apparaissent dans `gunicorn-error.log`.

---

## Partie 9 

Pour intÃ©grer Ã  la fois le frontend et l'API dans un point d'accÃ¨s unique via Nginx :
### Fichier corrigÃ© :

```
server {
    listen 8000;
    server_name 0.0.0.0;

    root /home/app-vapormap/vapormap-prod/frontend/html;

    index index.html index.htm;

    # Exclure les logs inutiles pour favicon
    location = /favicon.ico { access_log off; log_not_found off; }

    # Serveur pour les fichiers statiques du frontend
    location / {
        # Chercher les fichiers ou renvoyer index.html pour permettre le routing cÃ´tÃ© client (SPA)
        try_files $uri $uri/ /index.html;
    }

    # Proxy pour les requÃªtes API vers Gunicorn
    location /api/ {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_redirect off;
    }

    # Proxy pour les requÃªtes GeoJSON
    location /geojson {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:5001/geojson;
        proxy_redirect off;
    }
}
```
```

### Ã‰tapes aprÃ¨s modification :

1. **VÃ©rifier la configuration Nginx** :
     ```bash
     sudo nginx -t
     ```

2. **RedÃ©marrer Nginx** :
     ```bash
     sudo systemctl restart nginx
     ```

3. **Tester le frontend et l'API** :
   - Ouvrons votre navigateur et accÃ©dons Ã  `http://localhost:8000` pour vÃ©rifier que :
     - Le frontend sâ€™affiche correctement.
     - Les points et donnÃ©es de lâ€™API sâ€™affichent Ã©galement.


Avec cette configuration, Nginx agit comme un point d'accÃ¨s unique pour le frontend et l'API, simplifiant l'accÃ¨s et centralisant les requÃªtes.



---  
### Bloquer le port 5001 et couper la redirection de port

Modifions le fichier de service SystemD utilisÃ© pour Gunicorn (`/etc/systemd/system/vapormap-api.service`) pour que Gunicorn Ã©coute uniquement sur `127.0.0.1` (interface locale). Cela empÃªche lâ€™accÃ¨s direct Ã  l'API via le port **5001**.

Avant nous avions:  
- `--bind 0.0.0.0:5001`
Donc: 
- `--bind 127.0.0.1:5001` limite Gunicorn Ã  l'Ã©coute uniquement sur l'interface locale (`127.0.0.1`), empÃªchant les utilisateurs externes dâ€™accÃ©der directement Ã  lâ€™API via le port **5001**.

#### Appliquer la modification :
```bash
sudo systemctl daemon-reload
sudo systemctl restart vapormap-api
```

Par consÃ©quent: 
1. Les utilisateurs peuvent accÃ©der Ã  lâ€™API uniquement via Nginx sur le port **8000**.
2. Lâ€™accÃ¨s direct au port **5001** est bloquÃ©, rendant cette voie obsolÃ¨te qui est ensuite coupÃ© sur le VM.
3. Nginx agit comme un point dâ€™accÃ¨s unique pour le frontend et lâ€™API, centralisant toutes les communications.

![Schema](images/image3.png)

## Ouverture

Il serait intÃ©ressant de restreindre davantage l'accÃ¨s Ã  l'application Vapormap. 
Par exemple, mettre en place un systÃ¨me dâ€™authentification basÃ© sur les adresses IP autorisÃ©es pourrait garantir que seules des personnes ou des rÃ©seaux spÃ©cifiques aient la possibilitÃ© d'accÃ©der Ã  l'application.
