---
title: SEO & KI-Suche
description: "Wie open-docs die erzeugte Website für Suchmaschinen auffindbar und für KI-Tools lesbar macht: Metadaten pro Seite, sitemap.xml, robots.txt und llms.txt."
---

# SEO & KI-Suche

Jede Seite wird vorab zu statischem HTML gerendert, sodass Suchmaschinen
und KI-Crawler den vollständigen Inhalt erhalten, ohne JavaScript
auszuführen. Darüber hinaus erzeugt open-docs Metadaten pro Seite sowie die
üblichen Discovery-Dateien.

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
Dateien werden trotzdem gebaut, aber die `canonical`- und `og:url`-Tags
entfallen, und die Sitemap fällt auf reine Pfad-Links zurück.

Liegt die Doku unter einem Unterpfad (zum Beispiel
`https://example.com/docs`), nehmen Sie diesen Unterpfad in
`PUBLIC_SITE_URL` mit auf.

## Metadaten pro Seite

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

## sitemap.xml

`/sitemap.xml` listet die Startseite sowie jede Inhalts- und Rechtsseite.
Sie wird aus demselben Ordnerbaum aufgebaut, den auch die Navigation nutzt,
sodass eine neue Markdown-Datei ohne weiteren Schritt in der Sitemap landet.

## robots.txt

`/robots.txt` erlaubt allen Crawlern den Zugriff und verweist sie auf die
Sitemap (sofern `PUBLIC_SITE_URL` gesetzt ist). Ersetzen Sie sie, indem Sie
Ihre eigene `robots.txt` in die statischen Assets der Website legen.

## llms.txt

`/llms.txt` ist ein [llms.txt](https://llmstxt.org)-Index für KI-Assistenten
und -Crawler: der Website-Titel, eine einzeilige Zusammenfassung, dann jede
Seite nach Abschnitt gruppiert, mit Beschreibung und Link. Er gibt einem
Modell die gesamte Karte Ihrer Doku in einer kleinen, link-orientierten
Datei. Wie die Sitemap wird er aus Ihren Inhalten erzeugt und veraltet
daher nie.
