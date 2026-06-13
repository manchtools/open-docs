---
title: Variables de entorno
label: Entorno
---

# Variables de entorno

Cada variable se lee en tiempo de ejecución, cuando arranca el contenedor
(solo `BASE_PATH` se integra en la compilación). En Docker, defínelas con `-e` en
`docker run`; desde el código fuente, defínelas en tu shell o en un archivo
`.env`.

## Elementos del sitio

<!-- docref: begin src=src/lib/server/site.ts#siteConfig:c0130420 -->

| Variable | Por defecto | Efecto |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Texto de marca en la barra superior. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Subtítulo junto a la marca. Vacío lo oculta. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Ruta del logotipo dentro de `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Título del navegador y `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _descripción genérica_ | Meta por defecto y `og:description`. |
| `PUBLIC_SITE_URL` | _(vacío)_ | URL base completa, p. ej. `https://docs.example.com`. **Defínela en cada despliegue de producción:** habilita las URL canónicas, `sitemap.xml`, `robots.txt`, `llms.txt` y los enlaces absolutos en los **feeds Atom** del blog; sin ella, todo eso queda relativo y el servidor avisa al arrancar. Consulta [SEO y búsqueda con IA](/es/customizing/seo). |
| `PUBLIC_REPO_URL` | _(vacío)_ | Muestra un enlace a GitHub en la navegación y el pie de página cuando se define. |

<!-- docref: end -->

El `theme-color` del navegador móvil (el tinte de la interfaz) no se define
aquí. Sigue automáticamente tu token `--primary`, tanto en modo claro como
oscuro. Consulta [Temas](/es/customizing/theming).

## Idioma por defecto

<!-- docref: begin src=src/lib/server/store-instance.ts#@default-lang:f15bbd57 -->
| Variable | Por defecto | Efecto |
|---|---|---|
| `PUBLIC_DEFAULT_LANG` | `en` | Idioma por defecto para las URL sin prefijo. Consulta [Multiidioma](/es/authoring/multi-language). |
<!-- docref: end -->

## Tokens de contenido

<!-- docref: begin src=scripts/tokens.js#buildTokenMap:27895886 -->
| Variable | Efecto |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Expone `{{<NAME>}}` como marcador de posición dentro del texto, sustituido cuando el contenido se analiza al arrancar. Consulta [Tokens de contenido](/es/customizing/content-tokens). |
<!-- docref: end -->

## Despliegue

<!-- docref: begin src=svelte.config.js#@base-path:7d3ca0de -->
| Variable | Por defecto | Efecto |
|---|---|---|
| `BASE_PATH` | _(vacío)_ | Prefijo de despliegue bajo subruta, p. ej. `/docs`. El único ajuste de tiempo de compilación: cambiarlo reconstruye el shell de la app al arrancar. |
<!-- docref: end -->

<!-- docref: begin src=scripts/docker-entrypoint.sh#@port:c28baa83 -->
| Variable | Por defecto | Efecto |
|---|---|---|
| `PORT` | `3000` | Puerto en el que escucha el servidor (contenedor). |
<!-- docref: end -->

## Montajes del contenedor

Solo se aplican a la imagen de Docker y apuntan el entrypoint a directorios de
origen alternativos. La mayoría de los usuarios nunca los cambian.

<!-- docref: begin src=src/lib/server/store-instance.ts#contentDir:9be957b8 -->
| Variable | Por defecto | Efecto |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Directorio que se copia en `src/content/`. |
<!-- docref: end -->

<!-- docref: begin src=src/lib/server/store-instance.ts#@static-dir:14dedbae -->
| Variable | Por defecto | Efecto |
|---|---|---|
| `OPEN_DOCS_STATIC` | `/static` | Directorio que se fusiona en `static/`. |
<!-- docref: end -->

{% callout type="info" title="PUBLIC_ no es un prefijo para secretos" %}
Los valores `PUBLIC_*` se entregan al navegador y son visibles para
cualquiera que vea el sitio. Nunca pongas secretos en ellos.
{% /callout %}
