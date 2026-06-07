---
title: Multiidioma
description: Traduce páginas añadiendo un sufijo de idioma al nombre de archivo. El idioma por defecto se queda sin prefijo; los demás reciben una URL /<lang>, con respaldo al idioma por defecto.
---

# Multiidioma

Traduce una página añadiendo un sufijo de idioma a su nombre de archivo. La
versión alemana de `01-introduction.md` es `01-introduction-de.md`. Esa es toda
la configuración: los idiomas se descubren a partir de los sufijos en el momento
del build, así que no hay ningún archivo de configuración de idiomas que mantener.

Esta misma página tiene una versión alemana
([Inhaltsstruktur](/de/getting-started/content-layout) es otra), así que el
selector de idioma de la barra superior está activo en este sitio.

## URLs

El **idioma por defecto se queda sin prefijo** y todos los demás idiomas reciben
un prefijo `/<lang>`:

| Archivo | URL |
|---|---|
| `getting-started/intro.md` | `/getting-started/intro` |
| `getting-started/intro-de.md` | `/de/getting-started/intro` |

Así, los enlaces existentes siguen funcionando, y un sitio de un solo idioma no
tiene ningún prefijo. El sitio se mantiene en un solo idioma (y sin prefijos)
hasta que aparece el primer archivo `-<lang>`.

## Idioma por defecto

El idioma por defecto es `en`. Cámbialo con `PUBLIC_DEFAULT_LANG`:

```sh
-e PUBLIC_DEFAULT_LANG="de"
```

El idioma por defecto es aquel al que pertenecen los archivos sin sufijo, y el
que se sirve en las URLs sin prefijo.

## Respaldo

El conjunto de páginas lo define el idioma por defecto. Una página que no está
traducida a un idioma recurre al contenido por defecto con el mismo slug, así
que ningún idioma muestra nunca un enlace roto. Puedes traducir tan pocas o
tantas páginas como quieras e ir completando el resto con el tiempo.

## Qué obtienes

- Un **selector de idioma** en la barra superior (se muestra solo cuando existe
  más de un idioma). Te mantiene en la misma página al cambiar.
- Una **barra lateral y enlaces anterior/siguiente localizados**: títulos
  traducidos donde existe una traducción, y títulos por defecto en caso contrario.
- **Búsqueda por idioma.** El índice de búsqueda está segmentado por idioma, así
  que buscar desde una página `/de` devuelve resultados en alemán.
- **Alternativas `hreflang`** y un `sitemap.xml` multiidioma, para que los
  motores de búsqueda sirvan el idioma correcto. Define `PUBLIC_SITE_URL` para
  ello; consulta [SEO y búsqueda con IA](/es/customizing/seo).

## Ejemplo

```text
content/
  01-getting-started/
    01-intro.md         → /getting-started/intro      (default, e.g. en)
    01-intro-de.md      → /de/getting-started/intro    (German)
    02-install.md       → /getting-started/install     (en only; /de falls back)
```

El sufijo de idioma va después de cualquier prefijo de orden `NN-` y antes de la
extensión. Usa códigos [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)
(`de`, `fr`, `ja`, …); una terminación de dos letras que no sea un código real
(como `setup-ci.md`) se trata como un nombre de archivo normal, no como un idioma.

{% callout type="info" title="Qué se mantiene en el idioma por defecto" %}
Casi todo se localiza: el contenido de las páginas, la navegación y la
interfaz. La excepción es el **título y la descripción del sitio**, que
provienen de `PUBLIC_SITE_TITLE` y `PUBLIC_SITE_DESCRIPTION` y son iguales
en todos los idiomas.
{% /callout %}
