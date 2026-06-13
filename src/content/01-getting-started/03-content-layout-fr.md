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

<!-- docref: begin src=src/lib/slug.ts#cleanSlug:9c51ef45,src/lib/slug.ts#stripPrefix:b2742e12,src/lib/slug.ts#titleFromSegment:d11d1ecd -->

- **Les fichiers deviennent des pages.** `reference/api.md` → `/reference/api`.
- **Les dossiers de premier niveau deviennent des groupes** dans la barre
  latérale. Les fichiers qu'ils contiennent deviennent les éléments de ce groupe.
- **Les noms de fichiers deviennent des URL**, en kebab-case : `quick-start.md` →
  `/…/quick-start`.
- **Le fichier `index.md` d'un dossier** est la page d'accueil de cette section,
  servie à l'URL du dossier (`reference/index.md` → `/reference`). Un
  `README.md` joue le même rôle quand il n'y a pas d'`index.md`.
- **Les préfixes numériques** comme `01-` définissent l'ordre et sont retirés
  de l'URL et du titre. Voir
  [Ordre et titres](/fr/navigation/ordering-and-titles).

<!-- docref: end -->

{% callout type="info" title="La page d'accueil" %}
La page d'accueil du site (`/`) est un hero généré qui liste vos sections sous
forme de cartes ; ce n'est pas un fichier Markdown. Placez votre première vraie
page dans un groupe, comme le fait ce site avec
[Introduction](/fr/getting-started/introduction).
{% /callout %}

## Ce qui est ignoré

Seuls les fichiers `.md` et `.markdoc` du répertoire de contenu deviennent des
pages. Un fichier `theme.css` est pris en compte pour le [thème](/fr/customizing/theming).
Les fichiers non Markdown que vos pages référencent (images et assimilés) sont
servis depuis le dossier de contenu ; les fichiers de travail non référencés
(brouillons, notes, fichiers `.txt`) restent invisibles, ce qui vous permet de
les garder à côté de votre documentation.

Les images peuvent vivre juste à côté de votre Markdown et être liées comme
votre éditeur s'y attend (`![diagram](./images/arch.png)`) ; elles sont
servies depuis le dossier de contenu. Voir
[Markdown existant](/fr/authoring/bring-existing-markdown). Le répertoire
`static/` reste là pour les ressources partagées comme les favicons.
