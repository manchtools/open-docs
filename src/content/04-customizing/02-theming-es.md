---
title: Personalización del tema
---

# Personalización del tema

Coloca un **`theme.css`** en la raíz de tu contenido y open-docs lo carga
después de su propia hoja de estilos, de modo que tus reglas siempre
ganan. No necesitas hacer un fork del proyecto ni reconstruir la imagen.

{% filetree %}
- content/
  - index.md
  - guides/
    - install.md
  - theme.css — tus anulaciones
{% /filetree %}

En Docker, el archivo se toma de tu montaje de contenido; no hay nada más
que configurar.

## Dos capas para anular

### Tokens de diseño (recomendado)

El sitio se construye sobre un conjunto de propiedades personalizadas de
CSS. Cambia unas pocas y el resto de la interfaz (navegación, botones,
texto, búsqueda) se reestiliza para combinar, tanto en modo claro como
oscuro.

{% code title="theme.css" %}
```css
:root {
  --primary: oklch(0.55 0.21 264);   /* brand accent */
  --radius: 0.5rem;                  /* corner rounding */
}
.dark {
  --primary: oklch(0.7 0.16 264);
}
```
{% /code %}

Tokens habituales: `--primary`, `--background`, `--foreground`,
`--sidebar`, `--sidebar-accent`, `--muted`, `--border`, `--radius` y
`--font-sans`. Los colores usan `oklch()` para combinar con el tema de
serie, pero funciona cualquier color CSS válido.

Los elementos visuales del navegador móvil (el tinte de
`<meta name="theme-color">`) siguen a `--primary`, así que combina con tu
acento en ambos modos. No hay un color aparte que definir.

### Clases de componentes

Para ajustes estructurales que los tokens no alcanzan, apunta
directamente a las clases. Este archivo se carga el último, así que gana
a los valores por defecto con la misma especificidad.

{% code title="theme.css" %}
```css
.prose h1 { letter-spacing: -0.02em; }
.prose a  { text-decoration-thickness: 2px; }
```
{% /code %}

## Modo oscuro

El modo claro/oscuro lo controla una clase `.dark` que el interruptor de
tema de la barra superior activa en `<html>`. Coloca las anulaciones para
el modo oscuro bajo un selector `.dark { … }`, como arriba. No hay nada
más que conectar.

{% callout type="info" title="Empieza desde el ejemplo" %}
El repositorio incluye un `theme.example.css` comentado. Cópialo a la
raíz de tu contenido como `theme.css` y edita a partir de ahí.
{% /callout %}
