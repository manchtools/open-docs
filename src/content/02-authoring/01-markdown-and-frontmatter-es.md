---
title: Markdown y frontmatter
label: Markdown
---

# Markdown y frontmatter

Escribe las páginas en Markdown plano. Todos los elementos estándar funcionan:

- **Encabezados** (`#` … `######`). Cada uno recibe un id de ancla y alimenta
  la tabla de contenidos de la página, a la derecha.
- **Listas**, ordenadas y sin ordenar, con anidamiento.
- **Enlaces**, internos (`/getting-started/quick-start`) y externos.
  Los enlaces relativos al estilo del editor, como `./sibling.md`,
  también se resuelven respecto al archivo; consulta
  [Markdown existente](/es/authoring/bring-existing-markdown).
  Los enlaces externos se abren automáticamente en una pestaña nueva con
  atributos `rel` seguros.
- **Imágenes** (`![alt](./diagram.png)`), junto a tu Markdown o dentro
  de `static/`.
- **Listas de tareas** (`- [ ]` / `- [x]`) y **notas al pie** (`[^1]`).
- **Énfasis**, `código en línea`, citas, tablas y reglas horizontales.

## Encabezados y la tabla de contenidos

<!-- docref: begin src=src/lib/server/markdown.ts#applyHeadingAnchors:a5e8b91f -->

El primer encabezado `#` es el título de la página que se muestra arriba del
contenido. Los encabezados `##` y `###` rellenan la tabla de contenidos del
panel derecho y se convierten en anclas enlazables, de modo que puedes
enlazar directamente a una sección.

<!-- docref: end -->

## Frontmatter

<!-- docref: begin src=src/lib/server/content-store.ts#frontmatter:641087be -->

Un bloque YAML opcional al principio del archivo controla cómo aparece la
página en la **barra lateral**:

```markdown
---
title: Installing the CLI
label: Install
order: 2
---

# Installing the CLI
```

| Clave | Efecto |
|---|---|
| `title` | Título completo usado en la barra lateral y en los enlaces anterior/siguiente. |
| `label` | Etiqueta más corta para la barra lateral, cuando el título es largo. Alias: `sidebar_label`. |
| `order` | Posición de orden dentro del grupo. Tiene prioridad sobre cualquier prefijo numérico del nombre de archivo. |
| `description` | Descripción meta para los motores de búsqueda y el índice `llms.txt`. Si falta, se usa el primer párrafo de la página. Consulta [SEO y búsqueda con IA](/es/customizing/seo). |

El `index.md` de una sección entiende una clave más, `icon`, que establece el
icono de esa sección en la tarjeta de la página de inicio. Consulta
[Iconos de sección](/es/navigation/folder-derived-nav#iconos-de-seccion). Un
`index.md` también acepta `blog: true` para convertir su sección en un blog;
consulta [Blogs](/es/authoring/blogging). Las entradas de blog añaden sus
propias claves (`date`, `author`, `tags`, `cover`, `draft`), tratadas también
en [Blogs](/es/authoring/blogging). Una página con `meta: true` queda fuera de
la barra lateral y de los enlaces anterior/siguiente y se lista en el pie de
página; consulta [Orden y títulos](/es/navigation/ordering-and-titles).

El frontmatter es opcional. Sin él, el título se deriva del nombre de archivo
y las páginas se ordenan alfabéticamente (o por su prefijo numérico). Consulta
[Orden y títulos](/es/navigation/ordering-and-titles) para conocer el modelo
de orden completo.

{% callout type="warn" title="Mantén el frontmatter escalar" %}
Para la navegación solo se leen líneas simples `clave: valor`. Los valores YAML
anidados o en lista se ignoran a efectos de la barra lateral.
{% /callout %}

<!-- docref: end -->
