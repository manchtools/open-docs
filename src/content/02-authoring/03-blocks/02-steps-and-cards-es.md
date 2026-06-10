---
title: Pasos y tarjetas
---

# Pasos y tarjetas

## Pasos

Guía a quien lee por un procedimiento ordenado. Los números se generan
automáticamente, así que puedes reordenarlos con libertad.

{% steps %}
{% step title="Instala las dependencias" %}
Consíguelo todo con el gestor de paquetes que prefieras.

```sh
bun install
```
{% /step %}
{% step title="Añade una página" %}
Coloca un archivo Markdown en tu carpeta de contenido. La ruta y la entrada de
la barra lateral aparecen solas.
{% /step %}
{% step title="Ejecútalo" %}
Arranca el servidor de desarrollo y abre `http://localhost:3000`.
{% /step %}
{% /steps %}

````markdown
{% steps %}
{% step title="Install dependencies" %}
Body Markdown, including code blocks.
{% /step %}
{% step title="Run it" %} … {% /step %}
{% /steps %}
````

## Tarjetas

Tarjetas de enlace para páginas de resumen y de aterrizaje. Cada `card` admite
un `title`, un `href` y un `icon` opcionales (un emoji, un `<svg>` en línea o
una ruta dentro de `static/`).

{% cards %}
{% card title="Inicio rápido" href="/es/getting-started/quick-start" icon="🚀" %}
Pon en marcha un sitio en menos de un minuto.
{% /card %}
{% card title="Temas" href="/es/customizing/theming" icon="🎨" %}
Añade un `theme.css` para cambiar todo el estilo.
{% /card %}
{% card title="Markdoc" href="https://markdoc.dev" icon="🧩" %}
El sistema de etiquetas sobre el que se construyen estos bloques.
{% /card %}
{% card title="Anidamiento" href="/es/navigation/folder-derived-nav" icon="🗂️" %}
Las carpetas se convierten en secciones plegables de la barra lateral.
{% /card %}
{% /cards %}

````markdown
{% cards %}
{% card title="Quick start" href="/getting-started/quick-start" icon="🚀" %}
Get a running site in under a minute.
{% /card %}
{% /cards %}
````
