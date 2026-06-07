---
title: Variables d'environnement
label: Environnement
---

# Variables d'environnement

Chaque variable est lue au moment du build. Avec Docker, définissez-les
avec `-e` sur `docker run` ; depuis les sources, définissez-les dans votre
shell ou dans un fichier `.env`.

## Habillage du site

| Variable | Défaut | Effet |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Texte de la marque dans la barre supérieure. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Sous-titre à côté de la marque. Vide pour le masquer. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Chemin du logo sous `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Titre du navigateur et `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _texte générique_ | Métadonnées par défaut et `og:description`. |
| `PUBLIC_SITE_URL` | _(vide)_ | URL de base complète, par ex. `https://docs.example.com`. Active les URL canoniques, `sitemap.xml`, `robots.txt` et `llms.txt`. Voir [SEO et recherche IA](/fr/customizing/seo). |
| `PUBLIC_DEFAULT_LANG` | `en` | Langue par défaut pour les URL sans préfixe. Voir [Multilingue](/fr/authoring/multi-language). |
| `PUBLIC_REPO_URL` | _(vide)_ | Affiche un lien GitHub dans la navigation et le pied de page lorsqu'elle est définie. |

La couleur `theme-color` du navigateur mobile (la teinte de l'habillage)
ne se définit pas ici. Elle suit automatiquement votre jeton `--primary`,
en mode clair comme en mode sombre. Voir [Thèmes](/fr/customizing/theming).

## Jetons de contenu

| Variable | Effet |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Expose `{{<NAME>}}` comme placeholder résolu au build dans le texte. Voir [Jetons de contenu](/fr/customizing/content-tokens). |

## Déploiement

| Variable | Défaut | Effet |
|---|---|---|
| `BASE_PATH` | _(vide)_ | Préfixe de déploiement sous un sous-chemin, par ex. `/docs`. |
| `PORT` | `3000` | Port sur lequel le serveur écoute (conteneur). |

## Montages du conteneur

Celles-ci ne s'appliquent qu'à l'image Docker et orientent l'entrypoint
vers d'autres répertoires sources. La plupart des utilisateurs n'y
touchent jamais.

| Variable | Défaut | Effet |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Répertoire copié dans `src/content/`. |
| `OPEN_DOCS_STATIC` | `/static` | Répertoire fusionné dans `static/`. |

{% callout type="info" title="PUBLIC_ n'est pas un préfixe de secret" %}
Les valeurs `PUBLIC_*` sont compilées dans le bundle client et visibles
par quiconque consulte le site. N'y placez jamais de secrets.
{% /callout %}
