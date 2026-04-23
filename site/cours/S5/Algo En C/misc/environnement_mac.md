---
layout: course
title: "environnement mac"
semestre: "S5"
type_cours: "cours"
tags:
  - cours
---

# CrÃ©er son environnement de travail sur MacOS

En vue des projets, il faut avoir un environnement de travail complet sur sa machine. Ce guide explique donc comment mettre en place un environnement de travail complet sur MacOS.  
Nous y aborderons l'installation d'outils tels que **GCC, GDB, Git, VSCode (ou Codium), VirtualBox et picocom**. Nous configurerons Ã©galement les clÃ©s SSH pour accÃ©der aux serveurs **bastion-ssh.inge.ovh** et **git.inge.re**. Les difficultÃ©s techniques rÃ©duites, vous pourrez vous concentrer sur l'aspect pÃ©dagogique des projets.

Avant tout, il est fortement recommandÃ© d'avoir installÃ© XCode sur sa machine. Pour se faire, tÃ©lÃ©chargez XCode dans l'App Store.  
> **Attention: L'installation de XCode peut mettre du temps car celui-ci est assez volumineux (quelques Go).**

![alt text](img/XCode.png)

Il vous faut Ã©galement installer l'outil de ligne de commande de XCode:
```zsh
xcode-select --install
```


## 1. Installation d'un gestionnaire de paquets

Maintenant que XCode est installÃ© sur votre machine, nous allons installer un gestionnaire de paquets qui se nomme **Homebrew** afin de faciliter l'installation des outils sur votre machine.

Pour se faire, entrez la commande suivante dans votre terminal:
```zsh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Une fois que l'installation s'est terminÃ©e, il faut ajouter Homebrew Ã  votre **PATH** en exÃ©cutant ces deux commandes:
```zsh
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/codebind/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Vous pouvez maintenant vÃ©rifier si Homebrew est bien installÃ© avec la commande suivante:
```zsh
brew --version
```

## 2. Installation de VSCode/Codium
### 2.1 Codium
Si vous souhaitez travailler avec Codium, entrez la commande suivante dans votre terminal:
```zsh
brew install --cask vscodium
```
Lors de l'installation, Codium sera directement ajoutÃ© au **PATH**.
Une fois l'installation terminÃ©e, vous pourrez directement l'utiliser en executant la commande suivante si vous voulez l'ouvrir dans votre rÃ©pertoire courant:
```zsh
codium .
```

