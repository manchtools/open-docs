---
title: Steps & Cards
---

# Steps & Cards

## Steps

Führen Sie Leser durch einen geordneten Ablauf. Die Nummern werden
automatisch erzeugt, sodass Sie die Schritte frei umsortieren können.

{% steps %}
{% step title="Abhängigkeiten installieren" %}
Holen Sie sich alles mit dem Paketmanager Ihrer Wahl.

```sh
bun install
```
{% /step %}
{% step title="Eine Seite hinzufügen" %}
Legen Sie eine Markdown-Datei in Ihrem Content-Ordner ab. Route und
Seitenleisten-Eintrag erscheinen von selbst.
{% /step %}
{% step title="Starten" %}
Starten Sie den Dev-Server und öffnen Sie `http://localhost:3000`.
{% /step %}
{% /steps %}

````markdown
{% steps %}
{% step title="Install dependencies" %}
Body Markdown, including code blocks.
{% /step %}
{% step title="Run it" %} … {% /step %}
{% /steps %}
````

## Cards

Link-Kacheln für Übersichten und Landingpages. Jede `card` nimmt einen
optionalen `title`, `href` und `icon` (ein Emoji, ein Inline-`<svg>` oder
ein Pfad unter `static/`).

{% cards %}
{% card title="Schnellstart" href="/de/getting-started/quick-start" icon="🚀" %}
In unter einer Minute zur laufenden Seite.
{% /card %}
{% card title="Theming" href="/de/customizing/theming" icon="🎨" %}
Eine `theme.css` einsetzen und alles umgestalten.
{% /card %}
{% card title="Markdoc" href="https://markdoc.dev" icon="🧩" %}
Das Tag-System, auf dem diese Blöcke aufbauen.
{% /card %}
{% card title="Verschachtelung" href="/de/navigation/folder-derived-nav" icon="🗂️" %}
Ordner werden zu einklappbaren Abschnitten der Seitenleiste.
{% /card %}
{% /cards %}

````markdown
{% cards %}
{% card title="Quick start" href="/getting-started/quick-start" icon="🚀" %}
Get a running site in under a minute.
{% /card %}
{% /cards %}
````
