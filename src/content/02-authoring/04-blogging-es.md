---
title: Blogs
description: "Convierte cualquier sección en un blog con blog: true y obtén entradas con fecha, un listado generado, autores, etiquetas y un feed Atom, junto a tu documentación."
---

# Blogs

Cualquier sección puede ser un blog. Define `blog: true` en el `index.md`
de la sección y sus páginas se convierten en **entradas**: ordenadas por
fecha de más reciente a más antigua, listadas automáticamente en la
página de la sección, con navegación Más reciente/Más antigua, páginas
de etiquetas y un feed Atom. La documentación y los blogs conviven en un
mismo árbol de contenido: el [registro de cambios](/es/changelog) de
este sitio es exactamente una sección así.

```markdown
---
blog: true        # in blog/index.md
---
```

## Entradas

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

Una entrada es una página de Markdown normal con una fecha:

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/ada
tags: release, open-source
description: How we launched, and what comes next.
---
```

| Clave | Obligatorio | Efecto |
|---|---|---|
| `date` | sí | `YYYY-MM-DD`. Clave de ordenación y fecha mostrada (localizada). Una fecha ausente o mal formada hace fallar la validación al arrancar. |
| `author` | no | Un nombre para mostrar, o una ruta absoluta del sitio a una [página de autor](#los-autores-son-paginas). |
| `tags` | no | Separadas por comas. Se muestran como chips y se recogen en páginas `/<section>/tags/<tag>`. |
| `cover` | no | Imagen dentro de `static/`. Se renderiza como un hero a ancho completo en la entrada, como miniatura en el listado y como imagen de la tarjeta social de la entrada. Las entradas que empiezan con un bloque `{% hero %}` no la necesitan: se usa la imagen del hero. |
| `draft` | no | `true` sirve la entrada solo en desarrollo; producción la excluye en todas partes. |

Los nombres de archivo son libres (`launch-post.md` → `/blog/launch-post`);
la fecha vive solo en el frontmatter. Las entradas usan su propia
navegación Más reciente/Más antigua y nunca se mezclan en la cadena
anterior/siguiente de la documentación.

<!-- docref: end -->

## El listado

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

El `index.md` de la sección renderiza primero su propia prosa y después
la lista de entradas generada: portada, fecha localizada, tiempo de
lectura, autor, descripción y etiquetas. El tiempo de lectura es el
número de palabras de la entrada a 200 palabras por minuto, redondeado,
con un mínimo de un minuto.

<!-- docref: end -->

## Los autores son páginas

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->

Coloca los autores en una carpeta `authors/` dentro de la sección del
blog. Las páginas que hay allí son páginas de perfil, no entradas (no
necesitan fecha y nunca se listan):

```markdown
---
title: Ada Lovelace        # blog/authors/ada.md
avatar: authors/ada.png    # under static/
---

Builds manchtools.
```

Una entrada con `author: /blog/authors/ada` toma el nombre del `title`
de esa página, la imagen de `avatar:` y enlaza la firma a la página. Una
ruta que no se resuelve hace fallar la validación. Un simple
`author: Ada Lovelace` también funciona: sin página, sin avatar, cero
configuración.

La misma referencia funciona en el bloque `{% avatar %}`, de modo que un
autor se declara una sola vez y se reutiliza en todas partes:

```markdown
{% avatar author="/blog/authors/ada" /%}
```

El nombre, la imagen, la bio (el primer párrafo de la página) y el
enlace vienen todos de la página del autor; cualquier atributo definido
explícitamente gana. En resumen: el frontmatter `author:` son
*metadatos* (listado, firma, feed), el bloque `{% avatar %}` es la
*tarjeta visual*, y ambos pueden apuntar a la misma página.

<!-- docref: end -->

## Bloques hero y avatar

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props:2d0e6d15 -->

Dos bloques pensados para blogs, utilizables en cualquier parte:

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/ada.png" name="Ada Lovelace" description="Builds manchtools." /%}
```

En vivo, con las imágenes de demostración incluidas:

{% hero src="/screenshots/open-docs-home.png" alt="Portada de demo" title="Grandes noticias" subtitle="El avatar de abajo se superpone a la mitad" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Ada Lovelace" description="Construye manchtools." /%}

Colocado justo después de un hero, la imagen del avatar
**se solapa con el borde inferior del hero hasta la mitad de su altura**:
la clásica cabecera con foto de portada. Ambos se renderizan con
normalidad por sí solos. Una entrada con `cover:` recibe el hero
automáticamente.

<!-- docref: end -->

## Quote y gallery

```markdown
{% quote by="Ada Lovelace" cite="https://example.com" %}
The engine weaves algebraic patterns.
{% /quote %}

{% gallery %}
![first](/screenshots/a.png)
![second](/screenshots/b.png)
{% /gallery %}
```

Las imágenes de la galería se disponen en una cuadrícula adaptable y se
amplían en el diálogo como cualquier imagen.

## Feeds

<!-- docref: begin src=src/lib/server/feed.ts#buildAtomFeed:2ed9f5ab -->

Cada sección de blog sirve un feed Atom en `/<section>/feed.xml`
(también por idioma: `/de/blog/feed.xml`). Cada entrada lleva el
**cuerpo completo del artículo** en `<content type="html">`
junto al breve `<summary>`, de modo que las plataformas de sindicación
(dev.to/Forem, Medium) y los lectores de feeds importan el artículo
entero —bloques de código e imágenes incluidos— y no un resumen de una
línea.

El cuerpo se renderiza mediante un **perfil de feed** propio a partir de
la misma fuente Markdoc que usa la página (no se extrae del HTML de la
página), por lo que queda **limpio para el lector**: encabezados simples
(sin anclas de copia ni iconos), sin pesos `data-pagefind`, sin envoltorio
de maquetación. Los bloques interactivos se degradan a equivalentes
estáticos —las galerías pasan a figuras simples; hero/avatar/captura a un
`<img>` sin cromo de ventana; mermaid a su fuente como bloque de código—,
porque los lectores de feeds no ejecutan JavaScript.

Define `PUBLIC_SITE_URL` para que cada `id` del feed y de las entradas,
el enlace `rel="self"` y cada enlace de entrada sean URLs **absolutas**
(con prefijo de idioma y compatibles con `BASE_PATH`), y para que las
imágenes con ruta raíz del cuerpo se resuelvan fuera del sitio. dev.to
usa el enlace de una entrada como `canonical_url`, y muchos lectores no
toleran los ids relativos. Sin `PUBLIC_SITE_URL` el feed sigue
funcionando, pero permanece relativo y no está listo para sindicación: el
servidor registra un aviso al arrancar.

Las páginas del blog anuncian el feed con un `<link rel="alternate">`, y
el `h1` del índice del blog lleva un botón para copiar la URL del feed
junto al botón habitual de copiar el enlace de la página.

<!-- docref: end -->

{% callout type="info" title="Varios blogs por sitio" %}
`blog: true` es por sección: un sitio de documentación puede llevar a la
vez un blog, un registro de cambios y un feed de avisos, cada uno
independiente.
{% /callout %}
