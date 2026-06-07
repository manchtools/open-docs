---
title: Étapes et cartes
---

# Étapes et cartes

## Étapes

Guidez le lecteur à travers une procédure ordonnée. Les numéros sont générés
automatiquement, vous pouvez donc réordonner les étapes librement.

{% steps %}
{% step title="Installer les dépendances" %}
Récupérez tout avec le gestionnaire de paquets de votre choix.

```sh
bun install
```
{% /step %}
{% step title="Ajouter une page" %}
Déposez un fichier Markdown dans votre dossier de contenu. La route et l'entrée
de la barre latérale apparaissent d'elles-mêmes.
{% /step %}
{% step title="Lancer" %}
Démarrez le serveur de développement et ouvrez `http://localhost:5173`.
{% /step %}
{% /steps %}

````markdown
{% steps %}
{% step title="Install dependencies" %}
Body Markdown, including code blocks.
{% /step %}
{% step title="Run it" %} … {% /step %}
{% /steps %}
````

## Cartes

Tuiles de liens pour les vues d'ensemble et les pages d'accueil. Chaque `card`
accepte un `title`, un `href` et un `icon` facultatifs (un emoji, un `<svg>`
en ligne, ou un chemin sous `static/`).

{% cards %}
{% card title="Démarrage rapide" href="/fr/getting-started/quick-start" icon="🚀" %}
Obtenez un site fonctionnel en moins d'une minute.
{% /card %}
{% card title="Thèmes" href="/fr/customizing/theming" icon="🎨" %}
Ajoutez un `theme.css` pour tout restyler.
{% /card %}
{% card title="Markdoc" href="https://markdoc.dev" icon="🧩" %}
Le système de balises sur lequel reposent ces blocs.
{% /card %}
{% card title="Imbrication" href="/fr/navigation/folder-derived-nav" icon="🗂️" %}
Les dossiers deviennent des sections repliables de la barre latérale.
{% /card %}
{% /cards %}

````markdown
{% cards %}
{% card title="Quick start" href="/getting-started/quick-start" icon="🚀" %}
Get a running site in under a minute.
{% /card %}
{% /cards %}
````