### 2.2 VSCode
Si vous souhaitez travailler avec VSCode, il existe deux maniÃ¨res de l'installer.  
 **1.** Vous pouvez le faire via le site, accessible [ici](https://code.visualstudio.com/) puis en cliquant sur le bouton **Download for macOS**
![alt text](img/VSCode.png)
Une fois le tÃ©lÃ©chargement fini, double cliquez sur le fichier tÃ©lÃ©chargÃ©. Puis, glissez l'icÃ´ne de VSCode dans le dossier **Applications** qui se trouve dans la barre de gauche du Finder. 


 **2**. L'autre possibilitÃ© est de l'installer via Homebrew avec la commande suivante:
 ```zsh
 brew install --cask visual-studio-code
 ```

Vous pouvez vÃ©rifier si VSCode est dans le **PATH** en exÃ©cutant la commande suivante:
```zsh
code .
```
Si vous obtenez une erreur, suivez les Ã©tapes suivantes:
- Ouvrez VSCode
- Dans la barre de recherche en haut de la fenÃªtre ou dans les paramÃ¨tres, entrez ceci:
```zsh
>PATH
```
Vous devriez voir apparaÃ®tre :
> Shell Command: Install 'code' command in **PATH**

Cliquez dessus. Vous devriez voir apparaÃ®tre un message vous indiquant qu'il a Ã©tÃ© ajoutÃ© au **PATH**

## 3. Installation de gcc et de gdb
### 3.1 Installation de gcc
Si vous avez installÃ© XCode sur votre machine, vous devriez dÃ©jÃ  avoir gcc.
Vous pouvez le vÃ©rifier en tapant la commande suivante dans votre terminal:
```zsh
gcc --version
```
Dans le cas contraire, installez le via Homebrew:
```zsh
brew install gcc
```

### 3.2 Installation de gdb
Malheureusement, gdb n'est pas supportÃ© par l'environnement MacOS. Mais rassurez-vous, il existe une alternative sur Mac. En effet, sur Mac, vous avez **lldb**.

Si vous avez installÃ© XCode, il devrait dÃ©jÃ  Ãªtre sur votre machine. VÃ©rifiez avec cette commande:
```zsh
lldb --version
```
Vous devriez obtenir quelque chose de similaire Ã  ceci:

![alt text](img/lldb.png)


## 4. Installation de git
Dans cette section, nous allons installer Git, vÃ©rifier son installation et le configurer.

Pour installer git, entrez la commande suivante dans votre terminal:
```zsh
brew install git
```

Il ne sert Ã  rien d'aller sur le site de git car il vous indiquera exactement cette commande pour l'installer sur votre mac.

Une fois l'installation terminÃ©e, vous pouvez vÃ©rifier que Git a Ã©tÃ© correctement installÃ© en utilisant la commande suivante:
```zsh
git --version
```

Maintenant que Git est installÃ©, il vous faut configurer votre nom et votre email. Ces deux informations seront associÃ©es aux commits que vous ferez et permettront ainsi d'identifier l'auteur de chaque changement dans le projet. Pour les configurer, vous pouvez utiliser les commandes suivantes:
```zsh
git config --global user.name "Lukas"
git config --global user.mail "lukas@example.com"
```

> **Attention Ã  bien remplacer les champs entre guillemets par vos informations !!**


## 5. CrÃ©ation et installation des clÃ©s SSH
Dans cette section, nous allons crÃ©er des clÃ©s SSH et les installer sur les serveurs **bastion-ssh.ing.ovh** et **git.inge.re**

## 5.1 CrÃ©ation et installation des clÃ©s SSH pour git.inge.re
### 5.1.1 CrÃ©ation des clÃ©s SSH pour git.inge.re
Vous pouvez gÃ©nÃ©rer les clÃ©s SSH pour **git.inge.re** avec cette commande en veillant Ã  mettre votre adresse mail:
```zsh
ssh-keygen -t rsa -b 4096 -N "" -f id_ssh -C "prenom.nom@esiroi.re"
```
A la suite de cela, vous devriez avoir deux fichiers crÃ©Ã©s dans le dossier **.ssh**:
 - **id_ssh**
 - **id_ssh.pub**

### 5.1.2 Installation de la clÃ© publique sur git.inge.re
Dans votre terminal:
 * si vous Ãªtre dans le dossier **.ssh**, affichez la clÃ© avec la commande suivante:
  ```zsh
  cat id_ssh.pub
  ```
  * si vous n'Ãªtes pas dans le dossier **.ssh**, affichez la clÃ© avec la commande suivante:
  ```zsh
  cat /Users/%userprofile%/.ssh/id_ssh.pub
  ```
puis copiez la clÃ© publique.

AprÃ¨s avoir effectuÃ© la copie, suivez les Ã©tapes suivantes:
* Rendez vous sur **git.inge.re**
* Cliquez sur votre avatar en haut Ã  gauche
* Selectionnez **Edit Profile**
* Dans la bar de menu de gauche, cliquez sur **SSH Keys**
* Appuyez ensuite sur le bouton **Add new key**
* Collez la clÃ© prÃ©cÃ©demment copiÃ©e dans le champ **Key** 
* Si vous le souhaitez, vous pouvez changer la date d'expiration de la clÃ©, cela vous Ã©vitera d'en gÃ©nÃ©rer une nouvelle dans quelques temps.
* Appuyez sur **Add key**

## 5.2 CrÃ©ation et installation des clÃ©s SSH pour bastion-ssh.inge.ovh
### 5.2.1 CrÃ©ation des clÃ©s SSH pour bastion-ssh.inge.ovh
Vous pouvez gÃ©nÃ©rer les clÃ©s SSH pour bastion-ssh.inge.ovh avec cette commande, en mettant vos informations:
```zsh
ssh-keygen -t ed25519 -C "prenom.nom@esiroi.re"
```
Comme pour git, vous devriez avoir deux nouveaux fichiers dans votre dossier **.ssh**:
- **id_ed25519**
- **id_ed25519.pub**
 
### 5.2.2 Installation de la clÃ© publique sur bastion-ssh.inge.ovh
- Dans le terminal, placez-vous dans votre dossier **.ssh** puis exÃ©cutez la commande suivante:
```zsh
scp id_ed25519.pub username@bastion.inge.ovh:
```
- Puis connectez-vous au serveur et exÃ©cutez la commande suivante:
```zsh
cp id_ed25519.pub /home/username/.ssh/authorized_keys
```

> **Les deux commandes prÃ©cÃ©dentes peuvent Ãªtre Ã©crites en une seule:**
```zsh
scp id_ed25519.pub username@bastion.inge.ovh:/home/username/.ssh/authorized_keys
```

Vous pouvez maintenant tester la connexion SSH grÃ¢ce Ã  la commande suivante dans votre terminal:
```zsh
ssh -i ~/.ssh/id_ed25519 username@bastion-ssh.inge.ovh
```

## 6. Installation de VirtualBox
Rendez vous sur le [site](https://www.virtualbox.org/wiki/Downloads).

> Attention a bien choisir la version:
> * si vous Ãªtes sur un mac dotÃ© d'une puce **Intel**, choisissez: **macOS / Intel hosts**
> * si vous Ãªtes sur un mac dotÃ© d'une puce **Apple Silicon (M1 et +)**, choisissez: **macOS / Apple Silicon hosts**
> 
* Lorsque le tÃ©lÃ©hargement est terminÃ©, ouvrez le fichier tÃ©lechargÃ©. Vous devriez voir apparaÃ®tre une fenÃªtre similaire Ã  celle-ci:

![alt text](img/VirtualBox.png)

Double cliquez sur l'icÃ´ne indiquÃ©e et suivez les Ã©tapes d'installation.

# 7. Installation de Picocom
Pour installer picocom sur votre Mac, vous pouvez utiliser la commande suivante:
```zsh
brew install picocom
```
Vous pouvez vÃ©rifier qu'il est bien installÃ© en exÃ©cutant la commande suivante:
```zsh
picocom --help
```


VoilÃ , vous avez terminÃ© la configuration de votre environnement de travail sur MacOS, vous pouvez maintenant vous mettre au travail.

