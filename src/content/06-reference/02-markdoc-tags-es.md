---
title: Etiquetas de Markdoc
label: Etiquetas de Markdoc
---

# Etiquetas de Markdoc

<!-- docref: begin src=src/lib/markdoc/tags.svelte:7c5c0d6c -->

Una referencia de los bloques personalizados que se añaden sobre Markdown,
junto con los elementos de Markdown mejorados. Para su uso con ejemplos,
consulta [Creación de contenido](/es/authoring).

<!-- docref: end -->

## Etiquetas personalizadas

### callout

<!-- docref: begin src=src/lib/markdoc/components/Callout.svelte#@props:04ebd609 -->

```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Atributo | Valores | Por defecto |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | cadena | _(ninguno)_ |

<!-- docref: end -->

### tabs / tab

<!-- docref: begin src=src/lib/markdoc/components/Tabs.svelte#@props:17c65a4f,src/lib/markdoc/components/Tab.svelte#@props:0ce05808 -->

````markdown
{% tabs labels="One, Two" initial="One" %}
  {% tab label="One" %} … {% /tab %}
  {% tab label="Two" %} … {% /tab %}
{% /tabs %}
````

| Etiqueta | Atributo | Notas |
|---|---|---|
| `tabs` | `labels` | Lista separada por comas de todas las pestañas, en orden. Obligatorio. |
| `tabs` | `initial` | Pestaña abierta al cargar. Por defecto, la primera. |
| `tab` | `label` | Debe coincidir con un nombre del `labels` del padre. Obligatorio. |

<!-- docref: end -->

### screenshot

<!-- docref: begin src=src/lib/markdoc/components/Screenshot.svelte#@props:f0667444 -->

```markdown
{% screenshot src="ui.png" alt="The UI" caption="…" dark="ui-dark.png"
   variant="frame" width="720px" /%}
```

| Atributo | Obligatorio | Notas |
|---|---|---|
| `src` | sí | Archivo dentro de `static/screenshots/`. |
| `alt` | sí | Descripción accesible. |
| `caption` | no | Texto del pie de imagen. |
| `dark` | no | Imagen alternativa para el modo oscuro. |
| `variant` | no | `frame` (por defecto) o `flat`. |
| `width` | no | Ancho máximo, p. ej. `720px`. |

Las imágenes `![]()` de Markdown plano también se renderizan con este
componente, en la variante `flat`.

<!-- docref: end -->

### steps / step

<!-- docref: begin src=src/lib/markdoc/components/Steps.svelte#@props:26850e43,src/lib/markdoc/components/Step.svelte#@props:ed2ce0a8 -->

````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` admite un `title` opcional. La numeración es automática.

<!-- docref: end -->

### cards / card

<!-- docref: begin src=src/lib/markdoc/components/Cards.svelte#@props:26850e43,src/lib/markdoc/components/Card.svelte#@props:c82718eb -->

````markdown
{% cards %}
  {% card title="…" href="/path" icon="🚀" %} description {% /card %}
{% /cards %}
````

| Etiqueta | Atributo | Notas |
|---|---|---|
| `card` | `title` | Encabezado de la tarjeta. |
| `card` | `href` | Enlace opcional (ruta interna o URL externa). |
| `card` | `icon` | Emoji, `<svg>` en línea o una ruta dentro de `static/`. |

<!-- docref: end -->

### accordions / accordion

<!-- docref: begin src=src/lib/markdoc/components/AccordionGroup.svelte#@props:84cfb144,src/lib/markdoc/components/Accordion.svelte#@props:ed2ce0a8 -->

````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Etiqueta | Atributo | Notas |
|---|---|---|
| `accordion` | `title` | El texto del resumen. `<details>` nativo. |
| `accordions` | `exclusive` | Envoltorio de grupo; `true` (por defecto) abre uno a la vez, `false` permite varios. Opcional; `accordion` también funciona por sí solo. |

<!-- docref: end -->

### badge

<!-- docref: begin src=src/lib/markdoc/components/Badge.svelte#@props:69aebe45 -->

```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Pastilla en línea. `variant`: `default`, `info`, `success`, `warning`, `danger`.

<!-- docref: end -->

### filetree

<!-- docref: begin src=src/lib/markdoc/components/FileTree.svelte#@props:26850e43 -->

```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Da estilo a una lista anidada de Markdown como un árbol de directorios (las
carpetas y los archivos se detectan automáticamente).

<!-- docref: end -->

### embed

<!-- docref: begin src=src/lib/markdoc/components/Embed.svelte#@props:36691986 -->

