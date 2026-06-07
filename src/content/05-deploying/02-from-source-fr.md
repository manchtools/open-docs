---
title: Depuis les sources
---

# Depuis les sources

Pour rédiger en local ou vous auto-héberger sans Docker, lancez open-docs
directement. [Bun](https://bun.sh) est le gestionnaire de paquets et
l'environnement d'exécution.

## Développer

```sh
bun install
bun run dev
```

Placez vos fichiers `.md` / `.markdoc` dans `src/content/` et le serveur
de développement les recharge à chaud à l'enregistrement. Définissez
n'importe quelle variable `PUBLIC_*` en ligne pour prévisualiser
l'image de marque :

```sh
PUBLIC_BRAND_NAME="My Project" bun run dev
```

## Builder et prévisualiser

```sh
bun run build      # production build → ./build/
bun run preview    # serve the built site
```

Le build pré-rend chaque page en HTML statique, puis exécute
[Pagefind](https://pagefind.app) sur la sortie pour produire l'index de
recherche.

## Cibles Make

Un `Makefile` enveloppe les commandes courantes :

| Commande | Effet |
|---|---|
| `make install` | Installe les dépendances. |
| `make dev` | Serveur de développement avec rechargement à chaud. |
| `make check` | Vérification de types avec `svelte-check`. |
| `make build` | Build de production dans `./build/`. |
| `make preview` | Sert le build de production. |
| `make docker` | Construit l'image de conteneur en local. |

## Héberger la sortie

Le build produit un site statique accompagné d'un petit serveur Bun.
Comme le HTML est pré-rendu, il s'héberge aussi sur des plateformes
statiques ou CDN : pointez votre hébergeur vers la sortie du build et
servez-la comme n'importe quel site statique.
