---
title: SEO & KI-Suche
description: "Wie open-docs die erzeugte Website für Suchmaschinen auffindbar und für KI-Tools lesbar macht: Metadaten pro Seite, sitemap.xml, robots.txt und llms.txt."
---

# SEO & KI-Suche

Jede Seite wird auf dem Server gerendert, sodass Suchmaschinen
und KI-Crawler den vollständigen Inhalt erhalten, ohne JavaScript
auszuführen. Darüber hinaus erzeugt open-docs Metadaten pro Seite,
Schema.org-strukturierte Daten sowie die üblichen Discovery-Dateien.

## Website-URL setzen

Setzen Sie `PUBLIC_SITE_URL` auf die vollständige Basis-URL, unter der die
Doku ausgeliefert wird, ohne abschließenden Schrägstrich:

```sh
-e PUBLIC_SITE_URL="https://docs.example.com"
```

Das ist der einzige Wert, den die Discovery-Dateien brauchen. Ist er
gesetzt, bekommt jede Seite eine absolute kanonische URL, `sitemap.xml` und
`robots.txt` verweisen auf echte Adressen, und die Links in `llms.txt`
lösen sich auf. Bleibt er leer, funktioniert die Website weiterhin und die
Dateien werden trotzdem erzeugt, aber die `canonical`- und `og:url`-Tags
entfallen, und die Sitemap fällt auf reine Pfad-Links zurück.

Liegt die Doku unter einem Unterpfad (zum Beispiel
`https://example.com/docs`), nehmen Sie diesen Unterpfad in
`PUBLIC_SITE_URL` mit auf.

## Metadaten pro Seite

<!-- docref: begin src=src/lib/components/seo.svelte:67c301ca,src/lib/server/content-store.ts#firstParagraph:d52ff1f7 -->

Jede Seite gibt ihren eigenen `<title>`, `<meta name="description">`, den
kanonischen Link sowie Open Graph- / Twitter-Card-Tags aus. Die Werte
stammen aus dem Frontmatter der Seite:

```markdown
---
title: Installing the CLI
description: Install the command-line tool on macOS, Linux, and Windows.
---
```

- **Titel** ist der `title` der Seite. Browser-Tab und `og:title` zeigen
  `<Seitentitel> · <Markenname>`; die Startseite verwendet den Website-Titel
  allein.
- **Beschreibung** ist die `description` aus dem Frontmatter. Lassen Sie sie
  weg, greift open-docs ersatzweise auf den ersten Absatz der Seite zurück,
  sodass jede Seite eine brauchbare Beschreibung hat, auch ohne eine von
  Hand geschriebene.

`brandName`, der Website-Titel und die Standardbeschreibung stammen aus den
Umgebungsvariablen der [Konfiguration](/de/customizing/configuration).

<!-- docref: end -->

## Strukturierte Daten (JSON-LD)

<!-- docref: begin src=src/lib/structured-data.ts#buildJsonLd:a4a4d9cf -->
Jede Seite trägt außerdem einen Schema.org-Graphen in einem einzelnen
`<script type="application/ld+json">`: eine `Organization` und eine
`WebSite` auf jeder Seite sowie ein `BlogPosting` auf einem datierten
Beitrag – mit Überschrift, Autor, Veröffentlichungsdatum und Cover-Bild.
Das bringt Rich Results (Artikelkarten mit Autor und Datum sowie eine
klarere Website-Identität), die über die einfachen Tags hinausgehen.

Er wird nur ausgegeben, wenn `PUBLIC_SITE_URL` gesetzt ist, damit jeder
Knoten eine absolute ID hat. Autorentext wird für die sichere Einbettung
escaped, und da ein `ld+json`-Block Daten und kein ausführbares Skript ist,
braucht er keine Content-Security-Policy-Ausnahme.
<!-- docref: end -->

## Blogbeiträge und Feeds

Beiträge in einem [Blog-Abschnitt](/de/authoring/blogging) tragen
zusätzliche Metadaten: `article:published_time`- und
`article:author`-Tags aus dem Frontmatter des Beitrags sowie das
`cover`-Bild des Beitrags als Social-Card-Bild. Der Atom-Feed des
Abschnitts wird auf dessen Seiten per `<link rel="alternate">`
angekündigt, sodass Feed-Reader ihn automatisch entdecken.

## sitemap.xml

<!-- docref: begin src=src/routes/sitemap.xml/+server.ts:5c721e4e -->

`/sitemap.xml` listet die Startseite sowie jede Inhalts- und Rechtsseite.
Sie wird aus demselben Ordnerbaum aufgebaut, den auch die Navigation nutzt,
sodass eine neue Markdown-Datei ohne weiteren Schritt in der Sitemap landet.

<!-- docref: end -->

## robots.txt

<!-- docref: begin src=src/routes/robots.txt/+server.ts:baed8039 -->

`/robots.txt` erlaubt allen Crawlern den Zugriff und verweist sie auf die
Sitemap (sofern `PUBLIC_SITE_URL` gesetzt ist). Ersetzen Sie sie, indem Sie
Ihre eigene `robots.txt` in die statischen Assets der Website legen.

<!-- docref: end -->

## llms.txt

<!-- docref: begin src=src/routes/llms.txt/+server.ts:bb10e479 -->
`/llms.txt` ist ein [llms.txt](https://llmstxt.org)-Index für KI-Assistenten
und -Crawler: der Website-Titel, eine einzeilige Zusammenfassung, dann jede
Seite nach Abschnitt gruppiert, mit Beschreibung und Link. Er gibt einem
Modell die gesamte Karte Ihrer Doku in einer kleinen, link-orientierten
Datei. Wie die Sitemap wird er aus Ihren Inhalten erzeugt und veraltet
daher nie.
<!-- docref: end -->
