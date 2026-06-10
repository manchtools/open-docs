---
title: Blocs de blog
label: Blocs de blog
description: Images hero, avatars d'auteur, citations en exergue et galeries d'images — conçus pour les articles, utilisables sur n'importe quelle page.
---

# Blocs de blog

Quatre blocs arrivés avec le [mode blog](/fr/authoring/blogging). Ils
fonctionnent sur n'importe quelle page ; sur les articles, certains
apparaissent aussi automatiquement.

## Hero

Une image pleine largeur, avec en option un titre en surimpression :

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="The landing page" title="Big news" subtitle="Optional line below" /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="La page d'accueil" title="Grande nouvelle" subtitle="Ligne facultative en dessous" /%}

En premier bloc d'une page, il s'aligne au ras du haut. Un article qui
commence par un hero n'a pas besoin de frontmatter `cover:` — l'image de
la liste et de la carte sociale en est dérivée.

## Avatar

Une carte d'auteur. Placée directement après un hero, l'image le
chevauche de moitié — l'en-tête classique avec photo de couverture :

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Paul Dotterer" description="Builds manchtools." /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="Couverture" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Paul Dotterer" description="Développe manchtools." /%}

En version autonome, elle s'affiche avec un espacement normal. Sur les
articles, la signature sous le titre utilise le même composant, alimenté
par le frontmatter `author:`.

## Quote

```markdown
{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}
```

{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
La machine analytique tisse des motifs algébriques comme le métier Jacquard tisse des fleurs et des feuilles.
{% /quote %}

## Gallery

Les images Markdown ordinaires placées dans la balise s'organisent en
grille ; chaque image s'ouvre dans la lightbox, où les boutons fléchés
(ou ← / →) parcourent toutes les images de la page :

```markdown
{% gallery %}
![Light](/screenshots/open-docs-home.png)
![Dark](/screenshots/open-docs-home-dark.png)
![German](/screenshots/open-docs-home-de.png)
{% /gallery %}
```

{% gallery %}
![Clair](/screenshots/open-docs-home.png)
![Sombre](/screenshots/open-docs-home-dark.png)
![Allemand](/screenshots/open-docs-home-de.png)
{% /gallery %}
