---
title: Einführung
---

# open-docs

{% boost weight=8 %}
**open-docs** ist eine als Container auslieferbare Dokumentations-Website.
Legen Sie Ihre Markdown- (oder [Markdoc](https://markdoc.dev/)) Dateien in
ein Verzeichnis, richten Sie einen Container darauf, und Sie haben eine
durchsuchbare, Dark-Mode-fähige Docs-Website mit Syntaxhervorhebung – ganz
ohne zu konfigurierenden Build-Schritt und ohne ein Framework, das Sie
lernen müssten.
{% /boost %}

Die Website, die Sie gerade lesen, *ist* open-docs, das seine eigene
Dokumentation rendert. Alles hier ist im Standard-Container-Image
enthalten, sodass ein frisches `docker run` ohne eingehängten Inhalt auf
genau diesen Seiten landet.

## Warum es das gibt

Die meisten Dokumentationsgeneratoren sind eine Abhängigkeit, die Sie einem
Repository hinzufügen und selbst bauen. open-docs ist das Gegenteil: ein
**generisches Image, in das Sie Inhalt einhängen**. Dasselbe veröffentlichte
Image bedient jeden beliebigen Dokumentsatz. Sie liefern das Markdown, das
Image liefert Theme, Rendering und Suche.

Das macht es zu einer guten Wahl, wenn Sie:

- Dokumentation für ein Projekt aufsetzen wollen, ohne dessen Repository um
  eine Toolchain zu erweitern.
- ein internes Handbuch oder eine Wissensdatenbank aus einem Ordner voller
  Markdown betreiben wollen.
- Inhalt und Darstellung sauber getrennt halten wollen.

## Was Sie bekommen

- **Aus Ordnern abgeleitete Navigation.** Die Seitenleiste wird aus Ihrem
  Verzeichnisbaum aufgebaut, es gibt also keine Navigationsdatei, die Sie
  synchron halten müssten. Siehe
  [Navigation](/de/navigation/folder-derived-nav).
- **Volltextsuche**, beim Deployment vorab erzeugt mit
  [Pagefind](https://pagefind.app) und auf Dokumentation abgestimmt. Siehe
  [Suche](/de/customizing/search).
- **Heller / dunkler Modus** mit einem Umschalter in der oberen Leiste.
- **Syntaxhervorhebung** über [Shiki](https://shiki.style) und **Diagramme**
  über [Mermaid](https://mermaid.js.org). Siehe
  [Code & Diagramme](/de/authoring/blocks/media/code-and-diagrams).
- **Theming** über eine einzige `theme.css`, die Sie neben Ihren Inhalt
  legen. Siehe [Theming](/de/customizing/theming).
- **Rebranding per Umgebungsvariable** (Name, Logo, Farben, Repository-Link),
  damit ein Image viele Websites bedienen kann. Siehe
  [Konfiguration](/de/customizing/configuration).
- **Content-Blöcke** (Callouts, Tabs, Screenshots) zusätzlich zu reinem
  Markdown. Siehe [Callouts & Tabs](/de/authoring/blocks/callouts-and-tabs).

## Nächste Schritte

Weiter zum [Schnellstart](/de/getting-started/quick-start), um eine Website
in unter einer Minute zum Laufen zu bringen, und lesen Sie dann die
[Inhaltsstruktur](/de/getting-started/content-layout), um zu erfahren, wie
aus Ihren Dateien Seiten werden.
