---
title: Autres blocs
---

# Autres blocs

## Accordéon

Affichage repliable pour les FAQ et les détails facultatifs, avec animation et
prise en charge du clavier. Enveloppez-en plusieurs dans `{% accordions %}`
pour former un groupe où l'ouverture de l'un referme les autres, comme des
onglets. C'est le comportement par défaut ; ajoutez `exclusive=false` pour en
laisser plusieurs ouverts à la fois.

{% accordions %}
{% accordion title="open-docs a-t-il besoin d'une base de données ?" %}
Non. Les pages sont rendues directement depuis votre Markdown ; il n'y a rien à installer ni à administrer.
{% /accordion %}
{% accordion title="Puis-je l'héberger moi-même ?" %}
Oui. Exécutez le conteneur n'importe où, ou compilez depuis les sources et
lancez le serveur fourni.
{% /accordion %}
{% accordion title="Prend-il en charge les dossiers imbriqués ?" %}
Jusqu'à trois niveaux de profondeur. Voir la
[navigation dérivée des dossiers](/fr/navigation/folder-derived-nav).
{% /accordion %}
{% /accordions %}

```markdown
{% accordions %}
{% accordion title="Your question?" %}
The answer, in Markdown.
{% /accordion %}
{% accordion title="Another question?" %}
Opening this one closes the first.
{% /accordion %}
{% /accordions %}
```

## Badge

Petites pastilles de statut en ligne pour les titres et les éléments de liste.

- Fonctionnalité stable
- Synchronisation en temps réel {% badge variant="success" %}Nouveau{% /badge %}
- Webhooks {% badge variant="warning" %}Bêta{% /badge %}
- Export XML {% badge variant="danger" %}Déprécié{% /badge %}

```markdown
Webhooks {% badge variant="warning" %}Beta{% /badge %}
```

Variantes : `default`, `info`, `success`, `warning`, `danger`.

## Arborescence de fichiers

Affichez une arborescence de répertoires à partir d'une liste imbriquée. Les
dossiers (les éléments qui imbriquent une liste) et les fichiers sont détectés
pour vous, sans balisage particulier.

{% filetree %}
- content/
  - index.md
  - getting-started/
    - introduction.md
    - quick-start.md
  - theme.css
- static/
  - favicon.svg
{% /filetree %}

````markdown
{% filetree %}
- content/
  - index.md
  - getting-started/
    - quick-start.md
{% /filetree %}
````

## Intégration

Insérez une vidéo. Les liens YouTube et Vimeo sont automatiquement convertis
vers leur forme d'intégration respectueuse de la vie privée.

{% embed src="https://youtu.be/aqz-KE-bpKQ" title="Big Buck Bunny" /%}

```markdown
{% embed src="https://youtu.be/VIDEO_ID" title="A short clip" /%}
```

La liste d'autorisation CSP des iframes est dérivée automatiquement des blocs
`{% embed %}` de votre contenu (y compris les URL fournies via un `{{TOKEN}}`),
il n'y a donc rien à configurer.

## Colonnes

Disposez le contenu côte à côte. Les colonnes sont plafonnées à trois de front
et s'empilent sur mobile : deux remplissent 50/50, trois se partagent en tiers,
une quatrième passe à la ligne.

{% columns %}
{% column %}
{% callout type="info" title="Gauche" %}Première colonne de contenu.{% /callout %}
{% /column %}
{% column %}
{% callout type="success" title="Droite" %}Deuxième colonne.{% /callout %}
{% /column %}
{% /columns %}

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

## Grille

Pour les mises en page au-delà d'une seule colonne, une grille adaptative.
`cols` (1 à 3, 2 par défaut) fixe le nombre de colonnes sur les grands écrans ;
les cellules s'empilent sur mobile. Une cellule peut s'étendre sur plusieurs
pistes avec `{% column span=2 %}`.

{% grid cols=3 %}
{% column %}
{% callout type="info" title="a" %}Une cellule.{% /callout %}
{% /column %}
{% column span=2 %}
{% callout type="success" title="b — s'étend sur 2" %}Une cellule plus large.{% /callout %}
{% /column %}
{% /grid %}

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

## Listes de tâches

Pas une balise : la syntaxe GFM ordinaire s'affiche sous forme de cases à cocher.

```markdown
- [x] write the docs
- [ ] translate them
- [ ] ship the release
```

- [x] rédiger la documentation
- [ ] préparer les traductions
- [ ] publier la version

## Notes de bas de page

Du Markdown ordinaire là aussi : un `[^ref]` devient un lien numéroté en exposant, et la définition apparaît en fin de page.

```markdown
The engine was proposed in 1837[^babbage].

[^babbage]: By Charles Babbage, with notes by Ada Lovelace.
```

La machine fut proposée en 1837[^babbage].

[^babbage]: Par Charles Babbage, avec des notes d'Ada Lovelace.
