---
title: Reihenfolge & Titel
---

# Reihenfolge & Titel

Alphabetische Reihenfolge passt selten zur Lesereihenfolge: „Advanced" käme
vor „Install". open-docs bietet Ihnen zwei Wege, die Reihenfolge festzulegen,
beide aus dem Inhalt selbst abgeleitet. Eine externe Navigationsdatei ist
nicht im Spiel.

## Zahlenpräfixe

<!-- docref: begin src=src/lib/slug.ts#stripPrefix:b2742e12,src/lib/slug.ts#cleanSlug:9c51ef45,src/lib/slug.ts#titleFromSegment:d11d1ecd -->

Stellen Sie einer Datei oder einem Ordner `NN-` voran (auch `NN_` oder `NN.`).
Die Zahl legt die Sortierposition fest und wird aus URL und Titel
**entfernt**.

<!-- docref: end -->

```
content/
  01-get-started/
    01-install.md       → /get-started/install   (sorts 1st)
    02-configure.md     → /get-started/configure  (sorts 2nd)
  02-reference/         → group "Reference" (sorts after "Get started")
```

So erzeugt `01-get-started/02-install.md` die URL `/get-started/install`, den
Titel „Install", und sortiert an zweiter Stelle innerhalb einer Gruppe, die
selbst an erster Stelle sortiert. Präfixe funktionieren auch bei Ordnern – so
ordnen Sie die **Gruppen**.

Abschnitte mit `blog: true` sind die Ausnahme: ihre Beiträge sortieren nach
`date`, neueste zuerst, und werden mit Neuere/Ältere-Links umgeblättert.
Siehe [Blogging](/de/authoring/blogging).

## Frontmatter

<!-- docref: begin src=src/lib/server/content-store.ts#orderOf:1c460e59,src/lib/server/content-store.ts#metaTitle:0ac7aeab -->

Für feinere Kontrolle setzen Sie Schlüssel im Frontmatter einer Seite. Das
Frontmatter sticht den Dateinamen.

<!-- docref: end -->

```markdown
---
title: Installing the command-line tool
label: Install
order: 2
---
```

| Schlüssel | Wirkung |
|---|---|
| `title` | Vollständiger Titel (Seitenleiste + vorherige/nächste Seite). |
| `label` | Kurzes Label in der Seitenleiste, wenn der Titel lang ist. Alias `sidebar_label`. |
| `order` | Sortierposition; überschreibt ein Zahlenpräfix. |
| `meta` | `true` hält die Seite aus Seitenleiste und vorheriger/nächster Seite heraus und listet sie stattdessen im Footer, für eine Impressums-/Rechtsseite, die manche Regionen verlangen. |

## Beides kombinieren

Ein gängiges Muster: Zahlenpräfixe auf **Ordnern** verwenden, um die Gruppen
zu ordnen, und Dateien nach ihren eigenen Präfixen sortieren lassen. Greifen
Sie nur dann zum Frontmatter-`label`, wenn ein Titel für die Seitenleiste zu
lang ist.

{% callout type="success" title="Diese Website macht genau das" %}
Jede Gruppe, die Sie in der Seitenleiste sehen, ist ein mit `NN-` versehener
Ordner, und jede **Gruppenüberschrift ist der Link auf die `index.md` dieses Abschnitts**. Klicken Sie auf „Authoring", um auf der Übersichtsseite zu
landen.
{% /callout %}
