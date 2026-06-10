---
title: Apporter du Markdown existant
label: Markdown existant
description: Ce qui fonctionne quand vous pointez open-docs vers du Markdown écrit pour GitHub ou VSCode, et les limites assumées.
---

# Apporter du Markdown existant

Un dossier de Markdown écrit pour GitHub, VSCode ou un autre générateur
s'affiche sans réécriture. Les conventions sur lesquelles ces outils
s'appuient restent valables :

- **Les liens relatifs.** `[setup](./guides/setup.md)`, `../intro.md` et
  `other.md#section` sont résolus par rapport au fichier qui contient le
  lien, exactement comme votre éditeur les suit. L'extension `.md` et
  les éventuels préfixes `01-` passent par les règles d'URL habituelles.
  Les chemins absolus du site (`/guides/setup`) continuent de
  fonctionner tels quels.
- **`README.md` est la page du dossier.** Quand un dossier n'a pas
  d'`index.md`, son `README.md` joue ce rôle.
- **Les images à côté de votre Markdown.**
  `![diagram](./images/arch.png)` s'affiche sur place et le fichier est
  servi depuis votre dossier de contenu ; inutile de le déplacer vers
  `static/`. Chaque image Markdown, qu'elle soit relative, absolue ou
  une URL web, s'affiche à travers le cadre de capture d'écran dans sa
  variante sobre.
- **Les listes de tâches.** `- [ ]` et `- [x]` s'affichent comme des
  cases à cocher.
- **Les notes de bas de page.** Les références `[^1]` deviennent des
  liens numérotés en exposant, avec les définitions listées en fin de
  page.
- **Les tableaux, le texte barré, les blocs de code, les citations**
  fonctionnent comme du Markdown standard ; les blocs de code reçoivent
  la coloration syntaxique et un bouton de copie.

Tout le reste vient automatiquement : la navigation issue de
l'arborescence des dossiers, la recherche, les ancres de titres et la
table des matières, les fichiers SEO et le mode sombre.

## Des limites assumées

Deux choses restent désactivées à dessein, et non par oubli :

{% callout type="info" title="Le HTML n'est jamais rendu" %}
open-docs affiche du Markdown, pas du HTML. Les balises en ligne comme
`<details>` apparaissent telles que vous les avez tapées. Pour montrer
du balisage en exemple, placez-le dans un bloc de code. Il n'y a ni
liste d'autorisation ni exception ; c'est ce qui garde la politique de
sécurité stricte intacte.
{% /callout %}

{% callout type="info" title="Les URL nues restent du texte" %}
`https://example.com` collé en texte brut n'est pas transformé en lien.
Rendre quelque chose cliquable est une décision de l'auteur : écrivez
`[example](https://example.com)` ou `<https://example.com>`.
{% /callout %}

Les titres Setext (soulignés avec `===` ou `---`) ne reçoivent pas
d'identifiant d'ancre ; utilisez des titres `#`. Les commentaires HTML
(`<!-- … -->`) sont supprimés, de sorte que les notes de relecture
n'atteignent jamais les lecteurs.
