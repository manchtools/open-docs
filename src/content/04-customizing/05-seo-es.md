---
title: SEO y búsqueda con IA
description: "Cómo open-docs hace que el sitio generado sea descubrible por los motores de búsqueda y legible por las herramientas de IA: metadatos por página, sitemap.xml, robots.txt y llms.txt."
---

# SEO y búsqueda con IA

Cada página se renderiza en el servidor, así que los motores de
búsqueda y los rastreadores de IA obtienen el contenido completo sin
ejecutar JavaScript. Además, open-docs genera metadatos por página y los
archivos de descubrimiento estándar.

## Define la URL de tu sitio

Define `PUBLIC_SITE_URL` con la URL base completa donde se sirven los
docs, sin barra final:

```sh
-e PUBLIC_SITE_URL="https://docs.example.com"
```

Este es el único valor que necesitan los archivos de descubrimiento. Con
él definido, cada página obtiene una URL canónica absoluta, `sitemap.xml`
y `robots.txt` apuntan a direcciones reales y los enlaces de `llms.txt`
resuelven. Si se deja vacío, el sitio sigue funcionando y los archivos
siguen generándose, pero se omiten las etiquetas canónica y `og:url`,
y el sitemap recurre a enlaces de solo ruta.

Si los docs viven bajo una subruta (por ejemplo
`https://example.com/docs`), incluye esa subruta en `PUBLIC_SITE_URL`.

## Metadatos por página

<!-- docref: begin src=src/lib/components/seo.svelte:5453cc33,src/lib/server/content-store.ts#firstParagraph:d52ff1f7 -->

Cada página emite su propio `<title>`, `<meta name="description">`,
enlace canónico y etiquetas de tarjeta de Open Graph / Twitter. Los
valores provienen del frontmatter de la página:

```markdown
---
title: Installing the CLI
description: Install the command-line tool on macOS, Linux, and Windows.
---
```

- El **título** es el `title` de la página. La pestaña del navegador y
  `og:title` muestran `<page title> · <brand name>`; la página de inicio
  usa el título del sitio por sí solo.
- La **descripción** es el `description` del frontmatter. Si lo omites,
  open-docs recurre al primer párrafo de la página, de modo que cada
  página tiene una descripción utilizable aunque no se haya escrito a
  mano.

`brandName`, el título del sitio y la descripción por defecto provienen
de las variables de entorno de [configuración](/es/customizing/configuration).

<!-- docref: end -->

## Entradas de blog y feeds

Las entradas de una [sección de blog](/es/authoring/blogging) llevan
metadatos adicionales: etiquetas `article:published_time` y
`article:author` a partir del frontmatter de la entrada, y la imagen
`cover` de la entrada como imagen de la tarjeta social. El feed Atom de
la sección se anuncia en sus páginas mediante `<link rel="alternate">`,
así que los lectores de feeds lo descubren automáticamente.

## sitemap.xml

<!-- docref: begin src=src/routes/sitemap.xml/+server.ts:f1e7500f -->

`/sitemap.xml` lista la página de inicio y todas las páginas de contenido
y legales. Se reconstruye a partir del mismo árbol de carpetas que usa la
navegación, así que añadir un archivo Markdown lo añade al sitemap sin
ningún paso extra.

<!-- docref: end -->

## robots.txt

<!-- docref: begin src=src/routes/robots.txt/+server.ts:dc592638 -->

`/robots.txt` permite todos los rastreadores y los dirige al sitemap
(cuando `PUBLIC_SITE_URL` está definido). Reemplázalo dejando tu propio
`robots.txt` en los recursos estáticos del sitio.

<!-- docref: end -->

## llms.txt

<!-- docref: begin src=src/routes/llms.txt/+server.ts:a1589926 -->
`/llms.txt` es un índice [llms.txt](https://llmstxt.org) para asistentes
y rastreadores de IA: el título del sitio, un resumen de una línea y luego
cada página agrupada por sección con su descripción y enlace. Le da a un
modelo el mapa completo de tus docs en un único archivo pequeño y
orientado a enlaces. Como el sitemap, se genera a partir de tu contenido,
así que nunca se queda desactualizado.
<!-- docref: end -->
