---
title: Theming
---

# Theming

Drop a **`theme.css`** into your content root and open-docs loads it
automatically — after its own stylesheet, so your rules always win. No
fork, no rebuild of the image.

{% filetree %}
- content/
  - index.md
  - guides/
    - install.md
  - theme.css — your overrides
{% /filetree %}

In Docker the file rides along with your content mount; there is
nothing extra to configure.

## Two layers to override

### Design tokens (recommended)

The site is built on a set of CSS custom properties. Change a few and
the whole UI — nav, buttons, prose, search — re-themes coherently, in
both light and dark mode.

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

Common tokens: `--primary`, `--background`, `--foreground`,
`--sidebar`, `--sidebar-accent`, `--muted`, `--border`, `--radius`,
and `--font-sans`. Colors use `oklch()` to match the stock theme, but
any valid CSS color works.

The mobile browser chrome (the `<meta name="theme-color">` tint) tracks
`--primary` automatically, so it matches your accent in both modes —
there is no separate colour to set.

### Component classes

For structural tweaks the tokens do not reach, target classes directly
— this file loads last, so it beats the defaults at equal specificity.

{% code title="theme.css" %}
```css
.prose h1 { letter-spacing: -0.02em; }
.prose a  { text-decoration-thickness: 2px; }
```
{% /code %}

## Dark mode

Light/dark is driven by a `.dark` class toggled on `<html>` by the
theme switch in the top bar. Put dark overrides under a `.dark { … }`
selector, as above — there is nothing else to wire up.

{% callout type="info" title="Start from the example" %}
The repository ships a fully commented `theme.example.css`. Copy it to
your content root as `theme.css` and edit from there.
{% /callout %}
