---
title: Balises Markdoc
label: Balises Markdoc
---

# Balises Markdoc

Une référence des blocs personnalisés ajoutés par-dessus Markdown, ainsi
que des éléments Markdown enrichis. Pour l'utilisation avec des exemples,
voir [Rédaction](/fr/authoring).

## Balises personnalisées

### callout

```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Attribut | Valeurs | Défaut |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | chaîne | _(aucun)_ |

### tabs / tab

````markdown
{% tabs labels="One, Two" initial="One" %}
  {% tab label="One" %} … {% /tab %}
  {% tab label="Two" %} … {% /tab %}
{% /tabs %}
````

| Balise | Attribut | Notes |
|---|---|---|
| `tabs` | `labels` | Liste séparée par des virgules de tous les onglets, dans l'ordre. Obligatoire. |
| `tabs` | `initial` | Onglet ouvert au chargement. Par défaut le premier. |
| `tab` | `label` | Doit correspondre à un nom dans le `labels` du parent. Obligatoire. |

### screenshot

```markdown
{% screenshot src="ui.png" alt="The UI" caption="…" dark="ui-dark.png"
   variant="frame" width="720px" /%}
```

| Attribut | Obligatoire | Notes |
|---|---|---|
| `src` | oui | Fichier sous `static/screenshots/`. |
| `alt` | oui | Description accessible. |
| `caption` | non | Texte de la légende. |
| `dark` | non | Image alternative pour le mode sombre. |
| `variant` | non | `frame` (défaut) ou `flat`. |
| `width` | non | Largeur maximale, par ex. `720px`. |

### steps / step

````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` accepte un `title` optionnel. La numérotation est automatique.

### cards / card

````markdown
{% cards %}
  {% card title="…" href="/path" icon="🚀" %} description {% /card %}
{% /cards %}
````

| Balise | Attribut | Notes |
|---|---|---|
| `card` | `title` | Titre de la carte. |
| `card` | `href` | Lien optionnel (chemin interne ou URL externe). |
| `card` | `icon` | Emoji, `<svg>` en ligne, ou un chemin sous `static/`. |

### accordions / accordion

````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Balise | Attribut | Notes |
|---|---|---|
| `accordion` | `title` | Le texte du résumé. `<details>` natif. |
| `accordions` | `exclusive` | Conteneur de groupe ; `true` (défaut) n'en ouvre qu'un à la fois, `false` en autorise plusieurs. Optionnel — `accordion` fonctionne aussi seul. |

### badge

```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Pastille en ligne. `variant` : `default`, `info`, `success`, `warning`, `danger`.

### filetree

```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Met en forme une liste Markdown imbriquée en arborescence de répertoires
(dossiers et fichiers sont détectés automatiquement).

### embed

```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Iframe vidéo responsive. Les URL YouTube/Vimeo sont normalisées, et la
liste d'autorisation CSP des iframes est dérivée automatiquement de vos
embeds.

### code

````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

Ajoute un en-tête de nom de fichier à un bloc de code délimité (Markdoc
supprime les métadonnées du fence, donc le nom de fichier passe par ce
wrapper).

### boost

```markdown
{% boost weight=8 %}
This passage is pushed harder in the search index.
{% /boost %}
```

Indication de classement de recherche invisible. Rend le contenu sans
le modifier, mais le pondère dans Pagefind. Le corps de texte a un poids
de `1` et les titres `10`/`5`/`3`, donc `weight` (défaut `5`) fait
remonter un passage clé au-dessus du texte ordinaire. Ne l'utilisez que
lorsque les poids intégrés des titres ne suffisent pas à faire ressortir
un élément.

### columns / column

Colonnes côte à côte qui s'empilent sur mobile, limitées à trois de front ;
une quatrième passe à la ligne suivante. Deux colonnes occupent 50/50,
trois se partagent en tiers.

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

### grid

Une grille responsive pour disposer le contenu autrement que dans une
seule colonne de haut en bas. `cols` (1–3, défaut 2) définit le nombre de
pistes sur les écrans plus larges ; les cellules s'empilent en une seule
colonne sur mobile. Une cellule peut s'étendre sur plusieurs pistes avec
`{% column span=2 %}`.

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

## Markdown enrichi

Ceux-ci ne demandent aucune syntaxe particulière. Le Markdown ordinaire
obtient ce comportement automatiquement :

| Élément | Comportement |
|---|---|
| Titres (`##`+) | Reçoivent des id d'ancre, alimentent la table des matières et affichent une icône de copie de lien au survol. |
| Liens | Les liens externes s'ouvrent dans un nouvel onglet avec des attributs `rel` sûrs. |
| Blocs de code | Coloration syntaxique (Shiki) avec un bouton de copie ; les commentaires `// [!code highlight]` / `++` / `--` ajoutent la mise en surbrillance de lignes et les diffs. |
| Blocs `mermaid` | Rendus sous forme de diagrammes thématisés. |

{% callout type="info" title="Les attributs reflètent les props des composants" %}
Les attributs de chaque balise sont les props du composant Svelte qui se
trouve derrière, si bien que les deux ne divergent jamais. Ajouter une
prop à un composant en fait automatiquement un attribut valide.
{% /callout %}
