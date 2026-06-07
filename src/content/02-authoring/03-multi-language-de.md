---
title: Mehrsprachigkeit
description: Übersetzen Sie Seiten, indem Sie dem Dateinamen ein Sprachsuffix hinzufügen. Die Standardsprache bleibt ohne Präfix; andere bekommen eine /<lang>-URL, mit Rückgriff auf die Standardsprache.
---

# Mehrsprachigkeit

Übersetzen Sie eine Seite, indem Sie ihrem Dateinamen ein Sprachsuffix
hinzufügen. Die deutsche Version von `01-introduction.md` ist
`01-introduction-de.md`. Das ist die gesamte Einrichtung – die Sprachen
werden zur Build-Zeit aus den Suffixen ermittelt, es gibt also keine
Sprach-Konfigurationsdatei zu pflegen.

Diese Seite selbst hat eine deutsche Version
([Inhaltsstruktur](/de/getting-started/content-layout) ist ebenfalls eine),
also ist die Sprachumschaltung in der oberen Leiste auf dieser Website
aktiv.

## URLs

Die **Standardsprache bleibt ohne Präfix**, und jede andere Sprache bekommt
ein `/<lang>`-Präfix:

| Datei | URL |
|---|---|
| `getting-started/intro.md` | `/getting-started/intro` |
| `getting-started/intro-de.md` | `/de/getting-started/intro` |

So funktionieren bestehende Links weiter, und eine einsprachige Website hat
überhaupt keine Präfixe. Die Website bleibt einsprachig (und ohne Präfix),
bis die erste `-<lang>`-Datei auftaucht.

## Standardsprache

Die Standardsprache ist `en`. Ändern Sie sie mit `PUBLIC_DEFAULT_LANG`:

```sh
-e PUBLIC_DEFAULT_LANG="de"
```

Die Standardsprache ist diejenige, zu der die suffixlosen Dateien gehören,
und die unter den präfixlosen URLs ausgeliefert wird.

## Rückgriff

Der Seitenbestand wird durch die Standardsprache festgelegt. Eine Seite, die
nicht in eine Sprache übersetzt ist, greift auf den Standardinhalt unter
demselben Slug zurück, sodass in keiner Sprache je ein toter Link entsteht.
Sie können so wenige oder so viele Seiten übersetzen, wie Sie möchten, und
den Rest nach und nach ergänzen.

## Was Sie bekommen

- Eine **Sprachumschaltung** in der oberen Leiste (nur sichtbar, wenn mehr
  als eine Sprache existiert). Sie bleiben beim Umschalten auf derselben
  Seite.
- Eine **lokalisierte Seitenleiste samt Vor-/Zurück-Links** – übersetzte
  Titel, wo eine Übersetzung vorliegt, sonst die Standardtitel.
- **Suche pro Sprache.** Der Suchindex ist nach Sprache segmentiert, sodass
  eine Suche von einer `/de`-Seite aus deutsche Ergebnisse liefert.
- **`hreflang`-Alternativen** und eine mehrsprachige `sitemap.xml`, sodass
  Suchmaschinen die richtige Sprache ausliefern. Setzen Sie dafür
  `PUBLIC_SITE_URL` – siehe [SEO & KI-Suche](/de/customizing/seo).

## Beispiel

```text
content/
  01-getting-started/
    01-intro.md         → /getting-started/intro      (default, e.g. en)
    01-intro-de.md      → /de/getting-started/intro    (German)
    02-install.md       → /getting-started/install     (en only; /de falls back)
```

Das Sprachsuffix steht nach einem etwaigen `NN-`-Reihenfolgepräfix und vor
der Dateiendung. Verwenden Sie
[ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)-Codes
(`de`, `fr`, `ja`, …); eine zweibuchstabige Endung, die kein echter Code ist
(wie `setup-ci.md`), wird als gewöhnlicher Dateiname behandelt, nicht als
Sprache.

{% callout type="info" title="Inhalt, nicht Rahmen" %}
Seiteninhalt, Titel und Navigation werden lokalisiert. Die
Oberflächentexte selbst (zum Beispiel „Zurück"/„Weiter" und „Docs
durchsuchen…") bleiben derzeit in der Standardsprache.
{% /callout %}
