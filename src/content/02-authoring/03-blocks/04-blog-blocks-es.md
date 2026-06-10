---
title: Bloques de blog
label: Bloques de blog
description: Imágenes hero, avatares de autor, citas destacadas y galerías de imágenes, pensados para entradas y utilizables en cualquier página.
---

# Bloques de blog

Cuatro bloques que llegaron con el [modo blog](/es/authoring/blogging).
Funcionan en cualquier página; en las entradas algunos también aparecen
automáticamente.

## Hero

Una imagen a ancho completo, opcionalmente con un título superpuesto:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="The landing page" title="Big news" subtitle="Optional line below" /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="La página de inicio" title="Grandes noticias" subtitle="Línea opcional debajo" /%}

Como primer bloque de una página se pega al borde superior. Una entrada
que empieza con un hero no necesita el frontmatter `cover:`; la imagen
del listado y de la tarjeta social se derivan de él.

## Avatar

Una tarjeta de autor. Justo después de un hero, la imagen se solapa con
él hasta la mitad, la clásica cabecera con foto de portada:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-de-dark.png" name="Ada Lovelace" description="Builds manchtools." /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="Portada" /%}
{% avatar src="/screenshots/open-docs-home-de-dark.png" name="Ada Lovelace" description="Construye manchtools." /%}

Por sí solo se renderiza con el espaciado normal. En las entradas, la
firma bajo el título usa el mismo componente, alimentado por el
frontmatter `author:`.

## Quote

```markdown
{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}
```

{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
La máquina analítica teje patrones algebraicos igual que el telar de Jacquard teje flores y hojas.
{% /quote %}

## Gallery

Las imágenes de Markdown normales dentro de la etiqueta se disponen como
una cuadrícula; cada imagen se abre en el diálogo, donde los botones de
flecha (o ← / →) recorren todas las imágenes de la página:

```markdown
{% gallery %}
![Light](/screenshots/open-docs-home.png)
![Dark](/screenshots/open-docs-home-de-dark.png)
![German](/screenshots/open-docs-home-fr.png)
{% /gallery %}
```

{% gallery %}
![Claro](/screenshots/open-docs-home.png)
![Oscuro](/screenshots/open-docs-home-de-dark.png)
![Alemán](/screenshots/open-docs-home-fr.png)
{% /gallery %}
