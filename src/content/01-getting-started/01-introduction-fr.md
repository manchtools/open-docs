---
title: Introduction
---

# open-docs

{% boost weight=8 %}
**open-docs** est un site de documentation livrable en conteneur.
Déposez vos fichiers Markdown (ou [Markdoc](https://markdoc.dev/)) dans un
répertoire, pointez un conteneur dessus, et vous obtenez un site de
documentation avec recherche, mode sombre et coloration syntaxique, sans
étape de build à configurer ni framework à apprendre.
{% /boost %}

Le site que vous lisez en ce moment *est* open-docs affichant sa propre
documentation. Tout ce qui est ici est livré dans l'image de conteneur par
défaut : un simple `docker run` sans contenu monté tombe donc sur ces pages.

## Pourquoi il existe

La plupart des générateurs de documentation sont une dépendance que vous
ajoutez à un dépôt et que vous compilez vous-même. open-docs prend le contre-pied :
c'est une **image générique dans laquelle vous montez votre contenu**. La même
image publiée sert n'importe quel jeu de documentation. Vous fournissez le
Markdown ; l'image fournit le thème, le rendu et la recherche.

C'est donc un bon choix quand vous voulez :

- Mettre en place la documentation d'un projet sans ajouter de chaîne d'outils à son dépôt.
- Faire tourner un manuel interne ou une base de connaissances depuis un dossier de Markdown.
- Séparer proprement le contenu et la présentation.

## Ce que vous obtenez

- **Une navigation issue des dossiers.** La barre latérale est construite à
  partir de votre arborescence de répertoires : il n'y a donc aucun fichier de
  navigation à maintenir à jour. Voir
  [Navigation](/fr/navigation/folder-derived-nav).
- **Une recherche plein texte**, indexée automatiquement au démarrage avec
  [Pagefind](https://pagefind.app) et réglée pour la documentation. Voir
  [Recherche](/fr/customizing/search).
- **Un mode clair / sombre** avec une bascule dans la barre supérieure.
- **La coloration syntaxique** via [Shiki](https://shiki.style) et les
  **diagrammes** via [Mermaid](https://mermaid.js.org). Voir
  [Code et diagrammes](/fr/authoring/blocks/media/code-and-diagrams).
- **La personnalisation du thème** depuis un seul fichier `theme.css` déposé à
  côté de votre contenu. Voir [Thème](/fr/customizing/theming).
- **Le rebranding par variable d'environnement** (nom, logo, couleurs, lien du
  dépôt), pour qu'une seule image serve plusieurs sites. Voir
  [Configuration](/fr/customizing/configuration).
- **Des blocs de contenu** (callouts, onglets, captures d'écran) par-dessus le
  Markdown ordinaire. Voir [Callouts et onglets](/fr/authoring/blocks/callouts-and-tabs).

## Étapes suivantes

Rendez-vous sur le [Démarrage rapide](/fr/getting-started/quick-start) pour
mettre un site en ligne en moins d'une minute, puis lisez
[Organisation du contenu](/fr/getting-started/content-layout) pour comprendre
comment vos fichiers deviennent des pages.
