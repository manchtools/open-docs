---
title: Introducción
---

# open-docs

{% boost weight=8 %}
**open-docs** es un sitio de documentación que se distribuye como contenedor.
Coloca tus archivos Markdown (o [Markdoc](https://markdoc.dev/)) en un
directorio, apunta un contenedor a él y obtienes un sitio de documentación
con búsqueda, modo oscuro y resaltado de sintaxis, sin ningún paso de build
que configurar ni framework que aprender.
{% /boost %}

El sitio que estás leyendo ahora mismo *es* open-docs renderizando su propia
documentación. Todo lo que ves aquí viene incluido en la imagen de contenedor
por defecto, así que un `docker run` nuevo sin montar contenido aterriza en
estas páginas.

## Por qué existe

La mayoría de los generadores de documentación son una dependencia que añades
a un repositorio y compilas tú mismo. open-docs es lo contrario: una
**imagen genérica en la que montas contenido**. La misma imagen publicada
sirve cualquier conjunto de documentos. Tú aportas el Markdown; la imagen
aporta el tema, el renderizado y la búsqueda.

Por eso encaja bien cuando quieres:

- Levantar documentación para un proyecto sin añadir una cadena de
  herramientas a su repositorio.
- Mantener un manual interno o una base de conocimiento a partir de una
  carpeta de Markdown.
- Separar de forma clara contenido y presentación.

## Qué obtienes

- **Navegación derivada de carpetas.** La barra lateral se construye a partir
  del árbol de directorios, así que no hay ningún archivo de navegación que
  mantener sincronizado. Consulta
  [Navegación](/es/navigation/folder-derived-nav).
- **Búsqueda de texto completo**, indexada automáticamente al arrancar con
  [Pagefind](https://pagefind.app) y ajustada para documentación. Consulta
  [Búsqueda](/es/customizing/search).
- **Modo claro / oscuro** con un selector en la barra superior.
- **Resaltado de sintaxis** mediante [Shiki](https://shiki.style) y
  **diagramas** mediante [Mermaid](https://mermaid.js.org). Consulta
  [Código y diagramas](/es/authoring/blocks/media/code-and-diagrams).
- **Temas** desde un único `theme.css` que colocas junto a tu
  contenido. Consulta [Temas](/es/customizing/theming).
- **Personalización de marca por variable de entorno** (nombre, logo, colores,
  enlace al repositorio) para que una sola imagen sirva muchos sitios. Consulta
  [Configuración](/es/customizing/configuration).
- **Bloques de contenido** (callouts, pestañas, capturas) sobre Markdown
  plano. Consulta [Callouts y pestañas](/es/authoring/blocks/callouts-and-tabs).
- **Modo blog por sección.** Marca una carpeta como blog y obtén entradas
  con fecha, listados, autores, etiquetas y feeds. Consulta
  [Blogs](/es/authoring/blogging).
- **Tu Markdown existente funciona tal cual.** Las convenciones de
  GitHub/VSCode (enlaces relativos, `README.md`, imágenes junto al
  archivo) se mantienen. Consulta
  [Markdown existente](/es/authoring/bring-existing-markdown).
- **Traducciones por sufijo en el nombre de archivo.** Añade `-de.md` (o
  cualquier idioma) junto a una página y se sirve bajo `/de/…`. Consulta
  [Multiidioma](/es/authoring/multi-language).

## Siguientes pasos

Ve al [Inicio rápido](/es/getting-started/quick-start) para tener un sitio
en marcha en menos de un minuto, y luego lee
[Estructura del contenido](/es/getting-started/content-layout) para aprender
cómo tus archivos se convierten en páginas.
