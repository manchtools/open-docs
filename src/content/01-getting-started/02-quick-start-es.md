---
title: Inicio rápido
---

# Inicio rápido

Pon en marcha un sitio de documentación en menos de un minuto.

{% tabs labels="Docker, Desde el código fuente" initial="Docker" %}
{% tab label="Docker" %}

Monta un directorio de Markdown en `/content` y abre el puerto:

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  ghcr.io/manchtools/open-docs:latest
```

Abre `http://localhost:3000`. El contenedor analiza tu contenido al
arrancar —un par de segundos— y renderiza las páginas sobre la marcha;
la búsqueda queda disponible momentos después. Ejecútalo sin montar nada
y obtienes esta documentación como demo en vivo.

{% /tab %}
{% tab label="Desde el código fuente" %}

```sh
bun install
PUBLIC_BRAND_NAME="My Project" bun run dev
```

Coloca tus archivos `.md` / `.markdoc` en `src/content/`. El servidor de
desarrollo recarga en caliente al guardar.

{% /tab %}
{% /tabs %}

{% callout type="info" title="¿Sin contenido? Sin problema." %}
Si no montas nada, el contenedor sirve la propia documentación de open-docs,
así que puedes navegar por un sitio real antes de escribir una sola página.
{% /callout %}

## La versión de 30 segundos

{% steps %}
{% step title="Añade contenido" %}
Crea una carpeta con uno o dos archivos Markdown.
{% /step %}
{% step title="Apunta open-docs a ella" %}
Móntala en `/content` (Docker) o colócala en `src/content/` (desde el código fuente).
{% /step %}
{% step title="Abre el sitio" %}
La barra lateral, el índice de búsqueda y las rutas se generan por ti.
{% /step %}
{% /steps %}

## A dónde ir después

{% cards %}
{% card title="Estructura del contenido" href="/es/getting-started/content-layout" icon="🗂️" %}
Cómo los archivos se asignan a páginas y a la barra lateral.
{% /card %}
{% card title="Redacción" href="/es/authoring" icon="✍️" %}
Markdown, callouts, pestañas, código y diagramas.
{% /card %}
{% card title="Despliegue con Docker" href="/es/deploying/docker" icon="🐳" %}
Montajes, entorno y notas de producción.
{% /card %}
{% /cards %}
