---
title: Estructura del contenido
---

# Estructura del contenido

Todo lo que muestra el sitio proviene de un único directorio de Markdown. En
Docker ese directorio es lo que montes en `/content`; desde el código fuente
es `src/content/`. El resto (rutas, barra lateral, búsqueda) se deriva de él.

## Un árbol típico

{% filetree %}
- content/
  - theme.css — estilos personalizados opcionales
  - 01-getting-started/
    - 01-introduction.md
    - 02-quick-start.md
  - 02-reference/
    - index.md — la página de inicio de la sección
    - api.md
{% /filetree %}

Esto produce:

- Una **barra lateral** con dos grupos, "Primeros pasos" y "Referencia".
- Rutas en `/getting-started/introduction`, `/getting-started/quick-start`,
  `/reference` (el índice de la sección) y `/reference/api`.
- Un **índice de búsqueda** que cubre todas las páginas.

## Las reglas

<!-- docref: begin src=src/lib/slug.ts#cleanSlug:9c51ef45,src/lib/slug.ts#stripPrefix:b2742e12,src/lib/slug.ts#titleFromSegment:d11d1ecd -->

- **Los archivos se convierten en páginas.** `reference/api.md` → `/reference/api`.
- **Las carpetas de primer nivel se convierten en grupos de la barra lateral.**
  Los archivos que contienen se convierten en los elementos de ese grupo.
- **Los nombres de archivo se convierten en URLs**, en formato kebab: `quick-start.md` →
  `/…/quick-start`.
- **El `index.md` de una carpeta** es la página de inicio de esa sección,
  servida en la URL de la carpeta (`reference/index.md` → `/reference`).
  Un `README.md` funciona igual cuando no hay `index.md`.
- **Los prefijos numéricos iniciales** como `01-` establecen el orden y se
  eliminan de la URL y del título. Consulta
  [Orden y títulos](/es/navigation/ordering-and-titles).

<!-- docref: end -->

{% callout type="info" title="La página de inicio" %}
La página principal del sitio (`/`) es un hero generado que lista tus secciones
como tarjetas; no es un archivo Markdown. Coloca tu primera página real dentro
de un grupo, como hace este sitio con
[Introducción](/es/getting-started/introduction).
{% /callout %}

## Qué se ignora

Solo los archivos `.md` y `.markdoc` dentro del directorio de contenido se
convierten en páginas. Un `theme.css` se toma para los
[estilos](/es/customizing/theming). Los archivos no Markdown que tus páginas
referencian (imágenes y similares) se sirven desde la carpeta de contenido;
los archivos de trabajo sin referenciar (borradores, notas, archivos `.txt`)
permanecen invisibles, así que puedes mantenerlos junto a tu documentación.

Las imágenes pueden vivir justo al lado de tu Markdown y enlazarse como tu
editor espera (`![diagram](./images/arch.png)`); se sirven desde la carpeta
de contenido. Consulta
[Markdown existente](/es/authoring/bring-existing-markdown). El directorio
`static/` sigue existiendo para recursos compartidos como los favicons.
