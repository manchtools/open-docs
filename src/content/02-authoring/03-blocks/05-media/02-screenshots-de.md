---
title: Screenshots
---

# Screenshots

Der `screenshot`-Block rendert ein Bild mit optionalem Browser-Rahmen, einer
Bildunterschrift und einer separaten Variante für den Dunkelmodus. Bilder
werden aus `static/screenshots/` aufgelöst. Ein Klick auf ein beliebiges Bild
vergrößert es in einer Lightbox; von dort blättern Sie mit den
Pfeil-Schaltflächen oder den Tasten ← und → durch jedes Bild der Seite,
wie in einem manuellen Karussell. Die Fenstersteuerung des Rahmens passt
sich dem Betriebssystem des Lesers an (macOS, Windows oder Linux).

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

## Normale Markdown-Bilder

Gewöhnliche `![alt](pfad)`-Bilder werden implizit über dieselbe Komponente
gerendert, in der `flat`-Variante und ohne Fensterrahmen. Dateien, die
neben dem Markdown liegen, werden an Ort und Stelle ausgeliefert, sodass
relative Pfade im Editor-Stil einfach funktionieren. Greifen Sie zum
expliziten Block, wenn Sie den Browser-Rahmen, eine Bildunterschrift oder
eine Dunkelmodus-Variante möchten.

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
[Statische Assets](/de/customizing/configuration#statische-assets).

Alternativ lassen Sie Bilder neben dem Markdown liegen, das sie
referenziert, und verlinken sie relativ; siehe
[Vorhandenes Markdown](/de/authoring/bring-existing-markdown).

{% callout type="warn" title="Auf echte Dateien verweisen" %}
Ein `screenshot`, der auf ein fehlendes Bild zeigt, schlägt bei der
Validierung fehl, wenn die Website startet. Fügen Sie die Datei hinzu, bevor
Sie darauf verweisen.
{% /callout %}
