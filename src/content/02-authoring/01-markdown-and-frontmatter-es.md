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
  Los enlaces externos se abren automáticamente en una pestaña nueva con
  atributos `rel` seguros.
- **Énfasis**, `código en línea`, citas, tablas y reglas horizontales.

## Encabezados y la tabla de contenidos

El primer encabezado `#` es el título de la página que se muestra arriba del
contenido. Los encabezados `##` y `###` rellenan la tabla de contenidos del
panel derecho y se convierten en anclas enlazables, de modo que puedes
enlazar directamente a una sección.

## Frontmatter

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
[Iconos de sección](/es/navigation/folder-derived-nav#section-icons).

El frontmatter es opcional. Sin él, el título se deriva del nombre de archivo
y las páginas se ordenan alfabéticamente (o por su prefijo numérico). Consulta
[Orden y títulos](/es/navigation/ordering-and-titles) para conocer el modelo
de orden completo.

{% callout type="warn" title="Mantén el frontmatter escalar" %}
Para la navegación solo se leen líneas simples `clave: valor`. Los valores YAML
anidados o en lista se ignoran a efectos de la barra lateral.
{% /callout %}
