---
title: Blog
description: "Transformez n'importe quelle section en blog avec blog: true : articles datés, une liste générée, des auteurs, des tags et un flux Atom, aux côtés de votre documentation."
---

# Blog

N'importe quelle section peut devenir un blog. Définissez `blog: true`
dans l'`index.md` de la section et ses pages deviennent des **articles** :
triés du plus récent au plus ancien par date, listés automatiquement sur
la page de la section, avec une navigation Plus récent/Plus ancien, des
pages de tags et un flux Atom. Documentation et blogs cohabitent dans une
seule arborescence de contenu : le [changelog](/fr/changelog) de ce site
est exactement une section de ce type.

```markdown
---
blog: true        # in blog/index.md
---
```

## Les articles

Un article est une page Markdown ordinaire avec une date :

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/paul
tags: release, open-source
description: How we launched, and what comes next.
---
```

| Clé | Obligatoire | Effet |
|---|---|---|
| `date` | oui | `YYYY-MM-DD`. Clé de tri et date affichée (localisée). Une date absente ou malformée fait échouer la validation au démarrage. |
| `author` | non | Un nom d'affichage, ou un chemin absolu du site vers une [page d'auteur](#les-auteurs-sont-des-pages). |
| `tags` | non | Séparés par des virgules. Affichés sous forme de pastilles et regroupés dans des pages `/<section>/tags/<tag>`. |
| `cover` | non | Image sous `static/`. S'affiche en hero pleine largeur sur l'article, en vignette dans la liste, et comme image de carte sociale de l'article. Les articles qui commencent par un bloc `{% hero %}` n'en ont pas besoin : l'image du hero est utilisée. |
| `draft` | non | `true` ne sert l'article qu'en développement ; la production l'exclut partout. |

Les noms de fichiers sont libres (`launch-post.md` → `/blog/launch-post`) ;
la date ne vit que dans le frontmatter. Les articles utilisent leur propre
navigation Plus récent/Plus ancien et ne se mélangent jamais à la chaîne
précédent/suivant de la documentation.

## La liste

L'`index.md` de la section affiche d'abord sa propre prose, puis la
liste générée des articles : couverture, date localisée, temps de
lecture, auteur, description et tags. Le temps de lecture correspond au
nombre de mots de l'article à 200 mots par minute, arrondi, avec un
minimum d'une minute.

## Les auteurs sont des pages

Placez les auteurs dans un dossier `authors/` à l'intérieur de la section
blog. Les pages qui s'y trouvent sont des pages de profil, pas des
articles (aucune date requise, jamais listées) :

```markdown
---
title: Paul Dotterer        # blog/authors/paul.md
avatar: authors/paul.png    # under static/
---

Builds manchtools.
```

Le `author: /blog/authors/paul` d'un article prend le nom dans le `title`
de cette page, l'image dans `avatar:`, et fait pointer la signature vers
la page. Un chemin qui ne se résout pas fait échouer la validation. Un
simple `author: Paul Dotterer` fonctionne aussi : pas de page, pas
d'avatar, aucune configuration.

La même référence fonctionne dans le bloc `{% avatar %}`, si bien qu'un
auteur est déclaré une seule fois et réutilisé partout :

```markdown
{% avatar author="/blog/authors/paul" /%}
```

Le nom, l'image, la bio (le premier paragraphe de la page) et le lien
proviennent tous de la page d'auteur ; tout attribut que vous définissez
explicitement l'emporte. En bref : le frontmatter `author:` relève des
*métadonnées* (liste, signature, flux), le bloc `{% avatar %}` est la
*carte visuelle*, et les deux peuvent pointer vers la même page.

## Les blocs hero et avatar

Deux blocs conçus pour les blogs, utilisables partout :

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/paul.png" name="Paul Dotterer" description="Builds manchtools." /%}
```

Placé directement après un hero, l'image de l'avatar **chevauche le bord inférieur du hero de la moitié de sa hauteur**, soit l'en-tête
classique avec photo de couverture. Les deux s'affichent normalement
lorsqu'ils sont seuls. Un article avec `cover:` reçoit le hero
automatiquement.

## Quote et gallery

```markdown
{% quote by="Ada Lovelace" cite="https://example.com" %}
The engine weaves algebraic patterns.
{% /quote %}

{% gallery %}
![first](/screenshots/a.png)
![second](/screenshots/b.png)
{% /gallery %}
```

Les images d'une gallery s'organisent en grille responsive et
s'agrandissent dans la lightbox comme toute image.

## Les flux

Chaque section blog sert un flux Atom à `/<section>/feed.xml`
(par langue aussi : `/de/blog/feed.xml`). Définissez `PUBLIC_SITE_URL`
pour que les entrées portent des liens absolus. Les pages du blog
annoncent le flux via un `<link rel="alternate">`, et le `h1` de l'index
du blog porte un bouton de copie de l'URL du flux à côté du bouton
habituel de copie du lien de la page.

{% callout type="info" title="Plusieurs blogs par site" %}
`blog: true` est par section : un site de documentation peut porter à la
fois un blog, un changelog et un flux d'avis de sécurité, chacun
indépendant.
{% /callout %}
