---
title: Screenshots
---

# Screenshots

Der `screenshot`-Block rendert ein Bild mit optionalem Browser-Rahmen, einer
Bildunterschrift und einer separaten Variante für den Dunkelmodus. Bilder
werden aus `static/screenshots/` aufgelöst. Ein Klick auf ein beliebiges Bild
vergrößert es in einem Dialog (das gilt auch für normale Markdown-Bilder
`![]()`). Die Fenstersteuerung des Rahmens passt sich dem Betriebssystem
des Lesers an (macOS, Windows oder Linux).

Hier ist die open-docs-Startseite, gerendert von genau diesem Block:

{% screenshot
   src="open-docs-home-de.png"
   alt="Die open-docs-Startseite"
   dark="open-docs-home-de-dark.png"
   caption="Die open-docs-Startseite. Die Fenstersteuerung oben passt sich Ihrem Betriebssystem an." /%}

```markdown
{% screenshot
   src="dashboard.png"
   alt="The project dashboard"
   caption="The dashboard after first login"
   dark="dashboard-dark.png"
   variant="frame"
   width="720px" /%}
```

## Attribute

| Attribut | Pflicht | Wirkung |
|---|---|---|
| `src` | ja | Bilddatei unter `static/screenshots/`. |
| `alt` | ja | Barrierefreie Beschreibung. |
| `caption` | nein | Unter dem Bild angezeigte Bildunterschrift. |
| `dark` | nein | Alternatives Bild für den aktiven Dunkelmodus. |
| `variant` | nein | `frame` (nachgebildeter Browser-Rahmen, Standard) oder `flat` (umrandetes Bild). |
| `width` | nein | Maximale Breite, z. B. `720px`. Standard ist die Breite der Inhaltsspalte. |

## Bilddateien hinzufügen

Legen Sie die Dateien in Ihrem Static-Verzeichnis ab:

{% filetree %}
- static/
  - screenshots/
    - dashboard.png
    - dashboard-dark.png
{% /filetree %}

In Docker mounten Sie Ihre Assets unter `/static`. Sie werden in das
`static/` des Images zusammengeführt, sodass Sie nur das überschreiben, was Sie
selbst bereitstellen. Siehe
[Statische Assets](/de/customizing/configuration#static-assets).

{% callout type="warn" title="Auf echte Dateien verweisen" %}
Ein `screenshot`, der auf ein fehlendes Bild zeigt, lässt den Production-Build
fehlschlagen, da jede Seite vorgerendert wird. Fügen Sie die Datei hinzu, bevor
Sie darauf verweisen.
{% /callout %}
