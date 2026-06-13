---
title: Suche
---

# Suche

Jede open-docs-Website bringt eine **Volltextsuche** mit, betrieben von
[Pagefind](https://pagefind.app). Der Index wird kurz nach dem Start des
Servers aus Ihren Seiten erzeugt; die Seiten sind sofort erreichbar, und
die Suche steht wenige Augenblicke später bereit. Ausgeliefert wird er als
statische Dateien. Es gibt also keinen
Suchserver, und die Suche funktioniert auch offline. Öffnen Sie sie über das
Feld in der oberen Leiste oder mit **⌘K / Strg&nbsp;K**.

## Was indexiert wird

Indexiert wird nur der **Textkörper jeder Seite**. Das Drumherum bleibt
außen vor, damit es die Ergebnisse nicht verwässert:

- die Seitenleiste, die obere Leiste und der Footer;
- die **Zurück / Weiter**-Links, die die Titel der Nachbarseiten
  wiederholen;
- das Inhaltsverzeichnis auf der Seite;
- der Platzhalter „Diagramm wird gerendert …" für Mermaid-Blöcke.

## Wie Ergebnisse bewertet werden

<!-- docref: begin src=src/lib/components/search.svelte#@ranking:a5413ce0,src/lib/markdoc/components/Heading.svelte:43feb92a -->

open-docs stimmt Pagefind standardmäßig auf Dokumentation ab; es gibt
nichts zu konfigurieren:

- **Überschriften schlagen Fließtext.** Ein Begriff in einem Seitentitel
  oder einer Überschrift zählt mehr als dasselbe Wort in einem Absatz,
  sodass die passendste Seite zuerst erscheint (Titel wiegen am meisten,
  dann `##`, dann `###`).
- **Exakte Treffer werden bevorzugt.** Treffer, die näher an Ihrer Eingabe
  liegen, werden über unscharfe oder partielle gereiht, da Suchen in der
  Dokumentation meist präzise sind.
- **Lange Seiten werden nicht bestraft.** Eine ausführliche Seite verliert
  nicht gegen einen Stub, der den Begriff zufällig einmal erwähnt.

Wenn Sie open-docs forken, sitzen diese Stellschrauben in
`src/lib/components/search.svelte`.

<!-- docref: end -->

## Eine Passage nach oben holen

<!-- docref: begin src=src/lib/markdoc/components/Boost.svelte#@props:b07730c2 -->

Wenn die Überschriftsgewichte nicht reichen, etwa bei einer zentralen
Definition mitten in einer langen Seite, packen Sie sie in einen
`{% boost %}`-Block, um sie im Index stärker zu gewichten. Sie wird
unverändert dargestellt und wirkt sich nur auf die Suche aus.

<!-- docref: end -->

```markdown
{% boost weight=8 %}
The container indexes your content at start, so one image serves any docset.
{% /boost %}
```

Die Gewichtsskala finden Sie in der
[Markdoc-Tags-Referenz](/de/reference/markdoc-tags).
