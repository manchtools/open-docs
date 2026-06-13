---
title: Markdoc-Tags
label: Markdoc-Tags
---

# Markdoc-Tags

<!-- docref: begin src=src/lib/markdoc/tags.svelte:7c5c0d6c -->

Eine Referenz für die benutzerdefinierten Blöcke, die über Markdown
gelegt werden, sowie für die erweiterten Markdown-Elemente. Für die
Verwendung mit Beispielen siehe [Schreiben](/de/authoring).

<!-- docref: end -->

## Benutzerdefinierte Tags

### callout

<!-- docref: begin src=src/lib/markdoc/components/Callout.svelte#@props:04ebd609 -->

```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Attribut | Werte | Default |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | string | _(keiner)_ |

<!-- docref: end -->

### tabs / tab

<!-- docref: begin src=src/lib/markdoc/components/Tabs.svelte#@props:17c65a4f,src/lib/markdoc/components/Tab.svelte#@props:0ce05808 -->

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

<!-- docref: end -->

### screenshot

<!-- docref: begin src=src/lib/markdoc/components/Screenshot.svelte#@props:f0667444 -->

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

Normale Markdown-Bilder `![]()` werden ebenfalls über diese Komponente
gerendert, in der `flat`-Variante.

<!-- docref: end -->

### steps / step

<!-- docref: begin src=src/lib/markdoc/components/Steps.svelte#@props:26850e43,src/lib/markdoc/components/Step.svelte#@props:ed2ce0a8 -->

````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` nimmt ein optionales `title`. Die Nummerierung erfolgt automatisch.

<!-- docref: end -->

### cards / card

<!-- docref: begin src=src/lib/markdoc/components/Cards.svelte#@props:26850e43,src/lib/markdoc/components/Card.svelte#@props:c82718eb -->

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

<!-- docref: end -->

### accordions / accordion

<!-- docref: begin src=src/lib/markdoc/components/AccordionGroup.svelte#@props:84cfb144,src/lib/markdoc/components/Accordion.svelte#@props:ed2ce0a8 -->

````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Tag | Attribut | Hinweise |
|---|---|---|
| `accordion` | `title` | Der Zusammenfassungstext. Natives `<details>`. |
| `accordions` | `exclusive` | Gruppen-Wrapper; `true` (Default) öffnet jeweils eines, `false` erlaubt mehrere. Optional – `accordion` funktioniert auch eigenständig. |

<!-- docref: end -->

### badge

<!-- docref: begin src=src/lib/markdoc/components/Badge.svelte#@props:69aebe45 -->

```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Inline-Pill. `variant`: `default`, `info`, `success`, `warning`, `danger`.

<!-- docref: end -->

### filetree

<!-- docref: begin src=src/lib/markdoc/components/FileTree.svelte#@props:26850e43 -->

```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Stylt eine verschachtelte Markdown-Liste als Verzeichnisbaum (Ordner und
Dateien werden automatisch unterschieden).

<!-- docref: end -->

### embed

<!-- docref: begin src=src/lib/markdoc/components/Embed.svelte#@props:36691986 -->

```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Responsives Video-iframe. YouTube-/Vimeo-URLs werden normalisiert, und die
iframe-Allow-List der CSP wird automatisch aus Ihren Embeds abgeleitet.

<!-- docref: end -->

### code

<!-- docref: begin src=src/lib/markdoc/components/Code.svelte#@props:ed2ce0a8 -->

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

<!-- docref: end -->

### boost

<!-- docref: begin src=src/lib/markdoc/components/Boost.svelte#@props:b07730c2 -->

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

<!-- docref: end -->

### columns / column

<!-- docref: begin src=src/lib/markdoc/components/Columns.svelte#@props:26850e43,src/lib/markdoc/components/Column.svelte#@props:671be0b5 -->

Nebeneinanderstehende Spalten, die auf dem Smartphone untereinander
rutschen, gedeckelt auf drei nebeneinander; eine vierte rutscht in die
nächste Zeile. Zwei Spalten füllen 50/50, drei füllen jeweils ein Drittel.

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

<!-- docref: end -->

### grid

<!-- docref: begin src=src/lib/markdoc/components/Grid.svelte#@props:7451a1f3,src/lib/markdoc/components/Column.svelte#@props:671be0b5 -->

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

<!-- docref: end -->

### hero

<!-- docref: begin src=src/lib/markdoc/components/Hero.svelte#@props:35a1e113 -->

Ein Bild-Header in voller Breite mit optionalem Titel-Overlay. Zieht
sich bündig an den oberen Rand, wenn er der erste Block ist. Das
`cover:`-Frontmatter eines Blog-Beitrags rendert automatisch einen.

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="…" subtitle="…" /%}
```

