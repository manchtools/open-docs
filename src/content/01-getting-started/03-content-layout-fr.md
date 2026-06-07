---
title: Organisation du contenu
---

# Organisation du contenu

Tout ce que le site affiche provient d'un seul répertoire de Markdown. Avec
Docker, ce répertoire est ce que vous montez sur `/content` ; depuis les
sources, c'est `src/content/`. Le reste (routes, barre latérale, recherche)
en est dérivé.

## Une arborescence type

{% filetree %}
- content/
  - theme.css — styles personnalisés optionnels
  - 01-getting-started/
    - 01-introduction.md
    - 02-quick-start.md
  - 02-reference/
    - index.md — la page d'accueil de la section
    - api.md
{% /filetree %}

Cela produit :

- Une **barre latérale** avec deux groupes, « Getting started » et « Reference ».
- Des routes vers `/getting-started/introduction`, `/getting-started/quick-start`,
  `/reference` (l'index de la section) et `/reference/api`.
- Un **index de recherche** couvrant chaque page.

## Les règles

- **Les fichiers deviennent des pages.** `reference/api.md` → `/reference/api`.
- **Les dossiers de premier niveau deviennent des groupes** dans la barre
  latérale. Les fichiers qu'ils contiennent deviennent les éléments de ce groupe.
- **Les noms de fichiers deviennent des URL**, en kebab-case : `quick-start.md` →
  `/…/quick-start`.
- **Le fichier `index.md` d'un dossier** est la page d'accueil de cette section,
  servie à l'URL du dossier (`reference/index.md` → `/reference`).
- **Les préfixes numériques** comme `01-` définissent l'ordre et sont retirés
  de l'URL et du titre. Voir
  [Ordre et titres](/fr/navigation/ordering-and-titles).

{% callout type="info" title="La page d'accueil" %}
La page d'accueil du site (`/`) est un hero généré qui liste vos sections sous
forme de cartes ; ce n'est pas un fichier Markdown. Placez votre première vraie
page dans un groupe, comme le fait ce site avec
[Introduction](/fr/getting-started/introduction).
{% /callout %}

## Ce qui est ignoré

Seuls les fichiers `.md` et `.markdoc` du répertoire de contenu deviennent des
pages. Un fichier `theme.css` est pris en compte pour le [thème](/fr/customizing/theming) ;
tout le reste (brouillons, notes, fichiers `.txt`) est ignoré, ce qui vous
permet de garder des fichiers de travail à côté de votre documentation.

Si vous référencez une image, placez-la sous `static/` et pointez vers elle
depuis `/screenshots/…` — voir [Captures d'écran](/fr/authoring/blocks/media/screenshots).
