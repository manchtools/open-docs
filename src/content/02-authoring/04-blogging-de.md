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

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

Ein Beitrag ist eine gewöhnliche Markdown-Seite mit einem Datum:

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/ada
tags: release, open-source
description: How we launched, and what comes next.
---
```

| Schlüssel | Erforderlich | Wirkung |
|---|---|---|
| `date` | ja | `YYYY-MM-DD`. Sortierschlüssel und angezeigtes Datum (lokalisiert). Ein fehlendes oder fehlerhaftes Datum lässt die Validierung beim Start fehlschlagen. |
| `author` | nein | Ein Anzeigename oder ein websiteabsoluter Pfad zu einer [Autorenseite](#autoren-sind-seiten). |
| `tags` | nein | Kommagetrennt. Werden als Chips angezeigt und auf `/<section>/tags/<tag>`-Seiten gesammelt. |
| `cover` | nein | Bild unter `static/`. Rendert als Hero in voller Breite auf dem Beitrag, als Vorschaubild in der Auflistung und als Social-Card-Bild des Beitrags. Beiträge, die mit einem `{% hero %}`-Block beginnen, brauchen es nicht – das Bild des Heros wird verwendet. |
| `draft` | nein | `true` liefert den Beitrag nur in der Entwicklung aus – die Produktion schließt ihn überall aus. |

Dateinamen sind frei wählbar (`launch-post.md` → `/blog/launch-post`);
das Datum lebt nur im Frontmatter. Beiträge verwenden ihre eigene
Neuere/Ältere-Navigation und mischen sich nie in die Vor-/Zurück-Kette
der Dokumentation.

<!-- docref: end -->

## Die Auflistung

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

Die `index.md` des Abschnitts rendert zuerst ihren eigenen Fließtext und
dann die generierte Beitragsliste – Cover, lokalisiertes Datum,
Lesezeit, Autor, Beschreibung und Tags. Die Lesezeit ist die Wortzahl
des Beitrags bei 200 Wörtern pro Minute, gerundet, mindestens eine
Minute.

<!-- docref: end -->

## Autoren sind Seiten

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

Legen Sie Autoren in einem Ordner `authors/` innerhalb des
Blog-Abschnitts ab. Die Seiten dort sind Profilseiten, keine Beiträge
(kein Datum nötig, werden nie aufgelistet):

```markdown
---
title: Ada Lovelace        # blog/authors/ada.md
avatar: authors/ada.png    # under static/
---

Builds manchtools.
```

Ein `author: /blog/authors/ada` im Beitrag übernimmt den Namen aus dem
`title` dieser Seite, das Bild aus `avatar:` und verlinkt die
Autorenzeile mit der Seite. Ein Pfad, der sich nicht auflösen lässt,
lässt die Validierung fehlschlagen. Ein schlichtes
`author: Ada Lovelace` funktioniert ebenfalls – keine Seite, kein
Avatar, null Einrichtung.

Dieselbe Referenz funktioniert auch im `{% avatar %}`-Block – ein Autor
wird also einmal angegeben und überall wiederverwendet:

```markdown
{% avatar author="/blog/authors/ada" /%}
```

Name, Bild, Bio (der erste Absatz der Seite) und der Link stammen alle
von der Autorenseite; jedes Attribut, das Sie explizit setzen, gewinnt.
Kurz gesagt: Das `author:`-Frontmatter sind *Metadaten* (Auflistung,
Autorenzeile, Feed), der `{% avatar %}`-Block ist die *visuelle Karte* –
und beide können auf dieselbe Seite zeigen.

<!-- docref: end -->

## Hero- & Avatar-Blöcke

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props:2d0e6d15 -->

Zwei Blöcke, gemacht für Blogs, überall einsetzbar:

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/ada.png" name="Ada Lovelace" description="Builds manchtools." /%}
```

Live, mit den mitgelieferten Demo-Bildern:

{% hero src="/screenshots/open-docs-home.png" alt="Demo-Cover" title="Große Neuigkeiten" subtitle="Der Avatar darunter überlappt zur Hälfte" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Ada Lovelace" description="Entwickelt manchtools." /%}

Direkt nach einem Hero platziert, **überlappt das Bild des Avatars die Unterkante des Heros um die halbe Bildhöhe** – der klassische Cover-Foto-Header. Beide rendern für sich allein ganz normal. Ein Beitrag mit `cover:` bekommt den Hero automatisch.

<!-- docref: end -->

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

<!-- docref: begin src=src/lib/server/feed.ts#buildAtomFeed:2ed9f5ab -->

Jeder Blog-Abschnitt liefert unter `/<section>/feed.xml` einen Atom-Feed
aus (auch pro Sprache: `/de/blog/feed.xml`). Jeder Eintrag trägt neben
der kurzen `<summary>` den **vollständigen Artikeltext** in
`<content type="html">`, sodass Syndizierungsplattformen (dev.to/Forem,
Medium) und Feed-Reader den ganzen Artikel übernehmen – samt Codeblöcken
und Bildern – und nicht nur einen einzeiligen Stub.

Der Text wird über ein eigenes **Feed-Profil** aus derselben
Markdoc-Quelle wie die Seite gerendert (nicht aus dem Seiten-HTML
extrahiert) und ist daher **leserrein**: schlichte Überschriften (ohne
Kopierlink-Anker oder Symbole), keine `data-pagefind`-Gewichte, kein
äußerer Layout-Wrapper. Interaktive Blöcke werden zu statischen
Entsprechungen – Galerien werden zu schlichten Figures, Hero/Avatar/
Screenshot zu einem einfachen `<img>` (ohne Fensterchrom), Mermaid zu
seinem Quelltext als Codeblock –, da Feed-Reader kein JavaScript ausführen.

Setzen Sie `PUBLIC_SITE_URL`, damit jede Feed- und Eintrags-`id`, der
`rel="self"`-Link und jeder Eintragslink **absolute** URLs sind
(sprachpräfigiert und `BASE_PATH`-bewusst) und damit wurzelrelative
Bilder im Text auch extern auflösen. dev.to verwendet den Link eines
Eintrags als `canonical_url`, und viele Reader kommen mit relativen IDs
nicht zurecht. Ohne `PUBLIC_SITE_URL` funktioniert der Feed weiterhin,
bleibt aber relativ und ist nicht syndizierungsbereit – der Server gibt
beim Start eine Warnung aus.

Blog-Seiten machen den Feed über ein `<link rel="alternate">` bekannt,
und die `h1` der Blog-Übersicht trägt neben der üblichen Schaltfläche zum
Kopieren des Seitenlinks eine Schaltfläche zum Kopieren der Feed-URL.

<!-- docref: end -->

{% callout type="info" title="Mehrere Blogs pro Website" %}
`blog: true` gilt pro Abschnitt: Eine Doku-Website kann gleichzeitig
einen Blog, ein Changelog und einen Advisories-Feed führen, jeweils
unabhängig.
{% /callout %}
