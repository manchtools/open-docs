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

| Variable | Default | Wirkung |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Markentext in der oberen Leiste. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Untertitel neben der Marke. Leer blendet ihn aus. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo-Pfad unter `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Browser-Titel und `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generischer Text_ | Standard-Meta und `og:description`. |
| `PUBLIC_SITE_URL` | _(leer)_ | Vollständige Basis-URL, z. B. `https://docs.example.com`. Aktiviert kanonische URLs, `sitemap.xml`, `robots.txt` und `llms.txt`. Siehe [SEO & KI-Suche](/de/customizing/seo). |
| `PUBLIC_DEFAULT_LANG` | `en` | Standardsprache für URLs ohne Präfix. Siehe [Mehrsprachigkeit](/de/authoring/multi-language). |
| `PUBLIC_REPO_URL` | _(leer)_ | Zeigt einen GitHub-Link in Navigation und Footer, wenn gesetzt. |

Die `theme-color` des mobilen Browsers (die Tönung des Chrome) wird hier
nicht gesetzt. Sie folgt automatisch Ihrem `--primary`-Token, sowohl im
hellen als auch im dunklen Modus. Siehe [Theming](/de/customizing/theming).

## Content-Token

| Variable | Wirkung |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Stellt `{{<NAME>}}` als Platzhalter im Fließtext bereit, ersetzt beim Parsen des Inhalts zum Start. Siehe [Content-Token](/de/customizing/content-tokens). |

## Deployment

| Variable | Default | Wirkung |
|---|---|---|
| `BASE_PATH` | _(leer)_ | Präfix für Deployments unter einem Unterpfad, z. B. `/docs`. |
| `PORT` | `3000` | Port, auf dem der Server lauscht (Container). |

## Container-Mounts

Diese gelten nur für das Docker-Image und richten den Entrypoint auf
alternative Quellverzeichnisse aus. Die meisten Nutzer ändern sie nie.

| Variable | Default | Wirkung |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Verzeichnis, das nach `src/content/` kopiert wird. |
| `OPEN_DOCS_STATIC` | `/static` | Verzeichnis, das in `static/` zusammengeführt wird. |

{% callout type="info" title="PUBLIC_ ist kein Präfix für Geheimnisse" %}
`PUBLIC_*`-Werte werden an den Browser ausgeliefert und sind für
jeden sichtbar, der die Site ansieht. Hinterlegen Sie darin niemals
Geheimnisse.
{% /callout %}
