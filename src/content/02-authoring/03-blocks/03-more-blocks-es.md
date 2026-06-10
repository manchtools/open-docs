---
title: Más bloques
---

# Más bloques

## Acordeón

Despliegue plegable para preguntas frecuentes y detalles opcionales, con
animación y soporte de teclado. Envuelve varios en `{% accordions %}`
para crear un grupo donde abrir uno cierra los demás, como las pestañas. Ese
es el comportamiento por defecto; añade `exclusive=false` para dejar varios
abiertos a la vez.

{% accordions %}
{% accordion title="¿open-docs necesita una base de datos?" %}
No. Las páginas se renderizan directamente desde tu Markdown; no hay nada que instalar ni administrar.
{% /accordion %}
{% accordion title="¿Puedo alojarlo yo mismo?" %}
Sí. Ejecuta el contenedor donde quieras, o compila desde el código fuente y
ejecuta el servidor incluido.
{% /accordion %}
{% accordion title="¿Admite carpetas anidadas?" %}
Hasta tres niveles de profundidad. Consulta la
[navegación derivada de carpetas](/es/navigation/folder-derived-nav).
{% /accordion %}
{% /accordions %}

```markdown
{% accordions %}
{% accordion title="Your question?" %}
The answer, in Markdown.
{% /accordion %}
{% accordion title="Another question?" %}
Opening this one closes the first.
{% /accordion %}
{% /accordions %}
```

## Distintivo

Pequeñas etiquetas de estado en línea para títulos y elementos de lista.

- Función estable
- Sincronización en tiempo real {% badge variant="success" %}Nuevo{% /badge %}
- Webhooks {% badge variant="warning" %}Beta{% /badge %}
- Exportación XML {% badge variant="danger" %}Obsoleto{% /badge %}

```markdown
Webhooks {% badge variant="warning" %}Beta{% /badge %}
```

Variantes: `default`, `info`, `success`, `warning`, `danger`.

## Árbol de archivos

Renderiza un árbol de directorios a partir de una lista anidada. Las carpetas
(elementos que anidan una lista) y los archivos se detectan por ti, sin marcado
especial.

{% filetree %}
- content/
  - index.md
  - getting-started/
    - introduction.md
    - quick-start.md
  - theme.css
- static/
  - favicon.svg
{% /filetree %}

````markdown
{% filetree %}
- content/
  - index.md
  - getting-started/
    - quick-start.md
{% /filetree %}
````

## Incrustar

Inserta un vídeo. Los enlaces de YouTube y Vimeo se normalizan
automáticamente a su forma de incrustación respetuosa con la privacidad.

{% embed src="https://youtu.be/aqz-KE-bpKQ" title="Big Buck Bunny" /%}

```markdown
{% embed src="https://youtu.be/VIDEO_ID" title="A short clip" /%}
```

La lista de permitidos de los iframe en la CSP se deriva automáticamente de los
bloques `{% embed %}` de tu contenido (incluidas las URL proporcionadas
mediante un `{{TOKEN}}`), así que no hay nada que configurar.

## Columnas

Distribuye el contenido en paralelo. Las columnas se limitan a tres por fila y
se apilan en móvil: dos llenan 50/50, tres se reparten en tercios y una cuarta
salta de línea.

{% columns %}
{% column %}
{% callout type="info" title="Izquierda" %}Primera columna de contenido.{% /callout %}
{% /column %}
{% column %}
{% callout type="success" title="Derecha" %}Segunda columna.{% /callout %}
{% /column %}
{% /columns %}

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

## Cuadrícula

Para distribuciones que van más allá de una sola columna, una cuadrícula
adaptable. `cols` (1–3, por defecto 2) fija el número de columnas en pantallas
más grandes; las celdas se apilan en móvil. Una celda puede abarcar varias
pistas con `{% column span=2 %}`.

{% grid cols=3 %}
{% column %}
{% callout type="info" title="a" %}Una celda.{% /callout %}
{% /column %}
{% column span=2 %}
{% callout type="success" title="b — abarca 2" %}Una celda más ancha.{% /callout %}
{% /column %}
{% /grid %}

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

## Listas de tareas

No es una etiqueta: la sintaxis GFM normal se muestra como casillas de verificación.

```markdown
- [x] write the docs
- [ ] translate them
- [ ] ship the release
```

- [x] escribir la documentación
- [ ] preparar las traducciones
- [ ] publicar la versión

## Notas al pie

También es Markdown normal: un `[^ref]` se convierte en un enlace numerado en superíndice, y la definición aparece al final de la página.

```markdown
The engine was proposed in 1837[^babbage].

[^babbage]: By Charles Babbage, with notes by Ada Lovelace.
```

La máquina se propuso en 1837[^babbage].

[^babbage]: Por Charles Babbage, con notas de Ada Lovelace.
