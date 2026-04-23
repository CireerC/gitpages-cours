---
layout: course
title: "genofront"
semestre: "S6"
type_cours: "cours"
tags:
  - cours
---



## 1. Mise en place de l'environnement

Mise Ã  jour du systÃ¨me

```bash
sudo apt update && sudo apt upgrade -y
````

Installation des paquets nÃ©cessaires

```bash
sudo apt install -y python3 python3-pip python3-venv git nginx ufw
```

---

## 2. CrÃ©ation du projet Flask

CrÃ©ation des dossiers et de l'environnement virtuel

```bash
sudo mkdir -p /opt/frontend
cd /opt/frontend
sudo python3 -m venv venv
source venv/bin/activate
```

Installation des dÃ©pendances

```bash
pip install flask gunicorn requests
```

Un problÃ¨me de permissions a Ã©tÃ© rencontrÃ© :  
RÃ©solu avec :

```bash
sudo chown -R genofront:genofront /opt/frontend
```

---

## 3. DÃ©veloppement de l'application

 Fichiers crÃ©Ã©s :

`dashboard.py`
```python
from flask import Flask, render_template, request
import requests

app = Flask(__name__)

BACKEND_API_URL = "http://172.17.100.139:5000"

@app.route('/')
def index():
    try:
        response = requests.get(f"{BACKEND_API_URL}/api/pieges")
        piege_data = response.json()
    except Exception as e:
        print("Erreur :", e)
        piege_data = []
    return render_template('dashboard.html', piege_data=piege_data)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

`wgi.py`

Fichier WSGI pour lancer l'app avec Gunicorn :

```python
from dashboard import app

if __name__ == "__main__":
    app.run()
```

 `templates/dashboard.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dashboard PiÃ¨ges</title>
</head>
<body>
  <h1>Ã‰tat des PiÃ¨ges</h1>
  <table border="1">
    <tr>
      <th>PiÃ¨ge</th>
      <th>Ã‰tat</th>
      <th>Batterie</th>
      <th>Heure</th>
    </tr>
    {% for row in piege_data %}
    <tr>
      <td>{{ row.PiegeID }}</td>
      <td>{{ "ArmÃ©" if row.Etat == 1 else "DÃ©sarmÃ©" }}</td>
      <td>{{ row.Batterie }} %</td>
      <td>{{ row.Timestamp }}</td>
    </tr>
    {% endfor %}
  </table>
</body>
</html>

```
Template HTML affichant les donnÃ©es en tableau.

---

## 4. CrÃ©ation du service systemd pour Gunicorn

Fichier : `/etc/systemd/system/frontend.service`

```ini
[Unit]
Description=Dashboard Flask avec Gunicorn
After=network.target

[Service]
User=genofront
WorkingDirectory=/opt/frontend
ExecStart=/opt/frontend/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

 Activation du service

```bash
sudo systemctl daemon-reload
sudo systemctl enable frontend
sudo systemctl start frontend
sudo systemctl status frontend
```

---
##  Supervision du service frontend (auto-redÃ©marrage)

Afin de garantir la haute disponibilitÃ© du dashboard, un script de surveillance a Ã©tÃ© mis en place pour vÃ©rifier toutes les 5 minutes que le service `frontend` est actif. En cas de crash, le script relance automatiquement le service via `systemctl`.

Script : `/opt/frontend/check.sh`

```bash
#!/bin/bash

SERVICE="frontend"

if systemctl is-active --quiet $SERVICE; then
    echo "$(date): $SERVICE is running"
else
    echo "$(date): $SERVICE is down, restarting..."
    systemctl restart $SERVICE
fi
````

En cas de besoin:

```bash
sudo chmod +x /opt/frontend/check.sh
```

---

### Ajout au cron (planificateur de tÃ¢ches)

Le script est exÃ©cutÃ© toutes les 5 minutes grÃ¢ce Ã  `crontab` :

```bash
sudo crontab -e
```
Ajouter cette ligne Ã  la fin du fichier :

```bash
*/5 * * * * /opt/frontend/check.sh >> /var/log/frontend-monitor.log 2>&1
```

Ce fichier loguera Ã©galement l'Ã©tat du service dans `/var/log/frontend-monitor.log`.

