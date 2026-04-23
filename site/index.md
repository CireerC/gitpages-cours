---
layout: app
title: "Accueil"
---

# Bibliotheque de cours et ressources

Un site personnel pour centraliser les cours, resumes et references techniques.

<section class="home-grid">
  <article class="home-card">
    <h2>Navigation rapide</h2>
    <p>Utilise le menu de gauche pour ouvrir un cours par semestre.</p>
    <ul>
      <li>Acces direct aux cours</li>
      <li>Categorie par type de matiere</li>
      <li>Ajout evolutif au fil des semestres</li>
    </ul>
  </article>

  <article class="home-card">
    <h2>Structure du projet</h2>
    <ul>
      <li><code>site/cours/</code> pour les cours</li>
      <li><code>site/ressources/</code> pour les fiches transverses</li>
      <li><code>site/_templates/</code> pour les modeles</li>
      <li><code>site/_data/navigation.yml</code> pour le menu gauche</li>
    </ul>
  </article>
</section>

## Semestres

<section class="semester-grid">
  <article class="semester-card">
    <h3>S5</h3>
    <p>1 cours reference actuellement.</p>
    <a href="cours/S5/Algo%20En%20C/cookies.html">Algo en C - Cookies</a>
  </article>
</section>

## Ajouter un cours
<a id="ajouter-un-cours"></a>

1. Copier `site/_templates/template_cours.md`.
2. Creer le fichier dans `site/cours/SX/Nom Du Cours/`.
3. Remplir les metadonnees (`title`, `semestre`, `type_cours`, `tags`).
4. Ajouter le lien dans `site/_data/navigation.yml`.
5. Commit puis push pour publier.
