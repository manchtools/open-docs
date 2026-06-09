---
title: Deployment mit Docker
label: Docker
---

# Deployment mit Docker

Der empfohlene Weg, open-docs zu betreiben, ist der veröffentlichte
Container. Ein generisches Image bedient jede Doku; den Inhalt liefern
Sie zur Laufzeit.

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -v ./static:/static:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  -e PUBLIC_REPO_URL="https://github.com/me/my-project" \
  ghcr.io/manchtools/open-docs:latest
```

Rufen Sie `http://localhost:3000` auf.

## Mounts

| Mount | Verweist auf | Enthält |
|---|---|---|
| `/content` | `src/content/` | Ihre `.md`-/`.markdoc`-Dateien und optional `theme.css`. |
| `/static` | `static/` | Favicons, `og.png`, Screenshots. Werden über die Standarddateien gelegt. |

Beide Mounts sind optional. Der Content-Mount kann nur lesend sein
(`:ro`); der Entrypoint kopiert ihn vor dem Build in den Image-Baum.

{% callout type="info" title="Ohne Mounts starten" %}
Ohne `/content`-Mount bedient das Image die open-docs-Dokumentation
selbst, eine Live-Demo, die Sie durchklicken können, bevor Sie eigene
Inhalte hinzufügen.
{% /callout %}

## Wie ein Build abläuft

Es gibt keinen Build-Schritt. Der Container parst und validiert Ihr
Markdown beim Start (ein paar Sekunden, rund 100–150 MB Speicher – er
läuft problemlos auf einem 256-MB-Host) und rendert die Seiten auf dem
Server. Der Suchindex wird wenige Augenblicke nach dem Hochfahren des
Servers erzeugt:

```mermaid
flowchart LR
  A[Container starts] --> B[Parse + validate /content]
  B --> C[Serve on :3000]
  C --> D[Pagefind indexes the pages]
```

Die Validierung ist strikt: ein unbekannter Tag, ein fehlendes
Pflichtattribut, ein toter interner Link oder ein Screenshot, der auf eine
fehlende Datei zeigt, stoppt den Container mit einer Auflistung von Datei
und Zeile – genauso, wie früher der Build fehlgeschlagen wäre. Korrigieren
Sie den Inhalt und starten Sie ihn erneut.

Da nichts kompiliert wird, genügt für Änderungen an Inhalt, Branding
(`PUBLIC_*`), Tokens oder `theme.css` ein Neustart des Containers.

## Deployments unter einem Unterpfad

Um unter einem Unterpfad zu hosten (zum Beispiel
`https://example.com/docs`), setzen Sie `BASE_PATH`:

```sh
-e BASE_PATH=/docs
```

Alle internen Links, Assets und der Suchindex werden unter diesem Präfix
ausgeliefert. Dies ist die einzige Einstellung, die die App beim Start noch
neu baut (SvelteKit kompiliert den Basispfad fest ein), was etwa 1,5 GB
Speicher benötigt – auf kleinen Hosts entfernen Sie das Präfix stattdessen
besser am Reverse-Proxy.

## Umgebung

Jede `PUBLIC_*`-Variable wird beim Start des Containers gelesen. Siehe
[Konfiguration](/de/customizing/configuration) für das Site-Chrome und
[Umgebungsvariablen](/de/reference/environment-variables) für die
vollständige Liste.
