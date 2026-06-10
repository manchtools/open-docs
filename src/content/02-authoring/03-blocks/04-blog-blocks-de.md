---
title: Blog-Blöcke
label: Blog-Blöcke
description: Hero-Bilder, Autoren-Avatare, Zitate und Bildergalerien – gemacht für Beiträge, einsetzbar auf jeder Seite.
---

# Blog-Blöcke

Vier Blöcke, die mit dem [Blog-Modus](/de/authoring/blogging)
hinzugekommen sind. Sie funktionieren auf jeder Seite; auf Beiträgen
erscheinen einige davon auch automatisch.

## Hero

Ein Bild in voller Breite, optional mit Titel-Overlay:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="The landing page" title="Big news" subtitle="Optional line below" /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="Die Startseite" title="Große Neuigkeiten" subtitle="Optionale Zeile darunter" /%}

Als erster Block einer Seite zieht er bündig an den oberen Rand. Ein
Beitrag, der mit einem Hero beginnt, braucht kein `cover:`-Frontmatter –
das Vorschaubild der Auflistung und das Social-Card-Bild werden daraus
abgeleitet.

## Avatar

Eine Autorenkarte. Direkt nach einem Hero überlappt das Bild ihn um die
Hälfte – der klassische Cover-Foto-Header:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-de-dark.png" name="Ada Lovelace" description="Builds manchtools." /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-de-dark.png" name="Ada Lovelace" description="Baut manchtools." /%}

Für sich allein rendert er mit normalem Abstand. Auf Beiträgen verwendet
die Autorenzeile unter dem Titel dieselbe Komponente, gespeist aus dem
`author:`-Frontmatter.

## Quote

```markdown
{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}
```

{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}

## Gallery

Einfache Markdown-Bilder innerhalb des Tags ordnen sich als Raster an;
jedes Bild öffnet sich in der Lightbox, in der die Pfeil-Schaltflächen
(oder ← / →) durch alle Bilder der Seite blättern:

```markdown
{% gallery %}
![Light](/screenshots/open-docs-home.png)
![Dark](/screenshots/open-docs-home-de-dark.png)
![German](/screenshots/open-docs-home-fr.png)
{% /gallery %}
```

{% gallery %}
![Hell](/screenshots/open-docs-home.png)
![Dunkel](/screenshots/open-docs-home-de-dark.png)
![Deutsch](/screenshots/open-docs-home-fr.png)
{% /gallery %}
