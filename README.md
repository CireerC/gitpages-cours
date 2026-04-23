# GitPages Cours

Bibliotheque personnelle de cours et de ressources, prete pour GitHub Pages.

## Structure

- `.github/workflows/pages.yml` : deploiement automatique GitHub Pages.
- `site/_config.yml` : configuration Jekyll.
- `site/index.md` : page d'accueil.
- `site/_templates/template_cours.md` : template de fiche de cours.
- `site/cours/` : tous les cours classes par semestre.
- `site/ressources/` : ressources transverses (methodes, fiches, outils).

## Ajouter un nouveau cours

1. Copier `site/_templates/template_cours.md`.
2. Coller dans `site/cours/SX/Nom Du Cours/nom_du_fichier.md`.
3. Remplir:
   - nom du cours,
   - semestre (`S1`, `S2`, ...),
   - type (`tronc commun`, `dev`, `cybersecurite`, `data`, `iot`, `reseaux`, ...),
   - mini plan,
   - resume complet.
4. Ajouter le cours dans `site/_data/navigation.yml` pour le menu gauche.
5. Optionnel: ajouter aussi un lien dans `site/index.md`.

## Publication

Le workflow deploiement se lance sur la branche `main`.
