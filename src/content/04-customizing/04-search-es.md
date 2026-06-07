---
title: Búsqueda
---

# Búsqueda

Cada sitio open-docs incluye **búsqueda de texto completo**, con
[Pagefind](https://pagefind.app). El índice se construye a partir de tus
páginas en el momento del despliegue y se sirve como archivos estáticos,
así que no hay servidor de búsqueda y sigue funcionando sin conexión.
Ábrela desde el cuadro de la barra superior o con
**⌘K / Ctrl&nbsp;K**.

## Qué se indexa

Solo se indexa el **cuerpo de cada página**. Los elementos visuales que
lo rodean quedan fuera para que no contaminen los resultados:

- la barra lateral, la barra superior y el pie;
- los enlaces **anterior / siguiente**, que repiten los títulos de las
  páginas vecinas;
- la tabla de contenidos de la página;
- el marcador de posición "Rendering diagram…" de los bloques Mermaid.

## Cómo se clasifican los resultados

open-docs ajusta Pagefind para documentación por defecto; no hay nada que
configurar:

- **Los encabezados pesan más que el texto del cuerpo.** Un término en el
  título o un encabezado de una página cuenta más que la misma palabra en
  un párrafo, de modo que la página más relevante aparece primero (los
  títulos son los que más pesan, luego `##`, luego `###`).
- **Se priorizan las coincidencias exactas.** Las coincidencias más
  cercanas a lo que escribiste se clasifican por encima de las difusas o
  parciales, ya que las búsquedas en documentación suelen ser precisas.
- **Las páginas largas no se penalizan.** Una página exhaustiva no pierde
  frente a un esbozo que por casualidad menciona el término una vez.

Si haces un fork de open-docs, estos ajustes están en
`src/lib/components/search.svelte`.

## Subir un pasaje en el ranking

Cuando el peso de los encabezados no basta, por ejemplo una definición
clave situada en mitad de una página larga, envuélvela en un bloque
`{% boost %}` para darle más peso en el índice. Se renderiza sin cambios y
solo afecta a la búsqueda.

```markdown
{% boost weight=8 %}
The container builds the site at start, so one image serves any docset.
{% /boost %}
```

Consulta la [referencia de etiquetas de Markdoc](/es/reference/markdoc-tags)
para la escala de pesos.
