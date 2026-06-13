---
title: Configuration
---

# Configuration

Toute la configuration se fait avec des **variables d'environnement**,
lues au démarrage du conteneur — en modifier une demande un redémarrage,
pas une reconstruction. Définissez-les sur la commande `docker run`, dans
un fichier `.env` ou dans votre shell. Rien de tout cela ne nécessite de
modifier le code source.

## Habillage du site

<!-- docref: begin src=src/lib/server/site.ts#siteConfig:c0130420 -->

| Variable | Valeur par défaut | Effet |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Texte de la marque dans la barre supérieure. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Petit sous-titre à côté de la marque. Vide pour le masquer. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Chemin du logo sous `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Titre de l'onglet du navigateur et `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _texte générique_ | Meta + `og:description`. |
| `PUBLIC_REPO_URL` | _(vide)_ | Si définie, affiche un lien GitHub dans la navigation et le pied de page. |

<!-- docref: end -->

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="Acme" \
  -e PUBLIC_BRAND_TAGLINE="handbook" \
  -e PUBLIC_SITE_TITLE="Acme Handbook" \
  -e PUBLIC_REPO_URL="https://github.com/acme/handbook" \
  ghcr.io/manchtools/open-docs:latest
```

Pour la liste complète, y compris les variables propres au déploiement,
voir [Variables d'environnement](/fr/reference/environment-variables).

## Assets statiques

Les favicons, images de cartes sociales et captures d'écran se trouvent
sous `static/` :

{% filetree %}
- static/
  - favicon.svg — utilisé comme logo par défaut
  - favicon-16.png
  - favicon-32.png
  - apple-touch-icon.png
  - og.png — image de carte sociale
  - screenshots/
    - dashboard.png
{% /filetree %}

Seul `favicon.svg` est requis ; les replis PNG et `og.png` sont
optionnels et ignorés s'ils sont absents. Sous Docker, montez votre
répertoire `static/` sur `/static`. Il est **fusionné** avec les valeurs
par défaut de l'image plutôt que de les remplacer, de sorte que remplacer
un fichier laisse les autres en place.

Déposez une variante `-dark` à côté de n'importe quelle icône
(`favicon-32-dark.png`, `apple-touch-icon-dark.png`, …) et l'icône de
l'onglet du navigateur suit automatiquement la bascule du mode sombre du
site.

## Thématisation et jetons

- Pour restyliser le site, ajoutez un `theme.css`. Voir
  [Thématisation](/fr/customizing/theming).
- Pour injecter des valeurs d'environnement dans le texte, utilisez les
  jetons de contenu. Voir
  [Jetons de contenu](/fr/customizing/content-tokens).
