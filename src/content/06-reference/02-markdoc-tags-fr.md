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

Les images Markdown ordinaires `![]()` sont elles aussi rendues par ce
composant, en variante `flat`.

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
| `accordions` | `exclusive` | Conteneur de groupe ; `true` (défaut) n'en ouvre qu'un à la fois, `false` en autorise plusieurs. Optionnel ; `accordion` fonctionne aussi seul. |

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

### hero

Un en-tête image pleine largeur avec un titre optionnel en surimpression.
Se colle au bord supérieur lorsqu'il est le premier bloc. Le frontmatter
`cover:` d'un article de blog en affiche un automatiquement.

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="…" subtitle="…" /%}
```

### avatar

Une carte d'auteur : image ronde, nom, bio et lien optionnels.
Directement après un `hero`, l'image chevauche le bord inférieur du hero
de la moitié de sa hauteur.

```markdown
{% avatar src="/authors/p.png" name="Paul" description="…" url="…" /%}
```

### quote

Une citation mise en exergue avec une attribution optionnelle (liée
lorsque `cite` est défini).

```markdown
{% quote by="Ada Lovelace" cite="https://…" %}Body.{% /quote %}
```

### gallery

Une grille d'images responsive ; chaque image s'agrandit dans la
lightbox.

```markdown
{% gallery %}
![a](/img/a.png)
![b](/img/b.png)
{% /gallery %}
```

## Markdown enrichi

Ceux-ci ne demandent aucune syntaxe particulière. Le Markdown ordinaire
obtient ce comportement automatiquement :

| Élément | Comportement |
|---|---|
| Titres | Reçoivent des id d'ancre et alimentent la table des matières ; chaque `h1` porte un bouton de copie du lien de la page, et les boutons de copie sont discrètement visibles au repos, plus marqués au survol. |
| Liens | Les liens externes s'ouvrent dans un nouvel onglet avec des attributs `rel` sûrs. |
| Liens relatifs (`./x.md`) | Résolus par rapport au fichier ; les liens de style éditeur continuent donc de fonctionner. |
| Images (`![]()`) | Rendues via le composant screenshot (variante flat) ; les fichiers relatifs au contenu sont servis, et la lightbox les fait défiler comme un carrousel. |
| Listes de tâches (`- [ ]`) | Rendues sous forme de cases à cocher. |
| Notes de bas de page (`[^1]`) | Liens numérotés en exposant, avec leurs définitions regroupées en fin de page. |
| Blocs de code | Coloration syntaxique (Shiki) avec un bouton de copie ; les commentaires `// [!code highlight]` / `++` / `--` ajoutent la mise en surbrillance de lignes et les diffs. |
| Blocs `mermaid` | Rendus sous forme de diagrammes thématisés. |

Le HTML en ligne n'est jamais rendu, et les URL nues restent du texte
brut.

{% callout type="info" title="Les attributs reflètent les props des composants" %}
Les attributs de chaque balise sont les props du composant Svelte qui se
trouve derrière, si bien que les deux ne divergent jamais. Ajouter une
prop à un composant en fait automatiquement un attribut valide.
{% /callout %}
