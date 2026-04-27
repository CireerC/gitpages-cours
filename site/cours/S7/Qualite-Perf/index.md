---
layout: course
title: "Qualité et performance logicielle"
semestre: "S7"
type_cours: "tronc"
tags: ["tests", "TDD", "BDD", "CMMI", "dette technique", "profiling", "couverture de code", "code review"]
---

## Introduction

La qualité logicielle désigne l'ensemble des propriétés d'un logiciel qui le rendent apte à satisfaire les besoins exprimés et implicites. Ce cours couvre les modèles qualité, les pratiques de test et les méthodes de mesure.

---

## Modèles qualité

### ISO/IEC 25010 (SQuaRE)

| Caractéristique | Description |
|----------------|-------------|
| **Fonctionnalité** | Complétude, exactitude, interopérabilité |
| **Performance** | Temps de réponse, utilisation des ressources |
| **Fiabilité** | Tolérance aux pannes, récupérabilité |
| **Sécurité** | Confidentialité, intégrité, authentification |
| **Maintenabilité** | Analysabilité, modifiabilité, testabilité |
| **Portabilité** | Adaptabilité, installabilité |
| **Usabilité** | Apprenabilité, opérabilité, satisfaction |

### CMMI (Capability Maturity Model Integration)

| Niveau | Nom | Description |
|--------|-----|-------------|
| 1 | Initial | Processus ad hoc, imprévisibles |
| 2 | Managed | Processus planifiés, exécutés et mesurés |
| 3 | Defined | Processus standardisés dans toute l'organisation |
| 4 | Quantitatively Managed | Processus mesurés et contrôlés statistiquement |
| 5 | Optimizing | Amélioration continue basée sur les données |

---

## Cycle de tests

```
Pyramide des tests :

              ┌──────┐
              │  E2E │  (peu nombreux, lents, coûteux)
             ┌┴──────┴┐
             │ Intégr. │
            ┌┴─────────┴┐
            │  Unitaires │ (nombreux, rapides, indépendants)
            └────────────┘
```

| Type | Portée | Vitesse | Outil |
|------|--------|---------|-------|
| **Unitaire** | Fonction/classe | Très rapide | JUnit, pytest, Jest |
| **Intégration** | Module + dépendances | Moyen | TestContainers, Spring Test |
| **Système** | Application complète | Lent | Selenium, Cypress |
| **Recette (UAT)** | Métier | Variable | Manuel + outils |

---

## TDD — Test-Driven Development

Cycle **Red → Green → Refactor** :

```
1. Écrire un test qui ÉCHOUE (Red)
2. Écrire le code MINIMUM pour que le test passe (Green)
3. Améliorer le code sans casser les tests (Refactor)
```

```python
# Exemple TDD Python avec pytest

# Étape 1 — Test (échoue car la fonction n'existe pas)
def test_fibonacci_base_cases():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1

def test_fibonacci_sequence():
    assert fibonacci(5) == 5
    assert fibonacci(10) == 55

def test_fibonacci_negative_raises():
    with pytest.raises(ValueError):
        fibonacci(-1)

# Étape 2 — Implémentation minimale
def fibonacci(n: int) -> int:
    if n < 0:
        raise ValueError("n doit être positif")
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Étape 3 — Refactor si besoin (ici OK)
```

---

## BDD — Behavior-Driven Development

Spécification en langage naturel avec **Gherkin** (Given/When/Then).

```gherkin
# features/panier.feature
Feature: Gestion du panier d'achat

  Scenario: Ajouter un produit au panier
    Given un utilisateur connecté avec un panier vide
    When il ajoute le produit "Python livre" au panier
    Then le panier contient 1 article
    And le total est de 29.99 euros

  Scenario: Appliquer un code promo valide
    Given un panier avec un total de 100 euros
    When le code promo "REMISE20" est appliqué
    Then le total est réduit à 80 euros

  Scenario Outline: Quantité invalide
    Given un produit disponible en stock
    When l'utilisateur ajoute <quantite> unités
    Then une erreur "<message>" est affichée

    Examples:
      | quantite | message                    |
      | 0        | La quantité doit être ≥ 1  |
      | -5       | La quantité doit être ≥ 1  |
      | 9999     | Stock insuffisant           |
```