<!-- docref: end -->

### avatar

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props:2d0e6d15 -->

Eine Autorenkarte: rundes Bild, Name, optionale Bio und optionaler Link.
Direkt nach einem `hero` überlappt das Bild die Unterkante des Heros um
die halbe Bildhöhe.

```markdown
{% avatar src="/authors/ada.png" name="Ada" description="…" url="…" /%}
```

<!-- docref: end -->

### quote

<!-- docref: begin src=src/lib/markdoc/components/Quote.svelte#@props:df46ce79 -->

Ein hervorgehobenes Zitat mit optionaler Quellenangabe (verlinkt, wenn
`cite` gesetzt ist).

```markdown
{% quote by="Ada Lovelace" cite="https://…" %}Body.{% /quote %}
```

<!-- docref: end -->

### gallery

<!-- docref: begin src=src/lib/markdoc/components/Gallery.svelte#@props:26850e43 -->

Ein responsives Bildraster; jedes Bild vergrößert sich in der Lightbox.

```markdown
{% gallery %}
![a](/img/a.png)
![b](/img/b.png)
{% /gallery %}
```

<!-- docref: end -->

## Erweitertes Markdown

<!-- docref: begin src=src/lib/markdoc/nodes.svelte:52c58f22 -->

Diese brauchen keine besondere Syntax. Reines Markdown erhält das
Verhalten automatisch:

| Element | Verhalten |
|---|---|
| Überschriften | Erhalten Anker-IDs und speisen das Inhaltsverzeichnis; jede `h1` hat eine Schaltfläche zum Kopieren des Seitenlinks, und die Kopierschaltflächen sind im Ruhezustand schwach sichtbar, beim Überfahren kräftiger. |
| Links | Externe Links öffnen in einem neuen Tab mit sicheren `rel`-Attributen. |
| Relative Links (`./x.md`) | Werden relativ zur Datei aufgelöst, sodass Links im Editor-Stil weiter funktionieren. |
| Bilder (`![]()`) | Werden über die Screenshot-Komponente gerendert (`flat`-Variante); Dateien relativ zum Inhalt werden ausgeliefert, und die Lightbox blättert wie ein Karussell durch sie. |
| Aufgabenlisten (`- [ ]`) | Werden als Checkboxen gerendert. |
| Fußnoten (`[^1]`) | Nummerierte hochgestellte Links, deren Definitionen am Seitenende gesammelt werden. |
| Code-Fences | Syntaxhervorhebung (Shiki) mit Kopierschaltfläche; `// [!code highlight]`-/`++`-/`--`-Kommentare fügen Zeilenhervorhebung und Diffs hinzu. |
| `mermaid`-Fences | Werden als designte Diagramme gerendert. |

Inline-HTML wird nie gerendert, und nackte URLs bleiben reiner Text.

{% callout type="info" title="Attribute spiegeln Komponenten-Props" %}
Die Attribute jedes Tags sind die Props der dahinterstehenden
Svelte-Komponente, sodass die beiden nie auseinanderlaufen. Fügt man
einer Komponente einen Prop hinzu, wird er automatisch zu einem gültigen
Attribut.
{% /callout %}

<!-- docref: end -->
