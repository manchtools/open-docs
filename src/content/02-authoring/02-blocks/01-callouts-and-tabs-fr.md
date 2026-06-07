---
title: Callouts et onglets
---

# Callouts et onglets

Deux blocs Markdoc couvrent la plupart des besoins au-delà du texte simple :
les **callouts** pour mettre des notes en évidence, et les **onglets** pour
regrouper des instructions alternatives.

## Callouts

```markdown
{% callout type="info" title="Heads up" %}
Body text goes here. Markdown **inside** the callout works too.
{% /callout %}
```

`type` vaut `info`, `warn`, `danger` ou `success`. `title` est facultatif.
Les quatre variantes s'affichent ainsi :

{% callout type="info" title="Information" %}
Utilisez `info` pour les astuces, le contexte et les apartés « bon à savoir ».
{% /callout %}

{% callout type="warn" title="Avertissement" %}
Utilisez `warn` pour les points délicats et les pièges faciles à manquer.
{% /callout %}

{% callout type="danger" title="Danger" %}
Utilisez `danger` pour les actions destructrices et ce qui casse.
{% /callout %}

{% callout type="success" title="Succès" %}
Utilisez `success` pour confirmer un parcours réussi ou une étape terminée.
{% /callout %}

## Onglets

Regroupez des instructions équivalentes (gestionnaires de paquets, systèmes
d'exploitation, langages) pour que le lecteur ne voie que la variante qui
l'intéresse.

````markdown
{% tabs labels="apt, dnf, brew" initial="apt" %}
  {% tab label="apt" %}
  ```sh
  sudo apt install ripgrep
  ```
  {% /tab %}
  {% tab label="dnf" %}
  ```sh
  sudo dnf install ripgrep
  ```
  {% /tab %}
{% /tabs %}
````

L'attribut `labels` du parent liste tous les onglets d'emblée (séparés par des
virgules) afin que la rangée d'onglets s'affiche correctement côté serveur,
avant l'hydratation. `initial` désigne l'onglet ouvert au chargement ; omettez-le
pour ouvrir le premier par défaut. Le `label` de chaque `{% tab %}` doit
correspondre à un nom présent dans `labels`.

Exemple en direct :

{% tabs labels="npm, pnpm, bun" initial="bun" %}
{% tab label="npm" %}
```sh
npm install
```
{% /tab %}
{% tab label="pnpm" %}
```sh
pnpm install
```
{% /tab %}
{% tab label="bun" %}
```sh
bun install
```
{% /tab %}
{% /tabs %}
