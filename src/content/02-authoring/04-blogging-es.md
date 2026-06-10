---
title: Blogs
description: "Convierte cualquier sección en un blog con blog: true — entradas con fecha, un listado generado, autores, etiquetas y un feed Atom, junto a tu documentación."
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

Una entrada es una página de Markdown normal con una fecha:

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/paul
tags: release, open-source
cover: screenshots/launch.png
description: How we launched, and what comes next.
---
```

| Clave | Obligatorio | Efecto |
|---|---|---|
| `date` | sí | `YYYY-MM-DD`. Clave de ordenación y fecha mostrada (localizada). Una fecha ausente o mal formada hace fallar la validación al arrancar. |
| `author` | no | Un nombre para mostrar, o una ruta absoluta del sitio a una [página de autor](#los-autores-son-paginas). |
| `tags` | no | Separadas por comas. Se muestran como chips y se recogen en páginas `/<section>/tags/<tag>`. |
| `cover` | no | Imagen dentro de `static/`. Se renderiza como un hero a ancho completo en la entrada, como miniatura en el listado y como imagen de la tarjeta social de la entrada. |
| `draft` | no | `true` sirve la entrada solo en desarrollo; producción la excluye en todas partes. |

Los nombres de archivo son libres (`launch-post.md` → `/blog/launch-post`);
la fecha vive solo en el frontmatter. Las entradas usan su propia
navegación Más reciente/Más antigua y nunca se mezclan en la cadena
anterior/siguiente de la documentación.

## El listado

El `index.md` de la sección renderiza primero su propia prosa y después
la lista de entradas generada: portada, fecha localizada, tiempo de
lectura, autor, descripción y etiquetas. No hay nada que mantener.

## Los autores son páginas

Coloca los autores en una carpeta `authors/` dentro de la sección del
blog. Las páginas que hay allí son páginas de perfil, no entradas (no
necesitan fecha y nunca se listan):

```markdown
---
title: Paul Dotterer        # blog/authors/paul.md
avatar: authors/paul.png    # under static/
---

Builds manchtools.
```

Una entrada con `author: /blog/authors/paul` toma el nombre del `title`
de esa página, la imagen de `avatar:` y enlaza la firma a la página. Una
ruta que no se resuelve hace fallar la validación. Un simple
`author: Paul Dotterer` también funciona: sin página, sin avatar, cero
configuración.

## Bloques hero y avatar

Dos bloques pensados para blogs, utilizables en cualquier parte:

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/paul.png" name="Paul Dotterer" description="Builds manchtools." /%}
```

Colocado justo después de un hero, la imagen del avatar
**se solapa con el borde inferior del hero hasta la mitad de su altura**:
la clásica cabecera con foto de portada. Ambos se renderizan con
normalidad por sí solos. Una entrada con `cover:` recibe el hero
automáticamente.

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

Cada sección de blog sirve un feed Atom en `/<section>/feed.xml`
(también por idioma: `/de/blog/feed.xml`). Define `PUBLIC_SITE_URL`
para que las entradas lleven enlaces absolutos. Las páginas del blog
anuncian el feed con un `<link rel="alternate">`.

{% callout type="info" title="Varios blogs por sitio" %}
`blog: true` es por sección: un sitio de documentación puede llevar a la
vez un blog, un registro de cambios y un feed de avisos, cada uno
independiente.
{% /callout %}
