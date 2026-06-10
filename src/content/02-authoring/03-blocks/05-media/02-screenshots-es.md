---
title: Capturas de pantalla
---

# Capturas de pantalla

El bloque `screenshot` renderiza una imagen con marco de navegador opcional,
un pie y una variante separada para modo oscuro. Las imágenes se resuelven
desde `static/screenshots/`. Haz clic en cualquier imagen para ampliarla en un
visor; desde ahí puedes pasar por todas las imágenes de la página con los
botones de flecha o las teclas ← y →, como un carrusel manual. Los
controles de ventana del marco se adaptan al sistema operativo del lector
(macOS, Windows o Linux).

Esta es la página de inicio de open-docs, renderizada por este mismo bloque:

{% screenshot
   src="open-docs-home-es.png"
   alt="La página de inicio de open-docs"
   dark="open-docs-home-es-dark.png"
   caption="La página de inicio de open-docs. Los controles de ventana de arriba coinciden con tu sistema." /%}

```markdown
{% screenshot
   src="dashboard.png"
   alt="The project dashboard"
   caption="The dashboard after first login"
   dark="dashboard-dark.png"
   variant="frame"
   width="720px" /%}
```

## Atributos

| Atributo | Obligatorio | Efecto |
|---|---|---|
| `src` | sí | Archivo de imagen en `static/screenshots/`. |
| `alt` | sí | Descripción accesible. |
| `caption` | no | Pie mostrado debajo de la imagen. |
| `dark` | no | Imagen alternativa usada cuando el modo oscuro está activo. |
| `variant` | no | `frame` (marco de navegador simulado, por defecto) o `flat` (imagen con borde). |
| `width` | no | Ancho máximo, p. ej. `720px`. Por defecto, el ancho de la columna de contenido. |

## Imágenes de Markdown plano

Las imágenes `![alt](path)` corrientes se renderizan implícitamente con este
mismo componente, en la variante `flat` y sin marco de ventana. Los archivos
que están junto al Markdown se sirven en su sitio, así que las rutas
relativas al estilo del editor funcionan sin más. Recurre al bloque explícito
cuando quieras el marco de navegador, un pie o una variante para modo oscuro.

## Añadir los archivos de imagen

Coloca los archivos en tu directorio estático:

{% filetree %}
- static/
  - screenshots/
    - dashboard.png
    - dashboard-dark.png
{% /filetree %}

En Docker, monta tus recursos en `/static`. Se fusionan con el `static/` de la
imagen, así que solo sobrescribes lo que aportas. Consulta
[Recursos estáticos](/es/customizing/configuration#recursos-estaticos).

Como alternativa, mantén las imágenes junto al Markdown que las referencia y
enlázalas de forma relativa; consulta
[Markdown existente](/es/authoring/bring-existing-markdown).

{% callout type="warn" title="Referencia archivos reales" %}
Un `screenshot` que apunte a una imagen inexistente hace fallar la validación
cuando el sitio arranca. Añade el archivo antes de referenciarlo.
{% /callout %}
