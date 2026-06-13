---
title: Theming
---

# Theming

<!-- docref: begin src=src/routes/theme.css/+server.ts#GET:5578a8e6 -->

Legen Sie eine **`theme.css`** in Ihr Inhaltsverzeichnis, und open-docs lädt
sie nach seinem eigenen Stylesheet, sodass Ihre Regeln immer gewinnen. Sie
müssen weder das Projekt forken noch das Image neu bauen.

{% filetree %}
- content/
  - index.md
  - guides/
    - install.md
  - theme.css — Ihre Überschreibungen
{% /filetree %}

In Docker wird die Datei aus Ihrem Inhalts-Mount aufgegriffen; es gibt nichts
weiter zu konfigurieren.

<!-- docref: end -->

## Zwei Ebenen zum Überschreiben

### Design-Tokens (empfohlen)

Die Website baut auf einer Reihe von CSS-Custom-Properties auf. Ändern Sie ein
paar davon, und der Rest der Oberfläche (Navigation, Buttons, Fließtext,
Suche) passt sich an, sowohl im hellen als auch im dunklen Modus.

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

<!-- docref: begin src=src/app.css#@design-tokens:e02aec08 -->
Gängige Tokens: `--primary`, `--background`, `--foreground`, `--sidebar`,
`--sidebar-accent`, `--muted`, `--border`, `--radius` und `--font-sans`.
Farben verwenden `oklch()`, um zum Standard-Theme zu passen, aber jede gültige
CSS-Farbe funktioniert.
<!-- docref: end -->

<!-- docref: begin src=src/lib/components/theme-color.svelte:5dd34a8d -->
Der Browser-Rahmen auf Mobilgeräten (die Tönung über `<meta
name="theme-color">`) folgt `--primary`, sodass er in beiden Modi zu Ihrer
Akzentfarbe passt. Es gibt keine separate Farbe einzustellen.
<!-- docref: end -->

### Komponentenklassen

Für strukturelle Anpassungen, die die Tokens nicht erreichen, sprechen Sie
Klassen direkt an. Diese Datei wird zuletzt geladen, also schlägt sie die
Standardwerte bei gleicher Spezifität.

{% code title="theme.css" %}
```css
.prose h1 { letter-spacing: -0.02em; }
.prose a  { text-decoration-thickness: 2px; }
```
{% /code %}

## Dunkler Modus

<!-- docref: begin src=src/lib/components/theme-toggle.svelte:c9b875a9 -->

Hell/Dunkel wird über eine `.dark`-Klasse gesteuert, die der Theme-Schalter in
der oberen Leiste auf `<html>` umschaltet. Legen Sie Dunkel-Überschreibungen
unter einen `.dark { … }`-Selektor, wie oben. Mehr ist nicht zu verdrahten.

<!-- docref: end -->

{% callout type="info" title="Vom Beispiel ausgehen" %}
Das Repository liefert eine kommentierte `theme.example.css`. Kopieren Sie sie
als `theme.css` in Ihr Inhaltsverzeichnis und bearbeiten Sie sie von dort aus.
{% /callout %}
