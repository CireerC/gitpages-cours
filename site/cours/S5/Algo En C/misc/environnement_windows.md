---
layout: course
title: "environnement windows"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

# CrÃ©er son environnement de travail sur Windows

Ce guide explique comment configurer un environnement de travail complet pour les projets de cette annÃ©e sur Windows et WSL2. Nous y aborderons l'installation d'outils essentiels tels que GCC, GDB, Git, VSCode, VirtualBox et Tera Term, ainsi que la configuration de clÃ©s SSH pour accÃ©der aux serveurs bastion-ssh.inge.ovh et git.inge.re.  Ainsi, les difficultÃ©s techniques seront rÃ©duites, permettant une meilleure concentration sur l'aspect pÃ©dagogique des projets.

## 1. Installation de Visual Studio Code

Vous pouvez tÃ©lÃ©charger le fichier d'installation de Visual Studio Code Ã  l'adresse suivante : https://code.visualstudio.com/download. 
SÃ©lectionnez la version pour Windows. Une fois le fichier tÃ©lÃ©chargÃ©, lancez l'installateur .exe et suivez les instructions d'installation par dÃ©faut.
 
## 2. Installation de gcc et gdb

Dans cette section, nous allons vous expliquer comment installer les compilateurs gcc et gdb sur Windows, ainsi que via WSL2 (Windows Subsystem for Linux). Ces outils sont essentiels pour la compilation et le dÃ©bogage.

### 2.1. Installation de gcc et gdb sur Windows

- Vous pouvez trouver le fichier d'installation de MSYS2 sur la page officielle : https://www.msys2.org/. TÃ©lÃ©chargez le fichier d'installation et suivez les instructions Ã  l'Ã©cran.

- Ã€ la fin de l'installation, cochez la case **Run MSYS2** now puis sÃ©lectionnez **Finish**. Le terminal MSYS2 s'ouvrira automatiquement.

- Dans le terminal MSYS2, tapez la commande suivante pour installer les outils nÃ©cessaires au dÃ©veloppement :

```bash
pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain
```

- Ã€ cette Ã©tape, appuyez sur **EntrÃ©e** pour accepter l'installation de tous les paquets proposÃ©s.

![alt text](img/image.png)

- Ajoutez le chemin du dossier `bin` de MinGW-w64 (par dÃ©faut, `C:\msys64\ucrt64\bin`) Ã  la variable d'environnement `PATH` de Windows. Ouvrez l'Invite de commandes de Windows et exÃ©cutez la commande suivante :

```cmd
setx PATH "%PATH%; C:\msys64\ucrt64\bin"
```

- Fermez l'Invite de commandes et ouvrez-en une nouvelle. Vous pouvez vÃ©rifier que `gcc` et `gdb` ont Ã©tÃ© installÃ©s correctement en exÃ©cutant les commandes suivantes :

```cmd
gcc --version
gdb --version
```

### 2.2. Installation de gcc et gdb via WSL2

- Nous allons mettre Ã  jour la liste des paquets et installer les outils de dÃ©veloppement nÃ©cessaires avec les commandes ci-dessous.
  - `build-essential` installe gcc, g++, make, et d'autres outils de dÃ©veloppement essentiels.
  - `gdb` installe le dÃ©bogueur GNU.

```bash
sudo apt update 
sudo apt install build-essential gdb 
```

- VÃ©rifiez que gcc et gdb ont Ã©tÃ© correctement installÃ©s en exÃ©cutant les commandes suivantes :

```bash
gcc --version
gdb --version
```

## 3. Installation de git

Dans cette partie, nous allons apprendre Ã  installer Git sur Windows ou WSL2, et nous verrons comment vÃ©rifier son installation et le configurer pour une utilisation efficace.

### 3.1. Installation de git sur Windows

- Vous pouvez trouver le fichier d'installation de git sur cette page : https://git-scm.com/download/win.
Une fois le fichier tÃ©lÃ©chargÃ©, exÃ©cutez-le.

- Pour les composantes Ã  insqtaller, cochez l'option **Add a Git Bash Profile to Windows Terminal** en plus des options sÃ©lectionnÃ©es par dÃ©faut

![alt text](img/E82A.tmp.png)

- Pour l'Ã©diteur par dÃ©faut, sÃ©lectionnez Visual Studio Code.

