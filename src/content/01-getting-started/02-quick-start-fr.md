---
title: Démarrage rapide
---

# Démarrage rapide

Mettez un site de documentation en ligne en moins d'une minute.

{% tabs labels="Docker, Depuis les sources" initial="Docker" %}
{% tab label="Docker" %}

Montez un répertoire de Markdown sur `/content` et ouvrez le port :

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  ghcr.io/manchtools/open-docs:latest
```

Ouvrez `http://localhost:3000`. Le conteneur construit le site au démarrage
avec votre contenu intégré, puis le sert. Lancez-le sans montage et vous
obtenez cette documentation en démonstration en direct.

{% /tab %}
{% tab label="Depuis les sources" %}

```sh
bun install
PUBLIC_BRAND_NAME="My Project" bun run dev
```

Déposez vos fichiers `.md` / `.markdoc` dans `src/content/`. Le serveur de
développement se recharge à chaud à l'enregistrement.

{% /tab %}
{% /tabs %}

{% callout type="info" title="Pas de contenu ? Pas de problème." %}
Sans rien de monté, le conteneur sert la documentation d'open-docs elle-même :
vous pouvez donc parcourir un vrai site avant d'écrire la moindre page.
{% /callout %}

## La version en 30 secondes

{% steps %}
{% step title="Ajoutez du contenu" %}
Créez un dossier avec un ou deux fichiers Markdown.
{% /step %}
{% step title="Pointez open-docs dessus" %}
Montez-le sur `/content` (Docker) ou déposez-le dans `src/content/` (depuis les sources).
{% /step %}
{% step title="Ouvrez le site" %}
La barre latérale, l'index de recherche et les routes sont tous générés pour vous.
{% /step %}
{% /steps %}

## Pour aller plus loin

{% cards %}
{% card title="Organisation du contenu" href="/fr/getting-started/content-layout" icon="🗂️" %}
Comment les fichiers se traduisent en pages et en barre latérale.
{% /card %}
{% card title="Rédaction" href="/fr/authoring" icon="✍️" %}
Markdown, callouts, onglets, code et diagrammes.
{% /card %}
{% card title="Déploiement avec Docker" href="/fr/deploying/docker" icon="🐳" %}
Montages, environnement et notes de production.
{% /card %}
{% /cards %}
