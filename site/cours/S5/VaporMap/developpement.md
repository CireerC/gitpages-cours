---
layout: course
title: "developpement"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

# DÃ©ploiement en mode dÃ©veloppement

---
## Description


En mode dÃ©veloppement :

- Pour le frontend, le module "http.server" de python est utilisÃ©.
- Pour l'API, le mode "dÃ©veloppement" du Framework Flask est utilisÃ©. Dans ce mode Flask intÃ¨gre directement une base de donnÃ©es et un serveur d'exÃ©cution du code python, et de publication web.


La base de donnÃ©es en mode dÃ©veloppement est une base de donnÃ©e Sqlite3, en mode fichier, stockÃ© en local, et ne nÃ©cessitant pas de serveur . Le fichier `db.sqlite3` contenant les donnÃ©es est crÃ©Ã© dans le dossier `app/vapormap/datas/`.

Le serveur d'exÃ©cution du code python (run) permet de vÃ©rifier rapidement le fonctionnement du programme et de dÃ©velopper sans installer un serveur http sur la machine de dÃ©veloppement: 

-  Par dÃ©faut, le serveur fonctionne sur le port 5000 Ã  lâ€™adresse IP 127.0.0.1.
-  Vous pouvez lui transmettre explicitement une adresse IP et un numÃ©ro de port.
-  Le serveur de dÃ©veloppement recharge automatiquement le code Python lors de chaque requÃªte si nÃ©cessaire. 

**Nâ€™UTILISEZ PAS CE SERVEUR DANS UN ENVIRONNEMENT DE PRODUCTION. Il nâ€™a pas fait lâ€™objet dâ€™audits de sÃ©curitÃ© ni de tests de performance. 
**

L'installation a Ã©tÃ© validÃ©e dans un environnement Ubuntu 24.04.

---
## Utilisation de localhost, et ouverture de ports

**A la fois le frontend et l'API doivent Ãªtre accessibles depuis un navigateur. Ce n'est pas le serveur du frontend qui accÃ¨de Ã  l'API, mais le navigateur.
**

L'API est prÃ©vue pour utiliser le port 5000, et le frontend le port 8000. Si ces ports ne sont pas disponibles, vous pouvez en choisir d'autres lors du dÃ©ploiement.

Si vous installez l'application directement sur votre machine locale, vous n'avez pas de configuration complÃ©mentaire Ã  faire. Les 2 serveurs utilisÃ©s pour l'API et le frontend utiliseront directement les ports de votre machine, et vous pourrez utiliser le nom de serveur "localhost"

Si vous travaillez avec une machine virtuelle installÃ©e sur votre machine locale, vous devez mettre en place des redirection pour ces 2 ports. Vous pouvez utiliser "localhost", qui fait rÃ©fÃ©rence Ã  votre machine locale, qui redirige les flux vers votre machine virtuelle. Par exemple avec des "Port Forwarding Rule" si vous utilisez virtualbox.

Si vous travaillez avec une machine distante, vous ne devez pas utiliser "localhost", mais l'adresse IP publique de votre VM, ou de votre instance Cloud. Il peut Ãªtre nÃ©cessaire d'autoriser l'accÃ¨s distant aux ports 8000 et 5000.

----
## PrÃ©paration du systÃ¨me

### Mise Ã  jour du systÃ¨me (optionnel)
``` bash
sudo apt update && sudo apt upgrade -y
# [sudo] password for vapormap: 
# AtteintÂ :1 http://re.archive.ubuntu.com/ubuntu jammy InRelease
# RÃ©ception deÂ :2 http://re.archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]
# ...
```

### Installation des prÃ©requis (optionnel)
```
sudo apt -y install git sudo vim jq
```

---
## Initialisation de l'application

### PrÃ©-requis Python

Installer  python3, pip3 et venv 
``` bash
sudo apt -y install python3 python3-pip python3-venv
```


VÃ©rifier
``` bash
python3 --version
# Python 3.12.3

pip3 --version
# pip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.12)

python3 -m venv -h
# ...
# Creates virtual Python environments in one or more target directories.
# ...
```


### RÃ©cupÃ©ration du projet
```
cd $HOME
git clone https://gitlab.com/vapormap/vapormap-src.git vapormap-dev
cd vapormap-dev
```

###  CrÃ©ation d'un environnement Python virtuel
``` bash
cd $HOME/vapormap-dev
mkdir venv
python3 -m venv --prompt vapormap-dev ./venv
```

---
## Lancement de l'API

### Initialisation de l'environnement Python
``` bash
cd $HOME/vapormap-dev
source venv/bin/activate
```

### Installation des "requirements" de l'application
```
cd $HOME/vapormap-dev/api
pip install -r requirements/development.txt
```

### CrÃ©ation de la DB sqlite
``` bash
cd $HOME/vapormap-dev/api/app
export SETTINGS_FILE="development"
export FLASK_APP=app
flask db upgrade
# [...] WARNING in app: Overriding base configuration with development.py
# [...] WARNING in app: CORS Allowed domains : *
# INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
# INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
# INFO  [alembic.runtime.migration] Running upgrade  -> dca1b25755c9, empty message
```

