---
layout: course
title: "Reverse Engineering"
semestre: "S8"
type_cours: "cybersec"
tags: ["assembleur", "x86", "Ghidra", "GDB", "anti-debug", "malware", "ELF", "PE", "désassemblage", "décompilation"]
---

## Introduction

Le Reverse Engineering (rétro-ingénierie) consiste à analyser un programme sans accès au code source pour en comprendre le fonctionnement. C'est une compétence fondamentale en cybersécurité : analyse de malwares, recherche de vulnérabilités, CTF, audit de binaires.

---

## Architecture x86/x64 — Rappels essentiels

### Registres x64

| Registre | Usage | 32-bit | 16-bit | 8-bit |
|----------|-------|--------|--------|-------|
| `rax` | Accumulateur / valeur de retour | `eax` | `ax` | `al` |
| `rbx` | Base (callee-saved) | `ebx` | `bx` | `bl` |
| `rcx` | Compteur / arg 4 | `ecx` | `cx` | `cl` |
| `rdx` | Données / arg 3 | `edx` | `dx` | `dl` |
| `rsi` | Source index / arg 2 | `esi` | `si` | `sil` |
| `rdi` | Destination index / arg 1 | `edi` | `di` | `dil` |
| `rsp` | Stack pointer | `esp` | `sp` | `spl` |
| `rbp` | Base pointer (stack frame) | `ebp` | `bp` | `bpl` |
| `rip` | Instruction pointer | — | — | — |
| `r8–r15` | Registres généraux / args 5-8 | `r8d–r15d` | `r8w–r15w` | `r8b–r15b` |

### Convention d'appel Linux x64 (System V ABI)

```
Arguments :  rdi, rsi, rdx, rcx, r8, r9  (puis pile)
Retour    :  rax (rax:rdx pour 128 bits)
Callee-saved : rbx, rbp, r12–r15
Caller-saved : rax, rcx, rdx, rsi, rdi, r8–r11
```

### Instructions essentielles

```nasm
; Transfert
mov rax, rbx          ; rax = rbx
mov rax, [rbx]        ; rax = *rbx  (déréférencement)
mov [rbx], rax        ; *rbx = rax
lea rax, [rbx + 8]    ; rax = rbx + 8 (adresse, pas valeur)

; Arithmétique
add rax, 1            ; rax++
sub rsp, 0x20         ; alloue 32 octets sur la pile
imul rcx, rdx, 4      ; rcx = rdx * 4
xor rax, rax          ; rax = 0 (idiome courant)

; Pile
push rbp              ; rsp -= 8, [rsp] = rbp
pop  rbp              ; rbp = [rsp], rsp += 8

; Sauts
cmp rax, 0            ; Soustraction sans stocker (flags ZF, SF, OF)
je  label             ; Saut si ZF=1 (égal)
jne label             ; Saut si ZF=0
jl  label             ; Saut si SF≠OF (signé <)
jg  label             ; Saut si ZF=0 et SF=OF (signé >)
jmp label             ; Saut inconditionnel

; Appel de fonction
call func             ; push rip+5 ; jmp func
ret                   ; pop rip (retour)
```

### Prologue/épilogue typique d'une fonction

```nasm
func:
    push rbp           ; sauvegarde base pointer
    mov  rbp, rsp      ; crée le stack frame
    sub  rsp, 0x30     ; espace pour variables locales
    ; ... corps de la fonction ...
    mov  rsp, rbp      ; restaure la pile
    pop  rbp
    ret
```

---

## Formats de binaires

### ELF (Linux)

```
ELF Header
  ├── e_type   : ET_EXEC (exécutable), ET_DYN (shared lib)
  ├── e_entry  : adresse du point d'entrée
  └── e_phoff  : offset program headers

Program Headers (segments — exécution)
  ├── LOAD : segments chargés en mémoire
  ├── DYNAMIC : informations pour le linker dynamique
  └── INTERP : chemin de l'interpréteur (/lib/ld-linux.so)

Section Headers (pour l'analyse statique)
  ├── .text   : code exécutable
  ├── .data   : données initialisées
  ├── .bss    : données non initialisées
  ├── .rodata : constantes (strings)
  ├── .plt    : Procedure Linkage Table (appels dynamiques)
  └── .got    : Global Offset Table (adresses résolues)
```

```bash
# Analyse ELF
file    binary          # type de fichier
readelf -h binary       # header
readelf -S binary       # sections
readelf -d binary       # dynamic section (bibliothèques)
nm      binary          # symboles (si non strippé)
strings binary          # chaînes de caractères
objdump -d binary       # désassemblage
ldd     binary          # dépendances dynamiques
```

### PE (Windows)

