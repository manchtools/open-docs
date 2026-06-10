---
title: Weitere Blöcke
---

# Weitere Blöcke

## Akkordeon

Einklappbare Aufklappbereiche für FAQs und optionale Details, mit Animation
und Tastaturunterstützung. Fassen Sie mehrere in `{% accordions %}` zusammen,
um eine Gruppe zu bilden, bei der das Öffnen eines Eintrags die anderen
schließt, ähnlich wie Tabs. Das ist die Voreinstellung; mit `exclusive=false`
können mehrere gleichzeitig offen bleiben.

{% accordions %}
{% accordion title="Braucht open-docs eine Datenbank?" %}
Nein. Die Seiten werden direkt aus Ihrem Markdown gerendert; es gibt nichts zu installieren oder zu verwalten.
{% /accordion %}
{% accordion title="Kann ich es selbst hosten?" %}
Ja. Betreiben Sie den Container, wo immer Sie wollen, oder bauen Sie aus
dem Quellcode und starten den mitgelieferten Server.
{% /accordion %}
{% accordion title="Werden verschachtelte Ordner unterstützt?" %}
Bis zu drei Ebenen tief. Siehe
[ordnerbasierte Navigation](/de/navigation/folder-derived-nav).
{% /accordion %}
{% /accordions %}

```markdown
{% accordions %}
{% accordion title="Your question?" %}
The answer, in Markdown.
{% /accordion %}
{% accordion title="Another question?" %}
Opening this one closes the first.
{% /accordion %}
{% /accordions %}
```

## Badge

Kleine Inline-Status-Pillen für Überschriften und Listeneinträge.

- Stabiles Feature
- Echtzeit-Synchronisierung {% badge variant="success" %}Neu{% /badge %}
- Webhooks {% badge variant="warning" %}Beta{% /badge %}
- XML-Export {% badge variant="danger" %}Veraltet{% /badge %}

```markdown
Webhooks {% badge variant="warning" %}Beta{% /badge %}
```

Varianten: `default`, `info`, `success`, `warning`, `danger`.

## Dateibaum

Rendert einen Verzeichnisbaum aus einer verschachtelten Liste. Ordner
(Einträge, die eine Liste verschachteln) und Dateien werden automatisch
erkannt, ganz ohne spezielles Markup.

{% filetree %}
- content/
  - index.md
  - getting-started/
    - introduction.md
    - quick-start.md
  - theme.css
- static/
  - favicon.svg
{% /filetree %}

````markdown
{% filetree %}
- content/
  - index.md
  - getting-started/
    - quick-start.md
{% /filetree %}
````

## Embed

Betten Sie ein Video ein. YouTube- und Vimeo-Links werden automatisch in ihre
datenschutzfreundliche Embed-Form überführt.

{% embed src="https://youtu.be/aqz-KE-bpKQ" title="Big Buck Bunny" /%}

```markdown
{% embed src="https://youtu.be/VIDEO_ID" title="A short clip" /%}
```

Die CSP-Allow-List für iframes wird automatisch aus den `{% embed %}`-Blöcken
in Ihrem Content abgeleitet (einschließlich URLs, die über ein `{{TOKEN}}`
übergeben werden), sodass nichts konfiguriert werden muss.

## Spalten

Stellen Sie Inhalte nebeneinander dar. Spalten sind auf maximal drei pro Reihe
begrenzt und stapeln sich auf Mobilgeräten: zwei füllen 50/50, drei jeweils ein
Drittel, eine vierte rückt in die nächste Reihe.

{% columns %}
{% column %}
{% callout type="info" title="Links" %}Erste Inhaltsspalte.{% /callout %}
{% /column %}
{% column %}
{% callout type="success" title="Rechts" %}Zweite Spalte.{% /callout %}
{% /column %}
{% /columns %}

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

## Grid

Für Layouts jenseits einer einzelnen Spalte gibt es ein responsives Grid.
`cols` (1–3, Standard 2) legt die Spaltenanzahl auf größeren Bildschirmen
fest; Zellen stapeln sich auf Mobilgeräten. Eine Zelle kann mit
`{% column span=2 %}` mehrere Spuren überspannen.

{% grid cols=3 %}
{% column %}
{% callout type="info" title="a" %}Eine Zelle.{% /callout %}
{% /column %}
{% column span=2 %}
{% callout type="success" title="b — überspannt 2" %}Eine breitere Zelle.{% /callout %}
{% /column %}
{% /grid %}

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````
