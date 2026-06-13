---
title: Variables d'environnement
label: Environnement
---

# Variables d'environnement

Chaque variable est lue à l'exécution, au démarrage du conteneur (seule
`BASE_PATH` est compilée). Avec Docker, définissez-les avec `-e` sur
`docker run` ; depuis les sources, définissez-les dans votre shell ou
dans un fichier `.env`.

## Habillage du site

<!-- docref: begin src=src/lib/server/site.ts#siteConfig:c0130420 -->

| Variable | Défaut | Effet |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Texte de la marque dans la barre supérieure. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Sous-titre à côté de la marque. Vide pour le masquer. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Chemin du logo sous `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Titre du navigateur et `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _texte générique_ | Métadonnées par défaut et `og:description`. |
| `PUBLIC_SITE_URL` | _(vide)_ | URL de base complète, par ex. `https://docs.example.com`. **À définir sur chaque déploiement de production :** active les URL canoniques, `sitemap.xml`, `robots.txt`, `llms.txt` et les liens absolus dans les **flux Atom** du blog ; sans elle, tout cela reste relatif et le serveur avertit au démarrage. Voir [SEO et recherche IA](/fr/customizing/seo). |
| `PUBLIC_REPO_URL` | _(vide)_ | Affiche un lien GitHub dans la navigation et le pied de page lorsqu'elle est définie. |

<!-- docref: end -->

La couleur `theme-color` du navigateur mobile (la teinte de l'habillage)
ne se définit pas ici. Elle suit automatiquement votre jeton `--primary`,
en mode clair comme en mode sombre. Voir [Thèmes](/fr/customizing/theming).

## Langue par défaut

<!-- docref: begin src=src/lib/server/store-instance.ts#@default-lang:f15bbd57 -->
| Variable | Défaut | Effet |
|---|---|---|
| `PUBLIC_DEFAULT_LANG` | `en` | Langue par défaut pour les URL sans préfixe. Voir [Multilingue](/fr/authoring/multi-language). |
<!-- docref: end -->

## Jetons de contenu

<!-- docref: begin src=scripts/tokens.js#buildTokenMap:27895886 -->
| Variable | Effet |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Expose `{{<NAME>}}` comme placeholder dans le texte, substitué quand le contenu est analysé au démarrage. Voir [Jetons de contenu](/fr/customizing/content-tokens). |
<!-- docref: end -->

## Déploiement

<!-- docref: begin src=svelte.config.js#@base-path:7d3ca0de -->
| Variable | Défaut | Effet |
|---|---|---|
| `BASE_PATH` | _(vide)_ | Préfixe de déploiement sous un sous-chemin, par ex. `/docs`. Le seul réglage à la compilation : le modifier reconstruit le shell de l'app au démarrage. |
<!-- docref: end -->

<!-- docref: begin src=scripts/docker-entrypoint.sh#@port:c28baa83 -->
| Variable | Défaut | Effet |
|---|---|---|
| `PORT` | `3000` | Port sur lequel le serveur écoute (conteneur). |
<!-- docref: end -->

## Montages du conteneur

Celles-ci ne s'appliquent qu'à l'image Docker et orientent l'entrypoint
vers d'autres répertoires sources. La plupart des utilisateurs n'y
touchent jamais.

<!-- docref: begin src=src/lib/server/store-instance.ts#contentDir:9be957b8 -->
| Variable | Défaut | Effet |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Répertoire copié dans `src/content/`. |
<!-- docref: end -->

<!-- docref: begin src=src/lib/server/store-instance.ts#@static-dir:14dedbae -->
| Variable | Défaut | Effet |
|---|---|---|
| `OPEN_DOCS_STATIC` | `/static` | Répertoire fusionné dans `static/`. |
<!-- docref: end -->

{% callout type="info" title="PUBLIC_ n'est pas un préfixe de secret" %}
Les valeurs `PUBLIC_*` sont livrées au navigateur et visibles
par quiconque consulte le site. N'y placez jamais de secrets.
{% /callout %}
