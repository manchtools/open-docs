---
title: Schnellstart
---

# Schnellstart

Bringen Sie eine Docs-Website in unter einer Minute zum Laufen.

{% tabs labels="Docker, Aus dem Quellcode" initial="Docker" %}
{% tab label="Docker" %}

Hängen Sie ein Verzeichnis mit Markdown unter `/content` ein und öffnen Sie
den Port:

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  ghcr.io/manchtools/open-docs:latest
```

Öffnen Sie `http://localhost:3000`. Der Container baut die Website beim
Start mit Ihrem eingebetteten Inhalt und liefert sie dann aus. Starten Sie
ihn ohne Mount, erhalten Sie diese Dokumentation als Live-Demo.

{% /tab %}
{% tab label="Aus dem Quellcode" %}

```sh
bun install
PUBLIC_BRAND_NAME="My Project" bun run dev
```

Legen Sie Ihre `.md`- / `.markdoc`-Dateien in `src/content/`. Der
Dev-Server lädt beim Speichern automatisch neu.

{% /tab %}
{% /tabs %}

{% callout type="info" title="Kein Inhalt? Kein Problem." %}
Ohne eingehängten Inhalt liefert der Container die open-docs-Dokumentation
selbst aus, sodass Sie sich durch eine echte Website klicken können, bevor
Sie eine einzige Seite schreiben.
{% /callout %}

## Die 30-Sekunden-Variante

{% steps %}
{% step title="Inhalt anlegen" %}
Erstellen Sie einen Ordner mit ein, zwei Markdown-Dateien.
{% /step %}
{% step title="open-docs darauf richten" %}
Hängen Sie ihn unter `/content` ein (Docker) oder legen Sie ihn in
`src/content/` ab (aus dem Quellcode).
{% /step %}
{% step title="Website öffnen" %}
Seitenleiste, Suchindex und Routen werden alle für Sie erzeugt.
{% /step %}
{% /steps %}

## Wie es weitergeht

{% cards %}
{% card title="Inhaltsstruktur" href="/de/getting-started/content-layout" icon="🗂️" %}
Wie Dateien auf Seiten und die Seitenleiste abgebildet werden.
{% /card %}
{% card title="Inhalte erstellen" href="/de/authoring" icon="✍️" %}
Markdown, Callouts, Tabs, Code und Diagramme.
{% /card %}
{% card title="Deployment mit Docker" href="/de/deploying/docker" icon="🐳" %}
Mounts, Umgebung und Hinweise für den Produktivbetrieb.
{% /card %}
{% /cards %}