```
DOS Header → PE Header → Optional Header
  ├── ImageBase         : adresse de chargement (0x400000 typique)
  ├── AddressOfEntryPoint : RVA du point d'entrée
  └── DataDirectory[16] : imports, exports, resources, TLS...

Sections :
  ├── .text : code
  ├── .rdata : données en lecture seule (imports, strings)
  ├── .data : données globales
  ├── .rsrc : ressources (icônes, manifestes)
  └── UPX0, UPX1 : sections packers (signe de packing)
```

```bash
# Outils Windows
pe-tree    binary.exe   # arborescence PE
pefile     binary.exe   # analyse Python
dumpbin /imports binary.exe  # imports (MSVC)
```

---

## Ghidra — Désassemblage et décompilation

### Workflow d'analyse statique

```
1. File → New Project → Import File
2. Analyse automatique (CodeBrowser → Analysis → Auto Analyze)
3. Window → Functions  → naviguer vers main() ou WinMain()
4. Window → Decompiler → vue pseudo-C
5. Renommer variables/fonctions : touche L
6. Annoter : touche ; pour commentaire
```

### Astuces Ghidra

```python
# Script Ghidra (Python/Jython) pour trouver les strings XOR-encodées
from ghidra.program.model.listing import CodeUnit

listing = currentProgram.getListing()
# Chercher les appels à des fonctions de décodage
for func in currentProgram.getFunctionManager().getFunctions(True):
    if "decode" in func.getName().lower() or "decrypt" in func.getName().lower():
        print(f"Fonction suspecte: {func.getName()} @ {func.getEntryPoint()}")
```

### Reconnaissance de patterns courants

```
; strcmp / strncmp → test de mot de passe
call strcmp
test eax, eax
jne  wrong_password

; Boucle XOR (décodage)
xor_loop:
    movzx eax, byte ptr [rbx + rcx]
    xor   eax, 0x42           ; clé XOR
    mov   [rdx + rcx], al
    inc   rcx
    cmp   rcx, rsi
    jl    xor_loop

; Anti-debug IsDebuggerPresent (Windows)
call IsDebuggerPresent
test eax, eax
jne  exit_program
```

---

## GDB — Débogage dynamique

### Commandes essentielles

```bash
gdb ./binary           # lancer GDB

# Points d'arrêt
b main                 # breakpoint sur main
b *0x401234            # breakpoint à une adresse
b func_name            # breakpoint sur une fonction
info breakpoints       # lister les breakpoints
d 1                    # supprimer breakpoint n°1

# Exécution
r                      # run
r arg1 arg2            # run avec arguments
c                      # continue
ni                     # next instruction (step over)
si                     # step instruction (step into)
fin                    # finish (exécuter jusqu'au ret)

# Inspection mémoire et registres
info registers         # tous les registres
p $rax                 # valeur de rax
x/20x $rsp             # 20 dwords en hex à rsp
x/s  0x402050          # string à cette adresse
x/10i $rip             # 10 instructions à partir de rip

# Modifications
set $rax = 0           # modifier un registre
set {int}0x601020 = 1  # écrire en mémoire

# Pile
bt                     # backtrace (call stack)
frame 2                # aller au frame n°2
```

### GDB + pwndbg/peda (CTF)

```bash
# Installation pwndbg
git clone https://github.com/pwndbg/pwndbg && cd pwndbg && ./setup.sh

# Commandes supplémentaires
context               # vue complète (registres + pile + code)
checksec              # protections du binaire
vmmap                 # carte mémoire du processus
search -s "password"  # chercher une string en mémoire
telescope $rsp 20     # affichage intelligent de la pile
```

### Protections binaires

```bash
checksec --file=binary
# NX       : No-eXecute (pile non exécutable)
# CANARY   : stack canary (détection buffer overflow)
# RELRO    : Read-Only Relocations (GOT protégé)
# PIE      : Position Independent Executable (ASLR)
```

---

## Techniques anti-analyse et contournements

### Anti-debug

```c
// IsDebuggerPresent (Windows)
if (IsDebuggerPresent()) { exit(1); }
// Contournement : patch le jump ou patcher IsDebuggerPresent

// ptrace self (Linux) — un processus ne peut être ptrace'd qu'une fois
if (ptrace(PTRACE_TRACEME, 0, 0, 0) == -1) { exit(1); }
// Contournement : patch le test ou hook ptrace via LD_PRELOAD

// Timing attack (détecte le ralentissement du debug)
struct timeval t1, t2;
gettimeofday(&t1, NULL);
// ... code ...
gettimeofday(&t2, NULL);
if (t2.tv_sec - t1.tv_sec > 2) { exit(1); }
```

### Obfuscation courante

