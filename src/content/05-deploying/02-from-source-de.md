---
title: Aus dem Quellcode
---

# Aus dem Quellcode

Zum lokalen Schreiben oder zum Self-Hosting ohne Docker betreiben Sie
open-docs direkt. [Bun](https://bun.sh) ist Paketmanager und Runtime.

## Entwickeln

```sh
bun install
bun run dev
```

Legen Sie Ihre `.md`-/`.markdoc`-Dateien in `src/content/` ab; der
Dev-Server lädt beim Speichern automatisch neu. Setzen Sie eine beliebige
`PUBLIC_*`-Variable inline, um das Branding vorab zu sehen:

```sh
PUBLIC_BRAND_NAME="My Project" bun run dev
```

## Bauen und Vorschau

```sh
bun run build      # production build → ./build/
bun run preview    # serve the built site
```

Der Build rendert jede Seite vorab zu statischem HTML und führt dann
[Pagefind](https://pagefind.app) über das Ergebnis aus, um den Suchindex
zu erzeugen.

## Make-Targets

Ein `Makefile` kapselt die gängigen Befehle:

| Befehl | Macht |
|---|---|
| `make install` | Abhängigkeiten installieren. |
| `make dev` | Dev-Server mit Hot Reload. |
| `make check` | Typprüfung mit `svelte-check`. |
| `make build` | Produktions-Build nach `./build/`. |
| `make preview` | Den Produktions-Build ausliefern. |
| `make docker` | Das Container-Image lokal bauen. |

## Das Ergebnis hosten

Der Build erzeugt die App plus einen kleinen Bun-Server, der Ihren Inhalt
beim Start parst und die Seiten auf dem Server rendert. Er läuft überall,
wo Bun läuft, und benötigt sehr wenig Speicher.
