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

Das Image bringt die Standard-Dokumentation **bereits gebaut** mit, sodass
ein einfaches `docker run` (ohne Mounts, ohne Env-Überschreibungen) sie
sofort ausliefert und kaum Speicher braucht. Neu gebaut wird beim
Containerstart nur, wenn Sie anpassen – Inhalte oder Static einhängen oder
`PUBLIC_*` / `BASE_PATH` setzen:

```mermaid
flowchart LR
  A[Container starts] --> B{Customized?}
  B -- no --> S[Serve the pre-built site]
  B -- yes --> C[Copy /content + /static in]
  C --> D[bun run build]
  D --> E[Pagefind indexes the pages]
  E --> S
```

Der Build ist der schwere Schritt – er bündelt Vite, Mermaid und Shiki und
benötigt rund 2 GB Speicher, unabhängig von der Seitenzahl. Einmal beim
Image-Build ausgeführt, bleibt ein einfaches `docker run` leicht.

Um **eigene** Dokumente auf einem speicherarmen Host auszuliefern, backen
Sie sie auf Ihrer Build-Maschine in ein kleines Image, statt beim Start neu
zu bauen:

```dockerfile
FROM ghcr.io/manchtools/open-docs:latest
COPY ./content/ /app/src/content/
RUN bun run build
```

Starten Sie dieses Image ohne `/content`-Mount, liefert es Ihre vorgebaute
Site aus – ohne Build (und ohne 2 GB) zur Laufzeit.

## Deployments unter einem Unterpfad

Um unter einem Unterpfad zu hosten (zum Beispiel
`https://example.com/docs`), setzen Sie `BASE_PATH`:

```sh
-e BASE_PATH=/docs
```

Alle internen Links, Assets und der Suchindex werden mit diesem Präfix
erzeugt.

## Umgebung

Jede `PUBLIC_*`-Variable wird in den Build eingebacken. Siehe
[Konfiguration](/de/customizing/configuration) für das Site-Chrome und
[Umgebungsvariablen](/de/reference/environment-variables) für die
vollständige Liste.