Voici la **section complÃ©mentaire dÃ©diÃ©e Ã  la configuration de The Things Network (TTN)**, Ã  ajouter Ã  ton write-up, pour documenter toute la chaÃ®ne de transmission des donnÃ©es depuis le capteur jusqu'Ã  la base de donnÃ©es via le backend.

---

## 7. â˜ï¸ Configuration de The Things Network (TTN)


### 7.1 CrÃ©ation de lâ€™application TTN

1. Connecte-toi sur [https://console.thethingsnetwork.org/](https://console.thethingsnetwork.org/)

2. CrÃ©e une nouvelle application :
    
    - **Application ID** : `iot-pieges`
        
    - **Serveur** : Europe (ou selon ton cas)
        
3. CrÃ©e un **end device** :
    
    - Marque : STMicroelectronics
        
    - ModÃ¨le : B-L072Z-LRWAN1
        
    - Activation : OTAA
        
    - Saisie manuelle de :
        
        - DevEUI
            
        - AppEUI
            
        - AppKey
            
    - Ces valeurs doivent correspondre Ã  celles codÃ©es dans le firmware (`main.c`)
        

### 7.2 Payloads envoyÃ©s depuis la carte

Le firmware envoie un **payload de 2 octets** :

|Octet|Description|
|---|---|
|0|ID du piÃ¨ge|
|1|Ã‰tat capteur (0/1)|

### 7.3 Decoder (Payload Formatter)

Dans **Application > Payload Formatters > Uplink**, choisis **"Custom"**, et colle ce code JavaScript :

```js
function decodeUplink(input) {
  return {
    data: {
      piege_id: input.bytes[0],
      capteur_magnetique: input.bytes[1] === 1 ? "dÃ©clenchÃ©" : "fermÃ©"
    }
  };
}
```

Cela permet de voir immÃ©diatement dans la console TTN des messages comme :

```json
{
  "piege_id": 42,
  "capteur_magnetique": "dÃ©clenchÃ©"
}
```

### 7.4 IntÃ©gration Webhook TTN â†’ Backend

Pour rediriger chaque uplink automatiquement vers votre backend :

1. Dans TTN :  
    Application > **Integrations** > **Webhooks** > Ajouter un webhook > **Custom webhook**
    
2. Remplir :
    
    - **Webhook ID** : `backend-pieges`
        
    - **Base URL** : `http://172.17.100.139:5000` (ou le nom DNS de ta VM backend)
        
    - **Uplink message path** : `/uplink`
        
3. TTN enverra chaque message LoRa vers `POST http://backend/api/uplink` avec ce corps JSON :
    

```json
{
  "uplink_message": {
    "frm_payload": "QhE=",   // base64
    "decoded_payload": {
      "piege_id": 66,
      "capteur_magnetique": "dÃ©clenchÃ©"
    },
    ...
  }
}
```

### 7.5 Route Flask associÃ©e

Ton backend doit avoir un endpoint Flask qui reÃ§oit et traite ce webhook :

```python
from flask import Flask, request, jsonify
import base64
import json
import mariadb

@app.route('/uplink', methods=['POST'])
def uplink_handler():
    data = request.get_json()
    try:
        payload = data["uplink_message"]["decoded_payload"]
        piege_id = payload["piege_id"]
        capteur = 1 if payload["capteur_magnetique"] == "dÃ©clenchÃ©" else 0

        # Connexion et insertion en DB ici
        # insert_into_db(piege_id, capteur)

        return jsonify({"status": "ok"}), 200
    except Exception as e:
        print("Erreur de traitement :", e)
        return jsonify({"status": "error"}), 400
```

----
---
---
---
---

### ðŸ—ºï¸ Table de position unique : `Piege_Position`

Chaque piÃ¨ge est associÃ© Ã  une position GPS unique, modifiable indÃ©pendamment de son historique. Cette table sert de rÃ©fÃ©rence pour le frontend Leaflet :

```sql
CREATE TABLE Piege_Position (
    PiegeID INT PRIMARY KEY,
    Latitude DOUBLE NOT NULL,
    Longitude DOUBLE NOT NULL
);
```

Un script SQL a Ã©tÃ© exÃ©cutÃ© pour insÃ©rer les piÃ¨ges `1` Ã  `99` avec des coordonnÃ©es lÃ©gÃ¨rement dÃ©calÃ©es autour du Parc national de La RÃ©union :

```sql
INSERT INTO Piege_Position (PiegeID, Latitude, Longitude)
SELECT id,
       -21.088333 + (id * 0.0001),
       55.447417 + (id * 0.0001)
FROM (
  SELECT a.N + b.N * 10 AS id
  FROM (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL ... UNION ALL SELECT 9) AS a,
       (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL ... UNION ALL SELECT 9) AS b
  WHERE (a.N + b.N * 10) BETWEEN 1 AND 99
) AS generated;
```

---

### ðŸ”— Liaison entre piÃ¨ges et positions

La table `Piege` est reliÃ©e Ã  `Piege_Position` par une clÃ© Ã©trangÃ¨re pour garantir lâ€™intÃ©gritÃ© des donnÃ©es gÃ©ographiques :

```sql
ALTER TABLE Piege
ADD CONSTRAINT fk_piege_position
FOREIGN KEY (PiegeID)
REFERENCES Piege_Position(PiegeID);
```



---

## ðŸ›°ï¸ Enrichissement de l'API `/api/piege/latest` et `/api/pieges` 

- Tu as modifiÃ© l'API Flask pour qu'elle retourne, pour chaque `PiegeID` :
    
    - son **dernier Ã©tat connu**
        
    - son **niveau de batterie**
        
    - sa **position gÃ©ographique** (via un `JOIN` avec `Piege_Position`)
        
- Cette route est dÃ©sormais utilisÃ©e par le dashboard pour afficher les donnÃ©es en temps rÃ©el.
```python
@app.route('/api/piege/latest', methods=['GET'])
def get_latest_piege():
    try:
        subquery = db.session.query(
            Piege.PiegeID,
            db.func.max(Piege.Timestamp).label("MaxTime")
        ).group_by(Piege.PiegeID).subquery()

        results = db.session.query(Piege, PiegePosition).\
            join(subquery, (Piege.PiegeID == subquery.c.PiegeID) & (Piege.Timestamp == subquery.c.MaxTime)).\
            join(PiegePosition, Piege.PiegeID == PiegePosition.PiegeID).all()

        response = [{
            "PiegeID": p.PiegeID,
            "Etat": p.Etat,
            "Batterie": p.Batterie,
            "Timestamp": p.Timestamp.isoformat(),
            "Latitude": pos.Latitude,
            "Longitude": pos.Longitude
        } for p, pos in results]

        return jsonify(response), 200
    except Exception as e:
        print("Erreur JOIN:", e)
        return jsonify({"error": str(e)}), 500
```

```python
class PiegePosition(db.Model):
    __tablename__ = 'Piege_Position'
    PiegeID = db.Column(db.Integer, primary_key=True)
    Latitude = db.Column(db.Float, nullable=False)
    Longitude = db.Column(db.Float, nullable=False)
```

---

## ðŸŒ IntÃ©gration de Leaflet.js dans le frontend

- Tu as intÃ©grÃ© **Leaflet** dans `dashboard.html` pour afficher la carte interactive.
- Les piÃ¨ges sont visualisÃ©s par des **marqueurs**, positionnÃ©s via `Latitude` / `Longitude`.

---- 
---
---
---


| **Mode de veille** | **Carte**       | **Conso veille (ÂµA)** | **Ã‰nergie totale / jour (mAh)** | **Autonomie estimÃ©e**    |
| ------------------ | --------------- | --------------------- | ------------------------------- | ------------------------ |
| STOP2              | NUCLEO-WL55JC   | 1.2 ÂµA                | 0.0344 mAh                      | ~34 883 jours (~95 ans)  |
| STANDBY            | NUCLEO-WL55JC   | 0.4 ÂµA                | 0.0142 mAh                      | ~84 507 jours (~231 ans) |
| STANDBY            | STM32L072CZY6TR | 0.6 ÂµA                | 0.0190 mAh                      | ~63 157 jours (~173 ans) |
| STOP2              | STM32L072CZY6TR | Non supportÃ©          | -----                           | ----                     |