### Lancement de l'application
``` bash
export SETTINGS_FILE="development"
cd $HOME/vapormap-dev/api/app
flask run -h 0.0.0.0 -p 5000
# [...] WARNING in app: Overriding base configuration with development.py
# [...] WARNING in app: CORS Allowed domains : *
#  * Serving Flask app 'app'
#  * Debug mode: off
# WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
#  * Running on http://127.0.0.1:5000
#  * Running on http://xxx.xxx.xxx.xxx:5000

# Press CTRL+C to quit

```

### Test

***AccÃ¨s Ã  l'API en local avec curl***

- Dans une autre fenÃªtre de terminal
``` bash
curl http://localhost:5000/api/points/?format=json
```
- RÃ©ponse
``` json
[]
```

***AccÃ¨s Ã  l'API en distant, avec un navigateur***

Depuis un navigateur, saisir l'url : [http://localhost:5000/api/points/?format=json](http://localhost:5000/api/points/?format=json)

> Modifiez Ã©ventuellement l'url en fonction de votre configuration

La rÃ©ponse doit Ãªtre la mÃªme qu'avec curl en ligne de commande


---
## Lancement du frontend 

### Ouvrir un autre terminal, et initialiser l'environnement python
``` bash
cd $HOME/vapormap-dev
source venv/bin/activate
```

### Configurer l'accÃ¨s Ã  l'API
``` bash
cd $HOME/vapormap-dev/frontend/
export VAPORMAP_BACKEND_HOST=<PUBLIC_API_ENDPOINT_HOST>
export VAPORMAP_BACKEND_PORT=5000
envsubst '${VAPORMAP_BACKEND_HOST},${VAPORMAP_BACKEND_PORT}' < config.json.template > html/config.json
```
Attention, pour `VAPORMAP_BACKEND_HOST` vous devez indiquer une adresse accessible depuis le navigateur. `localhost` ne fonctionne que si vous travaillez sur votre machine locale, sinon il faut indiquer l'adresse IP publique de votre VM, ou de votre instance Cloud.


VÃ©rifier le contenu du fichier 
``` bash
cat html/config.json
```


### Lancer le frontend
``` bash
cd $HOME/vapormap-dev/frontend/
cd html
python -m http.server
```

### Test de l'accÃ¨s Ã  l'application

***AccÃ¨s Ã  l'API en local avec curl***

``` bash
curl http://localhost:8000
```

Le code d'une page html contenant les scripts de l'application s'affiche. Il est nÃ©cessaire d'utiliser un navigateur pouvant interprÃ©ter ce code pour pouvoir valider le bon fonctionnement de l'application : 

***AccÃ¨s Ã  l'API en distant, avec un navigateur***

Depuis un navigateur, saisir l'url : [http://localhost:8000](http://localhost:8000)

> Modifiez Ã©ventuellement l'url en fonction de votre configuration


L'application doit afficher une carte du monde, et permettre la saisie de points de relevÃ© :

- Pour saisir un point de relevÃ© :
    - Cliquer sur un point dans la carte, ce qui va renseigner les champs **Lat**itude et **Long**itude
    - Saisir les donnÃ©es complÃ©mentaires de description (**What ?**), et de **Date**
    - Cliquer sur **Add**.
    - Un marqueur de relevÃ© ![](./frontend/static/assets/images/marker-icon.png) doit apparaÃ®tre sur la carte.
- Si 2 points de relevÃ© sont saisis avec le mÃªme champ de description, un trajet est crÃ©Ã©. 
- Si aucun marqueur nâ€™apparaÃ®t, le lien entre le frontend et l'API ne fonctionne pas:
    - VÃ©rifier que l'API est bien fonctionnelle, depuis le serveur d'API
    - VÃ©rifier que l'url d'accÃ¨s de l'API est correcte dans le fichier `frontend/config.json`
    - VÃ©rifier que l'API est joignable depuis le poste client



Les requÃªtes vers les serveurs apparaissent dans les fenÃªtres de terminal
- Pour le frontend
``` bash
# 10.0.2.2 - - [date] "GET / HTTP/1.1" 200 -
# 10.0.2.2 - - [date] "GET /static/assets/leaflet.css HTTP/1.1" 200 -
# 10.0.2.2 - - [date] "GET /static/assets/bootstrap.css HTTP/1.1" 200 -
# 10.0.2.2 - - [date] "GET /static/assets/jquery.min.js HTTP/1.1" 200 -
#  ...
# 10.0.2.2 - - [date] "GET /config.json HTTP/1.1" 200 -
#  ...
# 10.0.2.2 - - [date] "GET /favicon.ico HTTP/1.1" 200 -
#  ...
```
- Pour l'API
``` bash
# 10.0.2.2 - - [date] "GET /favicon.ico HTTP/1.1" 404 -
# 10.0.2.2 - - [date] "GET /api/points/ HTTP/1.1" 200 -
# 10.0.2.2 - - [date] "GET /geojson HTTP/1.1" 200 -
#  ...
```


---
## ArrÃªt de l'application

***ArrÃªt du Frontend***

Pour arrÃªter le serveur frontend : dans le terminal utilisÃ© pour lancer le frontend, saisir ++control+c++

Puis sortir de l'environnement virtuel 
``` bash
deactivate
```


***ArrÃªt de l'API***

Pour arrÃªter le serveur frontend : dans le terminal utilisÃ© pour lancer l'API, saisir ++control+c++

Puis sortir de l'environnement virtuel 
``` bash
deactivate
```




