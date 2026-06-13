---
title: Markdown et frontmatter
label: Markdown
---

# Markdown et frontmatter

Rédigez vos pages en Markdown ordinaire. Tous les éléments standard fonctionnent :

- **Les titres** (`#` … `######`). Chacun reçoit un identifiant d'ancre et
  alimente la table des matières en marge à droite.
- **Les listes**, ordonnées et non ordonnées, avec imbrication.
- **Les liens**, internes (`/getting-started/quick-start`) et externes. Les
  liens relatifs de style éditeur comme `./sibling.md` se résolvent aussi par
  rapport au fichier ; voir
  [Markdown existant](/fr/authoring/bring-existing-markdown). Les liens
  externes s'ouvrent automatiquement dans un nouvel onglet avec des attributs
  `rel` sûrs.
- **Les images** (`![alt](./diagram.png)`), placées à côté de votre Markdown
  ou sous `static/`.
- **Les listes de tâches** (`- [ ]` / `- [x]`) et les
  **notes de bas de page** (`[^1]`).
- **L'emphase**, le `code en ligne`, les citations, les tableaux et les filets
  horizontaux.

## Les titres et la table des matières

<!-- docref: begin src=src/lib/server/markdown.ts#applyHeadingAnchors:a5e8b91f -->

Le premier titre `#` est le titre de la page affiché en haut du contenu. Les
titres `##` et `###` remplissent la table des matières dans la colonne de droite
et deviennent des ancres cliquables, ce qui permet de pointer directement vers
une section.

<!-- docref: end -->

## Frontmatter

<!-- docref: begin src=src/lib/server/content-store.ts#frontmatter:641087be -->

Un bloc YAML optionnel tout en haut d'un fichier contrôle l'apparence de la
page dans la **barre latérale** :

```markdown
---
title: Installing the CLI
label: Install
order: 2
---

# Installing the CLI
```

| Clé | Effet |
|---|---|
| `title` | Titre complet utilisé pour la barre latérale et les liens précédent/suivant. |
| `label` | Libellé de barre latérale plus court, quand le titre est long. Alias : `sidebar_label`. |
| `order` | Position de tri au sein du groupe. Prime sur tout préfixe numérique du nom de fichier. |
| `description` | Méta-description pour les moteurs de recherche et l'index `llms.txt`. À défaut, le premier paragraphe de la page est utilisé. Voir [SEO et recherche IA](/fr/customizing/seo). |

Le fichier `index.md` d'une section comprend une clé de plus, `icon`, qui
définit l'icône de cette section sur la carte de la page d'accueil. Voir
[Icônes de section](/fr/navigation/folder-derived-nav#icones-de-section). Un
`index.md` accepte aussi `blog: true` pour transformer sa section en blog ;
voir [Blog](/fr/authoring/blogging). Les articles de blog ajoutent leurs
propres clés (`date`, `author`, `tags`, `cover`, `draft`), elles aussi
couvertes dans [Blog](/fr/authoring/blogging). Une page `meta: true` reste en
dehors de la barre latérale et des liens précédent/suivant, et figure à la
place dans le pied de page ; voir
[Ordre et titres](/fr/navigation/ordering-and-titles).

Le frontmatter est optionnel. Sans lui, le titre est dérivé du nom de fichier
et les pages sont triées par ordre alphabétique (ou selon leur préfixe
numérique). Voir [Ordre et titres](/fr/navigation/ordering-and-titles) pour le
modèle de tri complet.

{% callout type="warn" title="Gardez un frontmatter scalaire" %}
Seules les lignes simples `clé : valeur` sont lues pour la navigation. Les
valeurs YAML imbriquées ou sous forme de liste sont ignorées pour la barre
latérale.
{% /callout %}

<!-- docref: end -->
