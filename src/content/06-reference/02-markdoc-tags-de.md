---
title: Markdoc-Tags
label: Markdoc-Tags
---

# Markdoc-Tags

Eine Referenz für die benutzerdefinierten Blöcke, die über Markdown
gelegt werden, sowie für die erweiterten Markdown-Elemente. Für die
Verwendung mit Beispielen siehe [Schreiben](/de/authoring).

## Benutzerdefinierte Tags

### callout

```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Attribut | Werte | Default |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | string | _(keiner)_ |

### tabs / tab

````markdown
{% tabs labels="One, Two" initial="One" %}
  {% tab label="One" %} … {% /tab %}
  {% tab label="Two" %} … {% /tab %}
{% /tabs %}
````

| Tag | Attribut | Hinweise |
|---|---|---|
| `tabs` | `labels` | Kommagetrennte Liste aller Tabs, in Reihenfolge. Erforderlich. |
| `tabs` | `initial` | Beim Laden geöffneter Tab. Standard ist der erste. |
| `tab` | `label` | Muss einem Namen in `labels` des Elternelements entsprechen. Erforderlich. |

### screenshot

```markdown
{% screenshot src="ui.png" alt="The UI" caption="…" dark="ui-dark.png"
   variant="frame" width="720px" /%}
```

| Attribut | Erforderlich | Hinweise |
|---|---|---|
| `src` | ja | Datei unter `static/screenshots/`. |
| `alt` | ja | Barrierefreie Beschreibung. |
| `caption` | nein | Beschriftungstext. |
| `dark` | nein | Alternatives Bild für den dunklen Modus. |
| `variant` | nein | `frame` (Default) oder `flat`. |
| `width` | nein | Maximalbreite, z. B. `720px`. |

### steps / step

````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` nimmt ein optionales `title`. Die Nummerierung erfolgt automatisch.

### cards / card

````markdown
{% cards %}
  {% card title="…" href="/path" icon="🚀" %} description {% /card %}
{% /cards %}
````

| Tag | Attribut | Hinweise |
|---|---|---|
| `card` | `title` | Überschrift der Karte. |
| `card` | `href` | Optionaler Link (interner Pfad oder externe URL). |
| `card` | `icon` | Emoji, inline `<svg>` oder ein Pfad unter `static/`. |

### accordions / accordion

````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Tag | Attribut | Hinweise |
|---|---|---|
| `accordion` | `title` | Der Zusammenfassungstext. Natives `<details>`. |
| `accordions` | `exclusive` | Gruppen-Wrapper; `true` (Default) öffnet jeweils eines, `false` erlaubt mehrere. Optional — `accordion` funktioniert auch eigenständig. |

### badge

```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Inline-Pill. `variant`: `default`, `info`, `success`, `warning`, `danger`.

### filetree

```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Stylt eine verschachtelte Markdown-Liste als Verzeichnisbaum (Ordner und
Dateien werden automatisch unterschieden).

### embed

```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Responsives Video-iframe. YouTube-/Vimeo-URLs werden normalisiert, und die
iframe-Allow-List der CSP wird automatisch aus Ihren Embeds abgeleitet.

### code

````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

Fügt einem umzäunten Codeblock eine Dateinamen-Kopfzeile hinzu (Markdoc
verwirft die Fence-Metadaten, deshalb reist der Dateiname auf diesem
Wrapper mit).

### boost

```markdown
{% boost weight=8 %}
This passage is pushed harder in the search index.
{% /boost %}
```

Unsichtbarer Hinweis zur Suchgewichtung. Gibt den Inhalt unverändert
wieder, gewichtet ihn aber in Pagefind. Fließtext hat Gewicht `1` und
Überschriften `10`/`5`/`3`, sodass `weight` (Default `5`) eine zentrale
Passage über gewöhnlichen Fließtext hebt. Verwenden Sie es nur, wenn die
eingebauten Überschriftsgewichte nicht ausreichen, um etwas
hervorzuheben.

### columns / column

Nebeneinanderstehende Spalten, die auf dem Smartphone untereinander
rutschen, gedeckelt auf drei nebeneinander; eine vierte rutscht in die
nächste Zeile. Zwei Spalten füllen 50/50, drei füllen jeweils ein Drittel.

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

### grid

Ein responsives Raster, um Inhalte in anderen Formen als einer einzigen
Spalte von oben nach unten anzuordnen. `cols` (1–3, Default 2) legt die
Spurenzahl auf größeren Bildschirmen fest; Zellen rutschen auf dem
Smartphone auf eine Spalte. Eine Zelle kann mit `{% column span=2 %}`
mehrere Spuren überspannen.

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

### hero

Ein Bild-Header in voller Breite mit optionalem Titel-Overlay. Zieht
sich bündig an den oberen Rand, wenn er der erste Block ist. Das
`cover:`-Frontmatter eines Blog-Beitrags rendert automatisch einen.

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="…" subtitle="…" /%}
```

### avatar

Eine Autorenkarte: rundes Bild, Name, optionale Bio und optionaler Link.
Direkt nach einem `hero` überlappt das Bild die Unterkante des Heros um
die halbe Bildhöhe.

```markdown
{% avatar src="/authors/p.png" name="Paul" description="…" url="…" /%}
```

### quote

Ein hervorgehobenes Zitat mit optionaler Quellenangabe (verlinkt, wenn
`cite` gesetzt ist).

```markdown
{% quote by="Ada Lovelace" cite="https://…" %}Body.{% /quote %}
```

### gallery

Ein responsives Bildraster; jedes Bild vergrößert sich in der Lightbox.

```markdown
{% gallery %}
![a](/img/a.png)
![b](/img/b.png)
{% /gallery %}
```

## Erweitertes Markdown

Diese brauchen keine besondere Syntax. Reines Markdown erhält das
Verhalten automatisch:

| Element | Verhalten |
|---|---|
| Überschriften (`##`+) | Erhalten Anker-IDs, speisen das Inhaltsverzeichnis und zeigen beim Überfahren ein Symbol zum Link-Kopieren. |
| Links | Externe Links öffnen in einem neuen Tab mit sicheren `rel`-Attributen. |
| Code-Fences | Syntaxhervorhebung (Shiki) mit Kopierschaltfläche; `// [!code highlight]`-/`++`-/`--`-Kommentare fügen Zeilenhervorhebung und Diffs hinzu. |
| `mermaid`-Fences | Werden als designte Diagramme gerendert. |

{% callout type="info" title="Attribute spiegeln Komponenten-Props" %}
Die Attribute jedes Tags sind die Props der dahinterstehenden
Svelte-Komponente, sodass die beiden nie auseinanderlaufen. Fügt man
einer Komponente einen Prop hinzu, wird er automatisch zu einem gültigen
Attribut.
{% /callout %}
