---
title: Inhaltsstruktur
description: Wie aus einem Verzeichnis voller Markdown-Dateien Seiten, eine Seitenleiste und ein Suchindex werden.
---

# Inhaltsstruktur

Alles, was die Seite anzeigt, stammt aus einem einzigen
Markdown-Verzeichnis. In Docker ist das, was Sie unter `/content`
einhängen; aus dem Quellcode ist es `src/content/`. Der Rest (Routen,
Seitenleiste, Suche) wird daraus abgeleitet.

## Ein typischer Baum

{% filetree %}
- content/
  - theme.css — optionales eigenes Styling
  - 01-getting-started/
    - 01-introduction.md
    - 02-quick-start.md
  - 02-reference/
    - index.md — die Startseite des Abschnitts
    - api.md
{% /filetree %}

Daraus entsteht:

- Eine **Seitenleiste** mit zwei Gruppen, „Getting started" und
  „Reference".
- Routen unter `/getting-started/introduction`,
  `/getting-started/quick-start`, `/reference` (die Abschnitts-Startseite)
  und `/reference/api`.
- Ein **Suchindex** über alle Seiten.

## Die Regeln

- **Dateien werden zu Seiten.** `reference/api.md` → `/reference/api`.
- **Ordner der ersten Ebene werden zu Gruppen** in der Seitenleiste; die
  Dateien darin werden zu deren Einträgen.
- **Dateinamen werden zu URLs**, in Kebab-Schreibweise: `quick-start.md`
  → `/…/quick-start`.
- **Die `index.md` eines Ordners** ist dessen Startseite und wird unter
  der Ordner-URL ausgeliefert (`reference/index.md` → `/reference`).
- **Führende Nummernpräfixe** wie `01-` legen die Reihenfolge fest und
  werden aus URL und Titel entfernt. Siehe
  [Reihenfolge & Titel](/de/navigation/ordering-and-titles).

{% callout type="info" title="Die Startseite" %}
Die Startseite (`/`) ist eine generierte Übersicht, die Ihre Abschnitte
als Karten auflistet; sie ist keine Markdown-Datei. Legen Sie Ihre erste
echte Seite in eine Gruppe, so wie diese Seite es mit der
[Einführung](/de/getting-started/introduction) tut.
{% /callout %}

## Was ignoriert wird

Nur `.md`- und `.markdoc`-Dateien im Inhaltsverzeichnis werden zu Seiten.
Eine `theme.css` wird für das [Styling](/de/customizing/theming)
verwendet; alles andere (Entwürfe, Notizen, `.txt`-Dateien) wird
ignoriert, sodass Sie Arbeitsdateien neben Ihren Dokumenten ablegen
können.

Wenn Sie ein Bild einbinden, legen Sie es unter `static/` ab und
verlinken es von `/screenshots/…` — siehe
[Screenshots](/de/authoring/blocks/media/screenshots).
