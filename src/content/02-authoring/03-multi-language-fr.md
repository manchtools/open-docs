---
title: Multilingue
description: Traduisez les pages en ajoutant un suffixe de langue au nom de fichier. La langue par défaut reste sans préfixe ; les autres reçoivent une URL /<lang>, avec repli vers la langue par défaut.
---

# Multilingue

Traduisez une page en ajoutant un suffixe de langue à son nom de fichier. La
version allemande de `01-introduction.md` est `01-introduction-de.md`. C'est
toute la configuration nécessaire — les langues sont découvertes à partir des
suffixes au moment du build, il n'y a donc aucun fichier de configuration de
langue à maintenir.

Cette page possède elle-même une version allemande
([Inhaltsstruktur](/de/getting-started/content-layout) en est une autre) : le
sélecteur de langue dans la barre supérieure est donc actif sur ce site.

## URL

La **langue par défaut reste sans préfixe** et toutes les autres langues
reçoivent un préfixe `/<lang>` :

| Fichier | URL |
|---|---|
| `getting-started/intro.md` | `/getting-started/intro` |
| `getting-started/intro-de.md` | `/de/getting-started/intro` |

Les liens existants continuent donc de fonctionner, et un site monolingue n'a
aucun préfixe. Le site reste monolingue (et sans préfixe) jusqu'à l'apparition
du premier fichier `-<lang>`.

## Langue par défaut

La langue par défaut est `en`. Changez-la avec `PUBLIC_DEFAULT_LANG` :

```sh
-e PUBLIC_DEFAULT_LANG="de"
```

La langue par défaut est celle à laquelle appartiennent les fichiers sans
suffixe, et celle servie aux URL sans préfixe.

## Repli

L'ensemble des pages est défini par la langue par défaut. Une page non traduite
dans une langue se rabat sur le contenu par défaut au même slug, si bien
qu'aucune langue n'affiche jamais de lien cassé. Vous pouvez traduire aussi peu
ou autant de pages que vous le souhaitez et compléter le reste au fil du temps.

## Ce que vous obtenez

- Un **sélecteur de langue** dans la barre supérieure (affiché uniquement quand
  plus d'une langue existe). Il vous maintient sur la même page lors du changement.
- Une **barre latérale et des liens précédent/suivant localisés** — titres
  traduits là où une traduction existe, titres par défaut sinon.
- Une **recherche par langue.** L'index de recherche est segmenté par langue :
  une recherche depuis une page `/de` renvoie donc des résultats allemands.
- Des **alternatives `hreflang`** et un `sitemap.xml` multilingue, pour que les
  moteurs de recherche servent la bonne langue. Définissez `PUBLIC_SITE_URL`
  pour cela — voir [SEO et recherche IA](/fr/customizing/seo).

## Exemple

```text
content/
  01-getting-started/
    01-intro.md         → /getting-started/intro      (default, e.g. en)
    01-intro-de.md      → /de/getting-started/intro    (German)
    02-install.md       → /getting-started/install     (en only; /de falls back)
```

Le suffixe de langue se place après tout préfixe d'ordre `NN-` et avant
l'extension. Utilisez les codes [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)
(`de`, `fr`, `ja`, …) ; une terminaison de deux lettres qui n'est pas un vrai
code (comme `setup-ci.md`) est traitée comme un nom de fichier ordinaire, pas
comme une langue.

{% callout type="info" title="Ce qui reste dans la langue par défaut" %}
Presque tout est localisé : le contenu des pages, la navigation et
l'habillage de l'interface. L'exception est le **titre et la description du site** : ils proviennent de `PUBLIC_SITE_TITLE` et `PUBLIC_SITE_DESCRIPTION`,
identiques dans toutes les langues.
{% /callout %}