- Pour l'ajustement de la variable d'environnement PATH, sÃ©lectionnez l'option recommandÃ©e **Git from the command line and 3rd-party software**

- Pour le fichier ssh.exe, choisissez l'OpenSSH fourni par Git si vous n'en avez pas dÃ©jÃ  un d'installÃ©.

- Pour le comportement de la commande `git pull`, sÃ©lectionnez **Fast-forward or merge**

- AprÃ¨s avoir terminÃ© l'installation de Git, vous pouvez vÃ©rifier que Git a Ã©tÃ© correctement installÃ© en utilisant les commandes suivantes dans un terminal :
```bash
git --version
```

- Configurez votre nom et votre email. Ces informations seront associÃ©es aux commits que vous ferez, permettant ainsi d'identifier l'auteur de chaque changement dans le projet. Vous pouvez les configurer avec les commandes suivantes :

```bash
git config --global user.name "Maeva"
git config --global user.email "maeva@example.com"
```

### 3.2 Installation de git via WSL2

- Vous pouvez installer Git sur WSL2 en utilisant les commandes suivantes dans un terminal :
```bash
sudo apt update 
sudo apt install git
```

- Une fois l'installation terminÃ©e, vous pouvez vÃ©rifier que Git est correctement installÃ© en exÃ©cutant la commande suivante :
```bash
git --version
```

- Configurez ensuite votre nom et votre email. Ces informations seront associÃ©es Ã  vos commits afin d'identifier l'auteur de chaque changement dans le projet. Utilisez les commandes suivantes pour effectuer cette configuration :

```bash
git config --global user.name "Maeva"
git config --global user.email "maeva@example.com"
```

## 4. CrÃ©ation et installation des clÃ©s SSH

Dans cette partie, nous allons apprendre Ã  crÃ©er des clÃ©s SSH et Ã  les installer sur les serveurs bastion-ssh.inge.ovh et git.inge.re.

### 4.1. CrÃ©ation des clÃ©s SSH

GÃ©nÃ©rez les clÃ©s SSH avec cette commande : 

```bash
ssh-keygen -t ed25519 -C "prenom.nom@esiroi.re"
```

### 4.2. Installation des clÃ©s SSH sur git.inge.re

- Affichez les clÃ©s publiques avec les commandes ci-dessous et copiez-les sur le presse-papier :

  - **Invite de commande**
    ```cmd
    type "%USERPROFILE%\.ssh\id_ed25519.pub"
    ```

  - **Bash**
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```

- Allez sur git.inge.re

- Cliquez sur l'avatar en haut Ã  gauche

- SÃ©lectionnez l'option **Preferences**

- AccÃ©dez Ã  **SSH Keys**

- Cliquez sur **Add new key**

- Dans le champ **Key**, collez votre clÃ© publique. Ajoutez un nom dans le champ **Title**

- Appuyez sur le bouton **Add key**

### 4.3. Installation des clÃ©s SSH sur bastion-ssh.inge.ovh

- Sur un terminal, utilisez la commande suivante pour copier votre clÃ© publique sur le serveur :

  - **Invite de commande**
    ```cmd
    scp %USERPROFILE%\.ssh\id_ed25519.pub username@bastion.inge.ovh:
    ```

  - **Bash**
    ```bash
    scp ~/.ssh/id_ed25519.pub username@bastion.inge.ovh:
    ```




- Ensuite, connectez-vous au serveur et exÃ©cutez la commande suivante

```bash
cp id_ed25519.pub /home/username/.ssh/authorized_keys
```

- Vous pouvez tester la connexion SSH en utilisant la clÃ© privÃ©e avec la commande suivante :

  - **Invite de commande**
    ```cmd
    ssh -i %USERPROFILE%\.ssh\id_ed25519 username@bastion-ssh.inge.ovh
    ```

  - **Bash**
    ```bash
    ssh -i ~/.ssh/id_ed25519 username@bastion-ssh.inge.ovh
    ```

## 5. Installation de VirtualBox

Pour installer VirtualBox, rendez-vous sur le lien suivant : https://www.virtualbox.org/wiki/Downloads. Assurez-vous de choisir la version adaptÃ©e pour Windows.

## 6. Installation de Tera Term

Les derniÃ¨res versions de Tera Term sont disponibles sur le lien suivant : https://github.com/TeraTermProject/teraterm/releases





