---
title: Orden y títulos
---

# Orden y títulos

El orden alfabético rara vez coincide con el orden de lectura:
"Avanzado" iría antes que "Instalar". open-docs te da dos formas de fijar
el orden, ambas derivadas del propio contenido. No interviene ningún
archivo de navegación externo.

## Prefijos numéricos

Antepón a un archivo o carpeta un `NN-` (también `NN_` o `NN.`). El
número fija la posición de orden y se **elimina** de la URL y del título.

```
content/
  01-get-started/
    01-install.md       → /get-started/install   (sorts 1st)
    02-configure.md     → /get-started/configure  (sorts 2nd)
  02-reference/         → group "Reference" (sorts after "Get started")
```

Así, `01-get-started/02-install.md` produce la URL
`/get-started/install`, el título "Install" y se ordena en segundo lugar
dentro de un grupo que a su vez se ordena primero. Los prefijos también
funcionan en carpetas, que es la forma de ordenar los **grupos**.

## Frontmatter

Para un control más fino, define claves en el frontmatter de una página.
El frontmatter prevalece sobre el nombre del archivo.

```markdown
---
title: Installing the command-line tool
label: Install
order: 2
---
```

| Clave | Efecto |
|---|---|
| `title` | Título completo (barra lateral + anterior/siguiente). |
| `label` | Etiqueta corta para la barra lateral cuando el título es largo. Alias `sidebar_label`. |
| `order` | Posición de orden; anula un prefijo numérico. |
| `meta` | `true` mantiene la página fuera de la barra lateral y de anterior/siguiente, y en su lugar la lista en el pie, para una página legal o de aviso legal que algunas regiones exigen. |

## Combinar ambos

Un patrón habitual: usar prefijos numéricos en las **carpetas** para
ordenar los grupos y dejar que los archivos se ordenen por sus propios
prefijos. Recurre al `label` del frontmatter solo cuando un título sea
demasiado largo para la barra lateral.

{% callout type="success" title="Este sitio hace exactamente eso" %}
Cada grupo que ves en la barra lateral es una carpeta con prefijo `NN-`,
y el **encabezado de cada grupo es el enlace al `index.md` de esa sección**. Haz clic en "Authoring" para llegar a su página de resumen.
{% /callout %}
