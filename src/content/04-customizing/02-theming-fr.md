---
title: Thématisation
---

# Thématisation

Placez un **`theme.css`** à la racine de votre contenu et open-docs le
charge après sa propre feuille de style, de sorte que vos règles
l'emportent toujours. Vous n'avez pas besoin de forker le projet ni de
reconstruire l'image.

{% filetree %}
- content/
  - index.md
  - guides/
    - install.md
  - theme.css — vos surcharges
{% /filetree %}

Sous Docker, le fichier est récupéré depuis votre montage de contenu ; il
n'y a rien de plus à configurer.

## Deux couches à surcharger

### Jetons de design (recommandé)

Le site repose sur un ensemble de propriétés CSS personnalisées. Changez-en
quelques-unes et le reste de l'interface (navigation, boutons, texte,
recherche) se rethématise pour s'accorder, en mode clair comme en mode
sombre.

{% code title="theme.css" %}
```css
:root {
  --primary: oklch(0.55 0.21 264);   /* brand accent */
  --radius: 0.5rem;                  /* corner rounding */
}
.dark {
  --primary: oklch(0.7 0.16 264);
}
```
{% /code %}

Jetons courants : `--primary`, `--background`, `--foreground`,
`--sidebar`, `--sidebar-accent`, `--muted`, `--border`, `--radius` et
`--font-sans`. Les couleurs utilisent `oklch()` pour s'accorder au thème
fourni, mais toute couleur CSS valide convient.

L'habillage du navigateur mobile (la teinte `<meta name="theme-color">`)
suit `--primary`, et s'accorde donc à votre couleur d'accentuation dans
les deux modes. Il n'y a pas de couleur distincte à définir.

### Classes de composants

Pour les ajustements structurels que les jetons n'atteignent pas, ciblez
directement les classes. Ce fichier se charge en dernier, il l'emporte
donc sur les valeurs par défaut à spécificité égale.

{% code title="theme.css" %}
```css
.prose h1 { letter-spacing: -0.02em; }
.prose a  { text-decoration-thickness: 2px; }
```
{% /code %}

## Mode sombre

Le clair/sombre est piloté par une classe `.dark` activée sur `<html>` par
le commutateur de thème dans la barre supérieure. Placez les surcharges du
mode sombre sous un sélecteur `.dark { … }`, comme ci-dessus. Il n'y a rien
d'autre à brancher.

{% callout type="info" title="Partez de l'exemple" %}
Le dépôt fournit un `theme.example.css` commenté. Copiez-le à la racine de
votre contenu sous le nom `theme.css` et modifiez-le à partir de là.
{% /callout %}
