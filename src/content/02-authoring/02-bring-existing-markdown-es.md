---
title: Trae tu Markdown existente
label: Markdown existente
description: Qué funciona cuando apuntas open-docs a Markdown escrito para GitHub o VSCode, y los límites deliberados.
---

# Trae tu Markdown existente

<!-- docref: begin src=src/lib/server/markdown.ts:097d96d1 -->

Una carpeta de Markdown escrito para GitHub, VSCode u otro generador se
renderiza sin reescribir nada. Las convenciones en las que se apoyan
esas herramientas se mantienen:

- **Enlaces relativos.** `[setup](./guides/setup.md)`, `../intro.md` y
  `other.md#section` se resuelven respecto al archivo que enlaza,
  exactamente igual que los sigue tu editor. La terminación `.md` y los
  prefijos `01-` pasan por las reglas de URL habituales. Las rutas
  absolutas del sitio (`/guides/setup`) siguen funcionando sin cambios.
- **`README.md` es la página de la carpeta.** Cuando una carpeta no
  tiene `index.md`, su `README.md` asume ese papel.
- **Imágenes junto a tu Markdown.** `![diagram](./images/arch.png)` se
  renderiza en su sitio y el archivo se sirve desde tu carpeta de
  contenido; no hace falta moverlo a `static/`. Cada imagen de Markdown,
  ya sea relativa, absoluta o una URL web, se muestra a través del marco
  de captura en su variante simple.
- **Listas de tareas.** `- [ ]` y `- [x]` se renderizan como casillas de
  verificación.
- **Notas al pie.** Las referencias `[^1]` se convierten en enlaces
  numerados en superíndice, con las definiciones listadas al final de la
  página.
- **Tablas, tachado, bloques de código, citas** funcionan como Markdown
  estándar; los bloques de código reciben resaltado de sintaxis y un
  botón de copiar.

Todo lo demás llega automáticamente: la navegación a partir del árbol de
carpetas, la búsqueda, las anclas de encabezado y la tabla de
contenidos, los archivos SEO y el modo oscuro.

<!-- docref: end -->

## Límites deliberados

Dos cosas quedan desactivadas por diseño, no por omisión:

{% callout type="info" title="El HTML nunca se renderiza" %}
open-docs renderiza Markdown, no HTML. Las etiquetas en línea como
`<details>` aparecen como el texto que escribiste. Para mostrar marcado
como ejemplo, ponlo en un bloque de código. No hay lista de permitidos
ni excepciones; así la estricta política de seguridad queda intacta.
{% /callout %}

{% callout type="info" title="Las URL sueltas siguen siendo texto" %}
`https://example.com` pegado como texto plano no se convierte en enlace.
Hacer algo clicable es decisión del autor: escribe
`[example](https://example.com)` o `<https://example.com>`.
{% /callout %}

<!-- docref: begin src=src/lib/server/markdown.ts#stripHtmlComments:41367d9c -->
Los encabezados Setext (subrayados con `===` o `---`) no reciben ids de
ancla; usa encabezados `#`. Los comentarios HTML (`<!-- … -->`) se
eliminan, de modo que las notas de revisión nunca llegan a los lectores.
<!-- docref: end -->
