---
title: Umgebungsvariablen
label: Umgebung
---

# Umgebungsvariablen

Jede Variable wird zur Laufzeit gelesen, wenn der Container startet (nur
`BASE_PATH` wird einkompiliert). In Docker setzen Sie sie mit `-e` bei
`docker run`; aus dem Quellcode setzen Sie sie in Ihrer Shell oder einer
`.env`-Datei.

## Site-Chrome

<!-- docref: begin src=src/lib/server/site.ts#siteConfig:c0130420 -->

| Variable | Default | Wirkung |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Markentext in der oberen Leiste. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Untertitel neben der Marke. Leer blendet ihn aus. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo-Pfad unter `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Browser-Titel und `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generischer Text_ | Standard-Meta und `og:description`. |
| `PUBLIC_SITE_URL` | _(leer)_ | Vollständige Basis-URL, z. B. `https://docs.example.com`. **Bei jedem Produktions-Deployment setzen:** aktiviert kanonische URLs, `sitemap.xml`, `robots.txt`, `llms.txt` und absolute Links in den **Atom-Feeds** des Blogs; ohne sie bleiben all diese relativ und der Server warnt beim Start. Siehe [SEO & KI-Suche](/de/customizing/seo). |
| `PUBLIC_REPO_URL` | _(leer)_ | Zeigt einen GitHub-Link in Navigation und Footer, wenn gesetzt. |

<!-- docref: end -->

Die `theme-color` des mobilen Browsers (die Tönung des Chrome) wird hier
nicht gesetzt. Sie folgt automatisch Ihrem `--primary`-Token, sowohl im
hellen als auch im dunklen Modus. Siehe [Theming](/de/customizing/theming).

## Standardsprache

<!-- docref: begin src=src/lib/server/store-instance.ts#@default-lang:f15bbd57 -->
| Variable | Default | Wirkung |
|---|---|---|
| `PUBLIC_DEFAULT_LANG` | `en` | Standardsprache für URLs ohne Präfix. Siehe [Mehrsprachigkeit](/de/authoring/multi-language). |
<!-- docref: end -->

## Content-Token

<!-- docref: begin src=scripts/tokens.js#buildTokenMap:27895886 -->
| Variable | Wirkung |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Stellt `{{<NAME>}}` als Platzhalter im Fließtext bereit, ersetzt beim Parsen des Inhalts zum Start. Siehe [Content-Token](/de/customizing/content-tokens). |
<!-- docref: end -->

## Deployment

<!-- docref: begin src=svelte.config.js#@base-path:7d3ca0de -->
| Variable | Default | Wirkung |
|---|---|---|
| `BASE_PATH` | _(leer)_ | Präfix für Deployments unter einem Unterpfad, z. B. `/docs`. Die einzige Einstellung zur Bauzeit – ihre Änderung baut die App-Shell beim Start neu. |
<!-- docref: end -->

<!-- docref: begin src=scripts/docker-entrypoint.sh#@port:c28baa83 -->
| Variable | Default | Wirkung |
|---|---|---|
| `PORT` | `3000` | Port, auf dem der Server lauscht (Container). |
<!-- docref: end -->

## Container-Mounts

Diese gelten nur für das Docker-Image und richten den Entrypoint auf
alternative Quellverzeichnisse aus. Die meisten Nutzer ändern sie nie.

<!-- docref: begin src=src/lib/server/store-instance.ts#contentDir:9be957b8 -->
| Variable | Default | Wirkung |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Verzeichnis, das nach `src/content/` kopiert wird. |
<!-- docref: end -->

<!-- docref: begin src=src/lib/server/store-instance.ts#@static-dir:14dedbae -->
| Variable | Default | Wirkung |
|---|---|---|
| `OPEN_DOCS_STATIC` | `/static` | Verzeichnis, das in `static/` zusammengeführt wird. |
<!-- docref: end -->

{% callout type="info" title="PUBLIC_ ist kein Präfix für Geheimnisse" %}
`PUBLIC_*`-Werte werden an den Browser ausgeliefert und sind für
jeden sichtbar, der die Site ansieht. Hinterlegen Sie darin niemals
Geheimnisse.
{% /callout %}
