---
title: Vorhandenes Markdown mitbringen
label: Vorhandenes Markdown
description: Was funktioniert, wenn Sie open-docs auf Markdown richten, das für GitHub oder VSCode geschrieben wurde, und die bewussten Grenzen.
---

# Vorhandenes Markdown mitbringen

<!-- docref: begin src=src/lib/server/markdown.ts:097d96d1 -->

Ein Ordner mit Markdown, das für GitHub, VSCode oder einen anderen
Generator geschrieben wurde, rendert ohne Umschreiben. Die Konventionen,
auf die sich diese Werkzeuge stützen, gelten weiterhin:

- **Relative Links.** `[setup](./guides/setup.md)`, `../intro.md` und
  `other.md#section` werden relativ zur verlinkenden Datei aufgelöst,
  genau wie Ihr Editor ihnen folgt. Die Endung `.md` und etwaige
  `01-`-Präfixe werden über die normalen URL-Regeln abgebildet.
  Site-absolute Pfade (`/guides/setup`) funktionieren unverändert
  weiter.
- **`README.md` ist die Ordnerseite.** Hat ein Ordner keine `index.md`,
  übernimmt seine `README.md` diese Rolle.
- **Bilder neben Ihrem Markdown.** `![diagram](./images/arch.png)`
  rendert an Ort und Stelle, und die Datei wird aus Ihrem Content-Ordner
  ausgeliefert; ein Verschieben nach `static/` ist nicht nötig. Jedes
  Markdown-Bild, ob relativ, absolut oder eine Web-URL, wird über den
  Screenshot-Rahmen in seiner schlichten Variante angezeigt.
- **Task-Listen.** `- [ ]` und `- [x]` rendern als Checkboxen.
- **Fußnoten.** `[^1]`-Referenzen werden zu nummerierten, hochgestellten
  Links, deren Definitionen am Ende der Seite aufgelistet sind.
- **Tabellen, Durchstreichungen, Code-Fences, Zitate** funktionieren wie
  in Standard-Markdown; Fences erhalten Syntaxhervorhebung und einen
  Kopier-Button.

Alles andere kommt automatisch dazu: Navigation aus dem Ordnerbaum,
Suche, Überschriften-Anker und das Inhaltsverzeichnis, SEO-Dateien und
der Dark Mode.

<!-- docref: end -->

## Bewusste Grenzen

Zwei Dinge bleiben mit Absicht abgeschaltet, nicht aus Versäumnis:

{% callout type="info" title="HTML wird nie gerendert" %}
open-docs rendert Markdown, kein HTML. Inline-Tags wie `<details>`
erscheinen als der Text, den Sie getippt haben. Um Markup als Beispiel
anzuzeigen, setzen Sie es in einen Code-Fence. Es gibt keine Allow-List
und keine Ausnahme; das hält die strikte Sicherheitsrichtlinie intakt.
{% /callout %}

{% callout type="info" title="Nackte URLs bleiben Text" %}
`https://example.com` als reiner Text eingefügt wird nicht in einen Link
verwandelt. Ob etwas klickbar ist, entscheidet der Autor: Schreiben Sie
`[example](https://example.com)` oder `<https://example.com>`.
{% /callout %}

<!-- docref: begin src=src/lib/server/markdown.ts#stripHtmlComments:41367d9c -->
Setext-Überschriften (unterstrichen mit `===` oder `---`) erhalten keine
Anker-IDs; verwenden Sie `#`-Überschriften. HTML-Kommentare
(`<!-- … -->`) werden entfernt, damit Review-Notizen nie bei den Lesern
ankommen.
<!-- docref: end -->
