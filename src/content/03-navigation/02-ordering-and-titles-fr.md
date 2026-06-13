---
title: Ordre et titres
---

# Ordre et titres

L'ordre alphabétique correspond rarement à l'ordre de lecture :
« Advanced » passerait avant « Install ». open-docs vous propose deux
moyens de définir l'ordre, tous deux dérivés du contenu lui-même. Aucun
fichier de navigation externe n'entre en jeu.

## Préfixes numériques

<!-- docref: begin src=src/lib/slug.ts#stripPrefix:b2742e12,src/lib/slug.ts#cleanSlug:9c51ef45,src/lib/slug.ts#titleFromSegment:d11d1ecd -->

Préfixez un fichier ou un dossier avec `NN-` (ou `NN_`, ou `NN.`). Le
numéro fixe la position de tri et est **retiré** de l'URL et du titre.

<!-- docref: end -->

```
content/
  01-get-started/
    01-install.md       → /get-started/install   (sorts 1st)
    02-configure.md     → /get-started/configure  (sorts 2nd)
  02-reference/         → group "Reference" (sorts after "Get started")
```

Ainsi, `01-get-started/02-install.md` produit l'URL
`/get-started/install`, le titre « Install », et se classe en deuxième
position au sein d'un groupe qui se classe lui-même en premier. Les
préfixes fonctionnent aussi sur les dossiers, ce qui permet d'ordonner
les **groupes**.

Les sections marquées `blog: true` font exception : leurs articles sont
triés par `date`, du plus récent au plus ancien, et paginés avec des
liens Plus récents/Plus anciens. Voir [Blog](/fr/authoring/blogging).

## Frontmatter

<!-- docref: begin src=src/lib/server/content-store.ts#orderOf:1c460e59,src/lib/server/content-store.ts#metaTitle:0ac7aeab -->

Pour un contrôle plus fin, définissez des clés dans le frontmatter d'une
page. Le frontmatter l'emporte sur le nom de fichier.

<!-- docref: end -->

```markdown
---
title: Installing the command-line tool
label: Install
order: 2
---
```

| Clé | Effet |
|---|---|
| `title` | Titre complet (barre latérale + précédent/suivant). |
| `label` | Libellé court dans la barre latérale lorsque le titre est long. Alias `sidebar_label`. |
| `order` | Position de tri ; remplace un préfixe numérique. |
| `meta` | `true` exclut la page de la barre latérale et des liens précédent/suivant et l'affiche plutôt dans le pied de page, pour une page légale ou de mentions légales exigée dans certaines régions. |

## Combiner les deux

Un schéma courant : utiliser des préfixes numériques sur les **dossiers**
pour ordonner les groupes, et laisser les fichiers se trier selon leurs
propres préfixes. Ne recourez à `label` dans le frontmatter que lorsqu'un
titre est trop long pour la barre latérale.

{% callout type="success" title="Ce site fait exactement cela" %}
Chaque groupe que vous voyez dans la barre latérale est un dossier préfixé
par `NN-`, et chaque **titre de groupe est le lien vers le fichier `index.md` de cette section**. Cliquez sur « Authoring » pour arriver sur
sa page d'aperçu.
{% /callout %}
