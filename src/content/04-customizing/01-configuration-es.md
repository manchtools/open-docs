---
title: Configuración
---

# Configuración

Toda la configuración se hace mediante **variables de entorno**, leídas
cuando arranca el contenedor: cambiar una supone un reinicio, no una
recompilación. Defínelas en el comando `docker run`, en un archivo
`.env` o en tu shell. Nada de esto requiere editar el código fuente.

## Elementos visuales del sitio

| Variable | Valor por defecto | Efecto |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Texto de la marca en la barra superior. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Subtítulo pequeño junto a la marca. Vacío lo oculta. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Ruta del logo dentro de `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Título de la pestaña del navegador y `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _texto genérico_ | Meta + `og:description`. |
| `PUBLIC_REPO_URL` | _(vacío)_ | Si se define, muestra un enlace a GitHub en la navegación y el pie. |

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="Acme" \
  -e PUBLIC_BRAND_TAGLINE="handbook" \
  -e PUBLIC_SITE_TITLE="Acme Handbook" \
  -e PUBLIC_REPO_URL="https://github.com/acme/handbook" \
  ghcr.io/manchtools/open-docs:latest
```

Para la lista completa, incluidas las variables de tiempo de despliegue,
consulta [Variables de entorno](/es/reference/environment-variables).

## Recursos estáticos

Los favicons, las imágenes de tarjeta social y las capturas de pantalla
viven en `static/`:

{% filetree %}
- static/
  - favicon.svg — se usa como logo por defecto
  - favicon-16.png
  - favicon-32.png
  - apple-touch-icon.png
  - og.png — imagen de tarjeta social
  - screenshots/
    - dashboard.png
{% /filetree %}

Solo `favicon.svg` es obligatorio; los PNG de respaldo y `og.png` son
opcionales y se omiten si no están. En Docker, monta tu directorio
`static/` en `/static`. Se **fusiona** con los valores por defecto de la
imagen en lugar de reemplazarlos, así que sobrescribir un archivo deja
los demás en su sitio.

Incluye una variante `-dark` junto a cualquier icono
(`favicon-32-dark.png`, `apple-touch-icon-dark.png`, …) y el icono de la
pestaña del navegador seguirá automáticamente el selector de modo oscuro
del sitio.

## Tema y tokens

- Para reestilizar el sitio, añade un `theme.css`. Consulta
  [Personalización del tema](/es/customizing/theming).
- Para inyectar valores de entorno en el texto, usa tokens de
  contenido. Consulta [Tokens de contenido](/es/customizing/content-tokens).
