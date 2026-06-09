---
title: Desde el código fuente
---

# Desde el código fuente

Para edición local o alojamiento propio sin Docker, ejecuta open-docs
directamente. [Bun](https://bun.sh) es el gestor de paquetes y el entorno de
ejecución.

## Desarrollo

```sh
bun install
bun run dev
```

Coloca tus archivos `.md` / `.markdoc` en `src/content/` y el servidor de
desarrollo recarga en caliente al guardar. Define cualquier variable `PUBLIC_*`
en línea para previsualizar la marca:

```sh
PUBLIC_BRAND_NAME="My Project" bun run dev
```

## Compilar y previsualizar

```sh
bun run build      # production build → ./build/
bun run preview    # serve the built site
```

La compilación pre-renderiza cada página a HTML estático y luego ejecuta
[Pagefind](https://pagefind.app) sobre el resultado para producir el índice de
búsqueda.

## Objetivos del Makefile

Un `Makefile` envuelve los comandos habituales:

| Comando | Hace |
|---|---|
| `make install` | Instala las dependencias. |
| `make dev` | Servidor de desarrollo con recarga en caliente. |
| `make check` | Comprobación de tipos con `svelte-check`. |
| `make build` | Compilación de producción en `./build/`. |
| `make preview` | Sirve la compilación de producción. |
| `make docker` | Compila la imagen de contenedor localmente. |

## Alojar el resultado

La compilación produce la aplicación más un pequeño servidor Bun que analiza
el contenido al arrancar y renderiza las páginas en el servidor. Ejecútalo en
cualquier sitio donde funcione Bun; necesita muy poca memoria.
