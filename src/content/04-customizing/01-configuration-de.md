---
title: Konfiguration
---

# Konfiguration

Die gesamte Konfiguration erfolgt über **Umgebungsvariablen**, die zur
Build-Zeit gelesen und fest in die Website eingebacken werden. Setzen Sie sie
im `docker run`-Befehl, in einer `.env`-Datei oder in Ihrer Shell. Nichts
davon erfordert das Bearbeiten des Quellcodes.

## Rahmen der Website

| Variable | Standard | Wirkung |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Markentext in der oberen Leiste. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Kleiner Untertitel neben der Marke. Leer blendet ihn aus. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo-Pfad unter `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Titel des Browser-Tabs und `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generischer Text_ | Meta + `og:description`. |
| `PUBLIC_REPO_URL` | _(leer)_ | Wenn gesetzt, zeigt einen GitHub-Link in Navigation und Footer. |
| `PUBLIC_THEME_COLOR` | `#6366F1` | `<meta name="theme-color">`. |

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="Acme" \
  -e PUBLIC_BRAND_TAGLINE="handbook" \
  -e PUBLIC_SITE_TITLE="Acme Handbook" \
  -e PUBLIC_REPO_URL="https://github.com/acme/handbook" \
  ghcr.io/manchtools/open-docs:latest
```

Die vollständige Liste, einschließlich der Variablen zur Deploy-Zeit, finden
Sie unter [Umgebungsvariablen](/de/reference/environment-variables).

## Statische Assets

Favicons, Social-Card-Bilder und Screenshots liegen unter `static/`:

{% filetree %}
- static/
  - favicon.svg — als Standard-Logo verwendet
  - favicon-16.png
  - favicon-32.png
  - apple-touch-icon.png
  - og.png — Social-Card-Bild
  - screenshots/
    - dashboard.png
{% /filetree %}

Nur `favicon.svg` ist erforderlich; die PNG-Fallbacks und `og.png` sind
optional und werden übersprungen, wenn sie fehlen. In Docker mounten Sie Ihr
Verzeichnis `static/` unter `/static`. Es wird mit den Standardwerten des
Images **zusammengeführt**, statt sie zu ersetzen, sodass das Überschreiben
einer Datei den Rest unangetastet lässt.

## Theming und Tokens

- Um die Website umzugestalten, fügen Sie eine `theme.css` hinzu. Siehe
  [Theming](/de/customizing/theming).
- Um Build-Zeit-Werte in den Fließtext einzufügen, verwenden Sie
  Content-Tokens. Siehe [Content-Tokens](/de/customizing/content-tokens).
