---
title: Recherche
---

# Recherche

Chaque site open-docs est livré avec une **recherche plein texte**, propulsée
par [Pagefind](https://pagefind.app). L'index est construit à partir de vos
pages peu après le démarrage du serveur ; les pages sont servies immédiatement
et la recherche arrive quelques instants plus tard. Il est servi sous forme de
fichiers statiques ; il n'y a donc pas de serveur de recherche et la recherche
continue de fonctionner hors ligne. Ouvrez-la depuis le champ de la barre supérieure, ou avec
**⌘K / Ctrl&nbsp;K**.

## Ce qui est indexé

Seul le **corps de chaque page** est indexé. L'habillage qui l'entoure est
laissé de côté pour ne pas polluer les résultats :

- la barre latérale, la barre supérieure et le pied de page ;
- les liens **précédent / suivant**, qui répètent les titres des pages
  voisines ;
- la table des matières de la page ;
- l'espace réservé « Rendering diagram… » des blocs Mermaid.

## Comment les résultats sont classés

<!-- docref: begin src=src/lib/components/search.svelte#@ranking:a5413ce0,src/lib/markdoc/components/Heading.svelte:43feb92a -->

open-docs règle Pagefind pour la documentation par défaut ; il n'y a rien à
configurer :

- **Les titres priment sur le corps du texte.** Un terme dans le titre ou un
  intertitre d'une page compte davantage que le même mot dans un paragraphe,
  de sorte que la page la plus pertinente ressort en premier (les titres
  pèsent le plus, puis les `##`, puis les `###`).
- **Les correspondances exactes sont privilégiées.** Les correspondances plus
  proches de ce que vous avez saisi se classent au-dessus des correspondances
  floues ou partielles, car les recherches dans la documentation sont
  généralement précises.
- **Les pages longues ne sont pas pénalisées.** Une page complète ne perd pas
  face à une ébauche qui mentionne le terme une seule fois.

Si vous forkez open-docs, ces réglages se trouvent dans
`src/lib/components/search.svelte`.

<!-- docref: end -->

## Remonter un passage

<!-- docref: begin src=src/lib/markdoc/components/Boost.svelte#@props:b07730c2 -->

Lorsque la pondération des titres ne suffit pas, par exemple pour une
définition clé située au milieu d'une longue page, encadrez-la dans un bloc
`{% boost %}` pour lui donner plus de poids dans l'index. Le rendu reste
inchangé et seule la recherche est affectée.

<!-- docref: end -->

```markdown
{% boost weight=8 %}
The container indexes your content at start, so one image serves any docset.
{% /boost %}
```

Voir la [référence des balises Markdoc](/fr/reference/markdoc-tags) pour
l'échelle de pondération.