| Technique | Description | Contournement |
|-----------|-------------|---------------|
| **Stripping** | Suppression des symboles | Analyse comportementale |
| **Packing** (UPX, custom) | Compression + déchiffrement au runtime | Dump mémoire après unpack |
| **XOR encoding** | Strings chiffrées en mémoire | Breakpoint après décodage |
| **Control flow flattening** | Dispatcher central (switch géant) | Analyse dynamique |
| **Fake disassembly** | Bytes parasites trompant le désassembleur | Analyse manuelle |
| **VM-based** | Exécution sur VM personnalisée | Long à analyser |

### Dumping mémoire (unpackers)

```bash
# Méthode 1 : dump avec GDB après OEP (Original Entry Point)
gdb ./packed
b *0x4012a0     # OEP trouvé via analyse
r
dump memory dump.bin 0x400000 0x401000

# Méthode 2 : LD_PRELOAD hook
# Méthode 3 : /proc/PID/maps + /proc/PID/mem
cat /proc/$(pidof binary)/maps
dd if=/proc/$(pidof binary)/mem bs=1 skip=$((0x400000)) count=$((0x10000)) of=dump.bin
```

---

## Analyse de malwares — Méthodologie

### Environnement sécurisé

```
1. VM isolée (VMware/VirtualBox) — snapshot avant analyse
2. Réseau : INetSim (simulateur réseau) ou FlareVM
3. Snapshot avant exécution → restauration après
4. Outils : Process Monitor, Wireshark, Regshot (Windows)
         : strace, ltrace, tcpdump (Linux)
```

### Analyse statique rapide

```bash
# 1. Identification
file malware.bin
sha256sum malware.bin    # hash → VirusTotal
strings malware.bin | grep -E "(http|ftp|\\\\|HKEY|cmd|powershell)"

# 2. Imports suspects (Windows)
# CreateRemoteThread, VirtualAllocEx → injection de processus
# RegSetValueEx → persistance registre
# CryptEncrypt/CryptDecrypt → chiffrement
# WSAStartup, connect, send/recv → réseau
# CreateService → service malveillant

# 3. Entropie des sections
python3 -c "
import math, sys
data = open(sys.argv[1],'rb').read()
freq = [data.count(bytes([i]))/len(data) for i in range(256)]
ent  = -sum(p*math.log2(p) for p in freq if p>0)
print(f'Entropie: {ent:.2f}/8.0')
" malware.bin
# > 7.0 → probablement packé ou chiffré
```

### Analyse dynamique Linux

```bash
# Tracer les appels système
strace -f -e trace=all ./malware 2>&1 | tee strace.log

# Tracer les appels de bibliothèques
ltrace ./malware

# Surveiller les connexions réseau
tcpdump -i any -w capture.pcap &
./malware
killall tcpdump

# Surveiller le filesystem
inotifywait -m -r /tmp /etc /var &
./malware
```

### Indicateurs de compromission (IoC)

```
Fichiers créés/modifiés  → persistance
Clés de registre créées  → autostart
Connexions réseau        → C2 (Command & Control)
Processus enfants        → injection, spawn shell
Hooks API                → rootkit, keylogger
```

---

## Exploitation de binaires (intro)

### Buffer overflow classique (stack)

```python
# Exemple avec pwntools
from pwn import *

# Analyse
binary = ELF('./vuln')
p = process('./vuln')

# Trouver l'offset jusqu'au RIP
# gdb: pattern create 200 → run → pattern offset $rip
offset = 72

# Payload : padding + adresse de win()
payload  = b'A' * offset
payload += p64(binary.symbols['win'])   # little-endian 64 bits

p.sendline(payload)
p.interactive()
```

### Format string

```c
// Vulnérabilité
printf(user_input);           // DANGEREUX
printf("%s", user_input);     // Correct

// Exploitation
"%p %p %p %p"    → fuite de la pile
"%7$p"           → 7ème argument
"%n"             → écriture du nombre de chars imprimés
```

---

## Résumé outils

| Outil | Usage |
|-------|-------|
| **Ghidra** | Décompilateur statique (NSA, gratuit) |
| **IDA Pro** | Désassembleur de référence (commercial) |
| **GDB + pwndbg** | Débogage dynamique Linux |
| **x64dbg** | Débogage dynamique Windows |
| **Radare2 / Cutter** | Analyse multi-plateforme (open source) |
| **pwntools** | Framework exploitation Python |
| **FLOSS** | Extraction de strings obfusquées (FireEye) |
| **DIE (Detect-It-Easy)** | Identification packer/compilateur |
| **PEiD / ExeinfoPE** | Identification PE Windows |
| **Procmon / x64dbg** | Analyse comportementale Windows |