```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Iframe de vídeo adaptable. Las URL de YouTube/Vimeo se normalizan y la lista de
permitidos de iframes de la CSP se deriva automáticamente de tus inserciones.

<!-- docref: end -->

### code

<!-- docref: begin src=src/lib/markdoc/components/Code.svelte#@props:ed2ce0a8 -->

````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

Añade un encabezado con el nombre del archivo a un bloque de código vallado
(Markdoc descarta los metadatos de la valla, así que el nombre del archivo viaja
en este envoltorio).

<!-- docref: end -->

### boost

<!-- docref: begin src=src/lib/markdoc/components/Boost.svelte#@props:b07730c2 -->

```markdown
{% boost weight=8 %}
This passage is pushed harder in the search index.
{% /boost %}
```

Indicación invisible de posicionamiento en la búsqueda. Renderiza el contenido
sin cambios, pero le da más peso en Pagefind. El texto del cuerpo tiene peso `1`
y los encabezados `10`/`5`/`3`, de modo que `weight` (por defecto `5`) eleva un
pasaje clave por encima del texto corriente. Úsalo solo cuando los pesos de
encabezado integrados no basten para destacar algo.

<!-- docref: end -->

### columns / column

<!-- docref: begin src=src/lib/markdoc/components/Columns.svelte#@props:26850e43,src/lib/markdoc/components/Column.svelte#@props:671be0b5 -->

Columnas en paralelo que se apilan en móvil, con un máximo de tres por fila; una
cuarta pasa a la fila siguiente. Dos columnas ocupan 50/50, tres se reparten en
tercios.

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

<!-- docref: end -->

### grid

<!-- docref: begin src=src/lib/markdoc/components/Grid.svelte#@props:7451a1f3,src/lib/markdoc/components/Column.svelte#@props:671be0b5 -->

Una cuadrícula adaptable para disponer el contenido en formas distintas a una
única columna de arriba abajo. `cols` (1–3, por defecto 2) fija el número de
pistas en pantallas grandes; las celdas se apilan en una sola columna en móvil.
Una celda puede abarcar varias pistas con `{% column span=2 %}`.

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

<!-- docref: end -->

### hero

<!-- docref: begin src=src/lib/markdoc/components/Hero.svelte#@props:35a1e113 -->

Una cabecera de imagen a ancho completo con un título superpuesto opcional. Se
pega al borde superior cuando es el primer bloque. El frontmatter `cover:` de
una entrada de blog renderiza una automáticamente.

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="…" subtitle="…" /%}
```

<!-- docref: end -->

### avatar

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props:2d0e6d15 -->

Una tarjeta de autor: imagen redonda, nombre, biografía y enlace opcionales.
Justo después de un `hero`, la imagen se solapa con el borde inferior del hero
hasta la mitad de su altura.

```markdown
{% avatar src="/authors/ada.png" name="Ada" description="…" url="…" /%}
```

<!-- docref: end -->

### quote

<!-- docref: begin src=src/lib/markdoc/components/Quote.svelte#@props:df46ce79 -->

Una cita destacada con una atribución opcional (enlazada cuando se define
`cite`).

```markdown
{% quote by="Ada Lovelace" cite="https://…" %}Body.{% /quote %}
```

<!-- docref: end -->

### gallery

<!-- docref: begin src=src/lib/markdoc/components/Gallery.svelte#@props:26850e43 -->

Una cuadrícula de imágenes adaptable; cada imagen se amplía en el diálogo.

```markdown
{% gallery %}
![a](/img/a.png)
![b](/img/b.png)
{% /gallery %}
```

<!-- docref: end -->

## Markdown mejorado

<!-- docref: begin src=src/lib/markdoc/nodes.svelte:52c58f22 -->

Estos no necesitan sintaxis especial. El Markdown corriente obtiene el
comportamiento automáticamente:

| Elemento | Comportamiento |
|---|---|
| Encabezados | Reciben ids de ancla y alimentan la tabla de contenidos; cada `h1` lleva un botón para copiar el enlace de la página, y los botones de copia se ven tenues en reposo y más marcados al pasar el cursor. |
| Enlaces | Los enlaces externos se abren en una pestaña nueva con atributos `rel` seguros. |
| Enlaces relativos (`./x.md`) | Se resuelven respecto al archivo, así que los enlaces al estilo del editor siguen funcionando. |
| Imágenes (`![]()`) | Se renderizan con el componente de captura (variante `flat`); los archivos relativos al contenido se sirven, y el visor pasa por ellos como un carrusel. |
| Listas de tareas (`- [ ]`) | Se renderizan como casillas de verificación. |
| Notas al pie (`[^1]`) | Enlaces numerados en superíndice con sus definiciones reunidas al final de la página. |
| Bloques de código | Resaltado de sintaxis (Shiki) con un botón de copiar; los comentarios `// [!code highlight]` / `++` / `--` añaden resaltado de líneas y diffs. |
| Vallas `mermaid` | Se renderizan como diagramas con tema. |

El HTML en línea nunca se renderiza y las URL sueltas se quedan como
texto plano.

{% callout type="info" title="Los atributos reflejan las props del componente" %}
Los atributos de cada etiqueta son las props del componente de Svelte que hay
detrás, así que ambos nunca se desincronizan. Añadir una prop a un componente la
convierte automáticamente en un atributo válido.
{% /callout %}

<!-- docref: end -->
