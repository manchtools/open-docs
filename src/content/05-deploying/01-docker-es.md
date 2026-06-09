---
title: Despliegue con Docker
label: Docker
---

# Despliegue con Docker

La forma recomendada de ejecutar open-docs es el contenedor publicado. Una
única imagen genérica sirve cualquier conjunto de documentos; el contenido se
proporciona en tiempo de ejecución.

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -v ./static:/static:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  -e PUBLIC_REPO_URL="https://github.com/me/my-project" \
  ghcr.io/manchtools/open-docs:latest
```

Abre `http://localhost:3000`.

## Montajes

| Montaje | Apunta a | Contiene |
|---|---|---|
| `/content` | `src/content/` | Tus archivos `.md` / `.markdoc` y, opcionalmente, `theme.css`. |
| `/static` | `static/` | Favicons, `og.png`, capturas de pantalla. Se fusionan sobre los valores por defecto. |

Ambos montajes son opcionales. El montaje de contenido puede ser de solo
lectura (`:ro`); el entrypoint lo copia al árbol de la imagen antes de compilar.

{% callout type="info" title="Ejecutar sin nada montado" %}
Sin un montaje en `/content`, la imagen sirve la propia documentación de
open-docs, una demo en vivo que puedes recorrer antes de añadir tu propio
contenido.
{% /callout %}

## Cómo se produce una compilación

La imagen incluye la documentación por defecto **ya compilada**, de modo
que un `docker run` normal (sin montajes ni variables de entorno) la sirve
de inmediato usando casi nada de memoria. Solo se recompila al arrancar
cuando personalizas: montas contenido o static, o defines `PUBLIC_*` /
`BASE_PATH`:

```mermaid
flowchart LR
  A[Container starts] --> B{Customized?}
  B -- no --> S[Serve the pre-built site]
  B -- yes --> C[Copy /content + /static in]
  C --> D[bun run build]
  D --> E[Pagefind indexes the pages]
  E --> S
```

La compilación es el paso pesado: el bundling de la aplicación alcanza algo
menos de 2 GB de memoria, sin importar cuántas páginas tengas (Mermaid y
Shiki se pre-empaquetan aparte con esbuild, lo que evita un pico aún mayor).
Ejecutarla una vez al construir la imagen mantiene ligero un `docker run`
normal.

Para servir documentos **propios** en un host con poca memoria, hornéalos
en una imagen pequeña en tu máquina de compilación en lugar de recompilar
al arrancar:

```dockerfile
FROM ghcr.io/manchtools/open-docs:latest
COPY ./content/ /app/src/content/
RUN bun run build
```

Ejecuta esa imagen sin montaje `/content` y servirá tu sitio precompilado,
sin compilación (ni esa memoria) en tiempo de ejecución.

## Despliegues bajo subruta

Para alojar bajo una subruta (por ejemplo `https://example.com/docs`), define
`BASE_PATH`:

```sh
-e BASE_PATH=/docs
```

Todos los enlaces internos, los recursos y el índice de búsqueda se generan con
ese prefijo.

## Entorno

Cada variable `PUBLIC_*` se integra en la compilación. Consulta
[Configuración](/es/customizing/configuration) para los elementos del sitio y
[Variables de entorno](/es/reference/environment-variables) para la lista
completa.
