---
title: SEO et recherche par IA
description: Comment open-docs rend le site généré repérable par les moteurs de recherche et lisible par les outils d'IA — métadonnées par page, sitemap.xml, robots.txt et llms.txt.
---

# SEO et recherche par IA

Chaque page est pré-rendue en HTML statique, de sorte que les moteurs de
recherche et les robots d'IA obtiennent le contenu complet sans exécuter de
JavaScript. En plus de cela, open-docs génère des métadonnées par page et les
fichiers de découverte standard.

## Définissez l'URL de votre site

Définissez `PUBLIC_SITE_URL` sur l'URL de base complète où la documentation est
servie, sans barre oblique finale :

```sh
-e PUBLIC_SITE_URL="https://docs.example.com"
```

C'est la seule valeur dont les fichiers de découverte ont besoin. Une fois
définie, chaque page obtient une URL canonique absolue, `sitemap.xml` et
`robots.txt` référencent de vraies adresses, et les liens de `llms.txt` se
résolvent. Si elle est laissée vide, le site fonctionne quand même et les
fichiers se construisent toujours, mais les balises canonique et `og:url` sont
omises et le sitemap se rabat sur des liens limités au chemin.

Si la documentation se trouve sous un sous-chemin (par exemple
`https://example.com/docs`), incluez ce sous-chemin dans `PUBLIC_SITE_URL`.

## Métadonnées par page

Chaque page émet ses propres balises `<title>`, `<meta name="description">`,
lien canonique et cartes Open Graph / Twitter. Les valeurs proviennent du
frontmatter de la page :

```markdown
---
title: Installing the CLI
description: Install the command-line tool on macOS, Linux, and Windows.
---
```

- **Le titre** est le `title` de la page. L'onglet du navigateur et
  `og:title` affichent `<titre de page> · <nom de marque>` ; la page d'accueil
  utilise le titre du site seul.
- **La description** est le `description` du frontmatter. Si vous l'omettez,
  open-docs se rabat sur le premier paragraphe de la page, de sorte que chaque
  page dispose d'une description exploitable même sans en avoir rédigé une à la
  main.

`brandName`, le titre du site et la description par défaut proviennent des
variables d'environnement de [configuration](/fr/customizing/configuration).

## sitemap.xml

`/sitemap.xml` répertorie la page d'accueil ainsi que chaque page de contenu et
page légale. Il est reconstruit à partir de la même arborescence de dossiers que
celle utilisée par la navigation, de sorte qu'ajouter un fichier Markdown
l'ajoute au sitemap sans étape supplémentaire.

## robots.txt

`/robots.txt` autorise tous les robots et les dirige vers le sitemap (lorsque
`PUBLIC_SITE_URL` est défini). Remplacez-le en déposant votre propre
`robots.txt` dans les assets statiques du site.

## llms.txt

`/llms.txt` est un index [llms.txt](https://llmstxt.org) destiné aux assistants
et robots d'IA : le titre du site, un résumé d'une ligne, puis chaque page
groupée par section avec sa description et son lien. Il donne à un modèle la
carte complète de votre documentation dans un seul petit fichier, axé sur les
liens. Comme le sitemap, il est généré à partir de votre contenu et ne se
périme donc jamais.