```python
# steps/panier_steps.py (avec behave)
from behave import given, when, then

@given('un utilisateur connecté avec un panier vide')
def step_impl(context):
    context.user = create_test_user()
    context.cart = Cart(user=context.user)

@when('il ajoute le produit "{name}" au panier')
def step_impl(context, name):
    product = Product.objects.get(name=name)
    context.cart.add(product)

@then('le panier contient {count:d} article')
def step_impl(context, count):
    assert len(context.cart.items) == count
```

---

## Couverture de code

```bash
# Python — pytest + coverage
pytest --cov=myapp --cov-report=html --cov-report=term-missing
# Objectif : > 80% de couverture des lignes et branches

# Java — JaCoCo (Maven)
mvn test jacoco:report
# Rapport dans target/site/jacoco/index.html

# JavaScript — Jest
jest --coverage --coverageThreshold='{"global":{"lines":80}}'
```

**Types de couverture :**
- **Line coverage** : % de lignes exécutées
- **Branch coverage** : % de branches (if/else) testées
- **Function coverage** : % de fonctions appelées

> 100% de couverture ne garantit pas l'absence de bugs — la qualité des assertions importe autant que la couverture.

---

## Métriques de qualité

### Dette technique

```python
# Code smell : fonction trop longue, trop de complexité cyclomatique
def process_order(order, user, discount_code=None, notify=True,
                  warehouse=None, priority=False):  # Trop de paramètres
    # 200 lignes de code ici...
    pass

# Refactorisé avec principe de responsabilité unique (SRP)
def apply_discount(order: Order, code: str) -> Decimal: ...
def select_warehouse(order: Order, priority: bool) -> Warehouse: ...
def process_order(order: Order, user: User, options: OrderOptions) -> OrderResult: ...
```

### SonarQube — Mesures

| Métrique | Description | Seuil |
|---------|-------------|-------|
| Complexité cyclomatique | Nombre de chemins d'exécution | < 10 par méthode |
| Duplication | % de code dupliqué | < 3% |
| Maintenabilité | Estimation du temps de correction | Rating A-E |
| Fiabilité | Bugs détectés | 0 bug critique |
| Sécurité | Vulnérabilités | 0 critique/haute |
| Coverage | % de code testé | > 80% |

---

## Profiling et benchmarking

```python
# Python — cProfile
import cProfile, pstats

profiler = cProfile.Profile()
profiler.enable()
result = expensive_function()
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)  # Top 20 fonctions les plus lentes

# line_profiler — par ligne
@profile
def slow_function():
    result = []
    for i in range(10000):
        result.append(i ** 2)   # ← Ligne lente
    return result

# kernprof -l -v script.py

# memory_profiler
from memory_profiler import profile
@profile
def memory_hungry():
    big_list = [i for i in range(1_000_000)]
    return sum(big_list)
```

---

## Revue de code

### Checklist de review

- [ ] La PR répond-elle exactement au ticket/issue ?
- [ ] Les cas limites et erreurs sont-ils gérés ?
- [ ] Les tests couvrent-ils les nouvelles fonctionnalités ?
- [ ] Pas de secrets/credentials dans le code
- [ ] Nommage clair et cohérent avec le reste de la codebase
- [ ] Pas de code mort ou commenté inutilement
- [ ] Les performances sont-elles acceptables ?
- [ ] La documentation est-elle mise à jour ?

---

## Résumé

| Pratique | Bénéfice |
|---------|---------|
| TDD | Conception pilotée par les tests, moins de régression |
| BDD | Alignement métier-technique, tests lisibles |
| CI avec tests | Détection précoce des régressions |
| Coverage > 80% | Confiance pour les refactorisations |
| SonarQube | Détection automatique de la dette technique |
| Code review | Propagation des bonnes pratiques |
