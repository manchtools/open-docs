---
title: Markdown & Frontmatter
label: Markdown
---

# Markdown & Frontmatter

Schreiben Sie Seiten in reinem Markdown. Alle Standardelemente funktionieren:

- **Überschriften** (`#` … `######`). Jede bekommt eine Anker-ID und fließt
  in das Inhaltsverzeichnis der Seite rechts ein.
- **Listen**, geordnet und ungeordnet, mit Verschachtelung.
- **Links**, intern (`/getting-started/quick-start`) und extern. Relative
  Links im Editor-Stil wie `./sibling.md` werden ebenfalls relativ zur
  Datei aufgelöst; siehe
  [Vorhandenes Markdown](/de/authoring/bring-existing-markdown). Externe
  Links öffnen sich automatisch in einem neuen Tab mit sicheren
  `rel`-Attributen.
- **Bilder** (`![alt](./diagram.png)`), direkt neben Ihrem Markdown oder
  unter `static/`.
- **Aufgabenlisten** (`- [ ]` / `- [x]`) und **Fußnoten** (`[^1]`).
- **Hervorhebungen**, `Inline-Code`, Zitate, Tabellen und Trennlinien.

## Überschriften und das Inhaltsverzeichnis

Die erste `#`-Überschrift ist der Seitentitel, der oben im Inhalt angezeigt
wird. `##`- und `###`-Überschriften füllen das Inhaltsverzeichnis in der
rechten Spalte und werden zu verlinkbaren Ankern, sodass Sie direkt auf
einen Abschnitt verlinken können.

## Frontmatter

Ein optionaler YAML-Block ganz am Anfang einer Datei steuert, wie die Seite
in der **Seitenleiste** erscheint:

```markdown
---
title: Installing the CLI
label: Install
order: 2
---

# Installing the CLI
```

| Schlüssel | Wirkung |
|---|---|
| `title` | Vollständiger Titel für die Seitenleiste und die Vor-/Zurück-Links. |
| `label` | Kürzeres Label für die Seitenleiste, wenn der Titel lang ist. Alias: `sidebar_label`. |
| `order` | Sortierposition innerhalb der Gruppe. Überschreibt ein etwaiges Nummernpräfix im Dateinamen. |
| `description` | Meta-Beschreibung für Suchmaschinen und den `llms.txt`-Index. Greift ersatzweise auf den ersten Absatz der Seite zurück. Siehe [SEO & KI-Suche](/de/customizing/seo). |

Die `index.md` eines Abschnitts versteht einen weiteren Schlüssel, `icon`,
der das Icon dieses Abschnitts auf der Karte der Startseite festlegt. Siehe
[Abschnitts-Icons](/de/navigation/folder-derived-nav#abschnitts-icons).
Eine `index.md` akzeptiert außerdem `blog: true`, um ihren Abschnitt in
ein Blog zu verwandeln; siehe [Blogging](/de/authoring/blogging).
Blogbeiträge bringen eigene Schlüssel mit (`date`, `author`, `tags`,
`cover`, `draft`), die ebenfalls unter [Blogging](/de/authoring/blogging)
beschrieben sind. Eine Seite mit `meta: true` bleibt aus Seitenleiste und
Vor-/Zurück-Links heraus und wird stattdessen im Footer gelistet; siehe
[Reihenfolge & Titel](/de/navigation/ordering-and-titles).

Frontmatter ist optional. Ohne sie wird der Titel aus dem Dateinamen
abgeleitet, und Seiten werden alphabetisch sortiert (oder nach ihrem
Nummernpräfix). Das vollständige Sortiermodell finden Sie unter
[Reihenfolge & Titel](/de/navigation/ordering-and-titles).

{% callout type="warn" title="Frontmatter skalar halten" %}
Für die Navigation werden nur einfache `key: value`-Zeilen ausgewertet.
Verschachtelte oder als Liste angegebene YAML-Werte werden für die
Seitenleiste ignoriert.
{% /callout %}
