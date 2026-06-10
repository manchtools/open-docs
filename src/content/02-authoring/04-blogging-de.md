---
title: Blogging
description: "Machen Sie jeden Abschnitt mit blog: true zum Blog – datierte Beiträge, eine generierte Auflistung, Autoren, Tags und ein Atom-Feed, direkt neben Ihrer Dokumentation."
---

# Blogging

Jeder Abschnitt kann ein Blog sein. Setzen Sie `blog: true` in der
`index.md` des Abschnitts, und seine Seiten werden zu **Beiträgen**:
nach Datum absteigend sortiert, automatisch auf der Abschnittsseite
aufgelistet, mit Neuere/Ältere-Navigation, Tag-Seiten und einem
Atom-Feed. Dokumentation und Blogs leben Seite an Seite in einem
Inhaltsbaum – das [Changelog](/de/changelog) auf dieser Website ist
genau so ein Abschnitt.

```markdown
---
blog: true        # in blog/index.md
---
```

## Beiträge

Ein Beitrag ist eine gewöhnliche Markdown-Seite mit einem Datum:

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/paul
tags: release, open-source
cover: screenshots/launch.png
description: How we launched, and what comes next.
---
```

| Schlüssel | Erforderlich | Wirkung |
|---|---|---|
| `date` | ja | `YYYY-MM-DD`. Sortierschlüssel und angezeigtes Datum (lokalisiert). Ein fehlendes oder fehlerhaftes Datum lässt die Validierung beim Start fehlschlagen. |
| `author` | nein | Ein Anzeigename oder ein websiteabsoluter Pfad zu einer [Autorenseite](#autoren-sind-seiten). |
| `tags` | nein | Kommagetrennt. Werden als Chips angezeigt und auf `/<section>/tags/<tag>`-Seiten gesammelt. |
| `cover` | nein | Bild unter `static/`. Rendert als Hero in voller Breite auf dem Beitrag, als Vorschaubild in der Auflistung und als Social-Card-Bild des Beitrags. |
| `draft` | nein | `true` liefert den Beitrag nur in der Entwicklung aus – die Produktion schließt ihn überall aus. |

Dateinamen sind frei wählbar (`launch-post.md` → `/blog/launch-post`);
das Datum lebt nur im Frontmatter. Beiträge verwenden ihre eigene
Neuere/Ältere-Navigation und mischen sich nie in die Vor-/Zurück-Kette
der Dokumentation.

## Die Auflistung

Die `index.md` des Abschnitts rendert zuerst ihren eigenen Fließtext und
dann die generierte Beitragsliste – Cover, lokalisiertes Datum,
Lesezeit, Autor, Beschreibung und Tags. Es gibt nichts zu pflegen.

## Autoren sind Seiten

Legen Sie Autoren in einem Ordner `authors/` innerhalb des
Blog-Abschnitts ab. Die Seiten dort sind Profilseiten, keine Beiträge
(kein Datum nötig, werden nie aufgelistet):

```markdown
---
title: Paul Dotterer        # blog/authors/paul.md
avatar: authors/paul.png    # under static/
---

Builds manchtools.
```

Ein `author: /blog/authors/paul` im Beitrag übernimmt den Namen aus dem
`title` dieser Seite, das Bild aus `avatar:` und verlinkt die
Autorenzeile mit der Seite. Ein Pfad, der sich nicht auflösen lässt,
lässt die Validierung fehlschlagen. Ein schlichtes
`author: Paul Dotterer` funktioniert ebenfalls – keine Seite, kein
Avatar, null Einrichtung.

## Hero- & Avatar-Blöcke

Zwei Blöcke, gemacht für Blogs, überall einsetzbar:

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/paul.png" name="Paul Dotterer" description="Builds manchtools." /%}
```

Direkt nach einem Hero platziert, **überlappt das Bild des Avatars die Unterkante des Heros um die halbe Bildhöhe** – der klassische Cover-Foto-Header. Beide rendern für sich allein ganz normal. Ein Beitrag mit `cover:` bekommt den Hero automatisch.

## Quote & Gallery

```markdown
{% quote by="Ada Lovelace" cite="https://example.com" %}
The engine weaves algebraic patterns.
{% /quote %}

{% gallery %}
![first](/screenshots/a.png)
![second](/screenshots/b.png)
{% /gallery %}
```

Galerie-Bilder ordnen sich in einem responsiven Raster an und
vergrößern sich in der Lightbox wie jedes Bild.

## Feeds

Jeder Blog-Abschnitt liefert unter `/<section>/feed.xml` einen Atom-Feed
aus (auch pro Sprache: `/de/blog/feed.xml`). Setzen Sie
`PUBLIC_SITE_URL`, damit die Einträge absolute Links tragen. Blog-Seiten
machen den Feed über ein `<link rel="alternate">` bekannt.

{% callout type="info" title="Mehrere Blogs pro Website" %}
`blog: true` gilt pro Abschnitt: Eine Doku-Website kann gleichzeitig
einen Blog, ein Changelog und einen Advisories-Feed führen, jeweils
unabhängig.
{% /callout %}
