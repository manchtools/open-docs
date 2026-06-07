---
title: Callouts y pestañas
---

# Callouts y pestañas

Dos bloques de Markdoc cubren la mayoría de las necesidades más allá del texto
plano: los **callouts** para resaltar notas y las **pestañas** para agrupar
instrucciones alternativas.

## Callouts

```markdown
{% callout type="info" title="Heads up" %}
Body text goes here. Markdown **inside** the callout works too.
{% /callout %}
```

`type` es uno de `info`, `warn`, `danger` o `success`. `title` es opcional.
Las cuatro variantes se renderizan así:

{% callout type="info" title="Información" %}
Usa `info` para consejos, contexto y aclaraciones de tipo "conviene saberlo".
{% /callout %}

{% callout type="warn" title="Advertencia" %}
Usa `warn` para puntos delicados y trampas fáciles de pasar por alto.
{% /callout %}

{% callout type="danger" title="Peligro" %}
Usa `danger` para acciones destructivas y cosas que rompen algo.
{% /callout %}

{% callout type="success" title="Éxito" %}
Usa `success` para confirmar un camino correcto o un paso completado.
{% /callout %}

## Pestañas

Agrupa instrucciones equivalentes (gestores de paquetes, sistemas operativos,
lenguajes) para que quien lee vea solo la variante que le interesa.

````markdown
{% tabs labels="apt, dnf, brew" initial="apt" %}
  {% tab label="apt" %}
  ```sh
  sudo apt install ripgrep
  ```
  {% /tab %}
  {% tab label="dnf" %}
  ```sh
  sudo dnf install ripgrep
  ```
  {% /tab %}
{% /tabs %}
````

El atributo `labels` del contenedor padre lista todas las pestañas por
adelantado (separadas por comas) para que la fila de pestañas se renderice
correctamente en el servidor antes de la hidratación. `initial` elige la
pestaña abierta al cargar; omítelo para que sea la primera por defecto. El
`label` de cada `{% tab %}` debe coincidir con un nombre de `labels`.

Ejemplo en vivo:

{% tabs labels="npm, pnpm, bun" initial="bun" %}
{% tab label="npm" %}
```sh
npm install
```
{% /tab %}
{% tab label="pnpm" %}
```sh
pnpm install
```
{% /tab %}
{% tab label="bun" %}
```sh
bun install
```
{% /tab %}
{% /tabs %}
