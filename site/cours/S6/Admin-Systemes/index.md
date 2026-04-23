---
layout: course
title: "Administration des systèmes"
semestre: "S6"
type_cours: "systèmes"
tags: ["Active Directory", "Windows Server", "WDS", "MDT", "GPO", "PowerShell"]
---

## Introduction

Ce cours couvre l'administration d'un environnement Windows Server en entreprise — Active Directory (AD), gestion des utilisateurs et des groupes, déploiement automatisé de postes (WDS/MDT), et politiques de groupe (GPO).

## Active Directory (AD)

L'**Active Directory** est le service d'annuaire de Microsoft — il centralise l'authentification et la gestion des ressources dans un domaine Windows.

### Composants clés

| Composant | Rôle |
|-----------|------|
| **Domaine** | Unité administrative de base (ex : `esiroi.local`) |
| **Contrôleur de domaine (DC)** | Serveur qui héberge l'AD et authentifie les utilisateurs |
| **Unité d'Organisation (OU)** | Conteneur pour organiser objets (utilisateurs, groupes, ordinateurs) |
| **GPO** | Politique de groupe liée à une OU ou au domaine |

### Infrastructure TP — Serveurs déployés

| Rôle | Nom | Description |
|------|-----|-------------|
| Contrôleur de domaine | `SRV-AD-01` | AD DS, DNS |
| Serveur d'impression | `SRV-PRINT` | Gestion des imprimantes partagées |
| Déploiement réseau | `SRV-WDS` | WDS + MDT pour le déploiement de postes |
| DHCP | Inclus dans SRV-AD-01 | Attribution automatique des adresses IP |

## Gestion des utilisateurs et groupes

### Création via PowerShell

```powershell
# Créer un utilisateur
New-ADUser -Name "Éric Forster" `
           -SamAccountName "eric.forster" `
           -UserPrincipalName "eric.forster@esiroi.local" `
           -AccountPassword (ConvertTo-SecureString "P@ssword1!" -AsPlainText -Force) `
           -Enabled $true `
           -Path "OU=Etudiants,DC=esiroi,DC=local"

# Créer un groupe
New-ADGroup -Name "GRP_IT_3A" `
            -GroupScope Global `
            -GroupCategory Security `
            -Path "OU=Groupes,DC=esiroi,DC=local"

# Ajouter un utilisateur à un groupe
Add-ADGroupMember -Identity "GRP_IT_3A" -Members "eric.forster"
```

### Import en masse depuis un CSV

```powershell
Import-Csv "utilisateurs.csv" | ForEach-Object {
    New-ADUser -Name "$($_.Prenom) $($_.Nom)" `
               -SamAccountName "$($_.Prenom.ToLower()).$($_.Nom.ToLower())" `
               -AccountPassword (ConvertTo-SecureString $_.MotDePasse -AsPlainText -Force) `
               -Enabled $true
}
```

## Partage de fichiers et permissions

### Création d'un partage réseau

```powershell
# Créer le dossier et le partage
New-Item -Path "C:\Partages\Direction" -ItemType Directory
New-SmbShare -Name "Direction$" -Path "C:\Partages\Direction" `
             -FullAccess "GRP_Direction" -ReadAccess "GRP_IT"

# Configurer les ACLs NTFS
$acl = Get-Acl "C:\Partages\Direction"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "GRP_Direction", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\Partages\Direction" $acl
```

## Politiques de groupe (GPO)

Les **GPO** (*Group Policy Objects*) appliquent automatiquement des configurations à tous les ordinateurs/utilisateurs d'une OU.

### Exemples de GPO de sécurité

| GPO | Configuration |
|-----|--------------|
| Politique de mot de passe | Longueur min 12 car., complexité obligatoire, expiration 90j |
| Verrouillage de compte | 5 tentatives → verrouillage 30 min |
| Écran de veille | Activation après 10 min avec mot de passe |
| Pare-feu Windows | Activer sur tous les profils |
| Windows Defender | Activer la protection temps réel |

### Script de vérification GPO (PowerShell)

```powershell
# Vérifier que Windows Defender est actif
$status = Get-MpComputerStatus
if ($status.RealTimeProtectionEnabled) {
    Write-Output "Windows Defender : ACTIF"
} else {
    Write-Warning "Windows Defender : INACTIF — application de la GPO..."
    Set-MpPreference -DisableRealtimeMonitoring $false
}

# Vérifier l'expiration des mots de passe
Search-ADAccount -PasswordExpired | Select-Object Name, SamAccountName
```

## WDS — Windows Deployment Services

**WDS** permet le déploiement réseau d'images Windows via PXE (*Preboot eXecution Environment*) — les postes démarrent depuis le réseau et reçoivent une image Windows sans CD/USB.

### Prérequis

- Serveur DHCP actif (options 66 et 67 pour PXE)
- Serveur DNS
- Images de démarrage (`.wim`) et d'installation

### Flux de déploiement WDS

```
1. Poste démarre en PXE (réseau)
2. Reçoit l'adresse IP du DHCP
3. Contacte le serveur WDS
4. Charge l'image de démarrage (Windows PE)
5. Sélectionne l'image d'installation
6. Installe Windows sur le poste
```

## MDT — Microsoft Deployment Toolkit

**MDT** s'appuie sur WDS pour automatiser entièrement le déploiement — installation Windows + applications + configuration post-installation, sans intervention manuelle.

### Séquence de tâches MDT

```
Démarrage PXE → WinPE → Partitionnement → Installation Windows
→ Installation pilotes → Installation applications → Configuration
→ Jonction domaine → Fin
```

### Variables d'automatisation

```ini
; Fichier CustomSettings.ini
[Settings]
Priority=Default

[Default]
OSInstall=YES
SkipCapture=YES
SkipAdminPassword=YES
AdminPassword=P@ssw0rd!
JoinDomain=esiroi.local
DomainAdmin=admin
DomainAdminPassword=P@ssw0rd!
```

## Résumé

- L'**Active Directory** centralise l'authentification et la gestion des ressources en entreprise.
- Les **GPO** permettent d'appliquer des politiques de sécurité uniformes sur tout le parc informatique.
- **WDS + MDT** automatisent le déploiement de Windows — essentiel pour gérer de nombreux postes.
- **PowerShell** est l'outil d'administration Windows par excellence — toujours préférer les scripts aux clics pour la reproductibilité.

## Références

- Cours Administration Systèmes, S6 2024-2025
- Fichier source : `Admin.md`
- Supports PDF : `Admin2.pdf`, `Admin3.pdf`, `Administration systèmes 1.pdf`
- Documentation Microsoft : `https://learn.microsoft.com/fr-fr/windows-server/`
