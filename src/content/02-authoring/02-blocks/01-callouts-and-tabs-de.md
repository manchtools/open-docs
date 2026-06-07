---
title: Callouts & Tabs
---

# Callouts & Tabs

Zwei Markdoc-Blöcke decken die meisten Anforderungen jenseits von reinem
Fließtext ab: **Callouts** zum Hervorheben von Hinweisen und **Tabs** zum
Gruppieren alternativer Anleitungen.

## Callouts

```markdown
{% callout type="info" title="Heads up" %}
Body text goes here. Markdown **inside** the callout works too.
{% /callout %}
```

`type` ist eines von `info`, `warn`, `danger` oder `success`. `title` ist
optional. Die vier Varianten werden so dargestellt:

{% callout type="info" title="Information" %}
Verwenden Sie `info` für Tipps, Kontext und „Gut zu wissen"-Einschübe.
{% /callout %}

{% callout type="warn" title="Warnung" %}
Verwenden Sie `warn` für Fallstricke und leicht zu übersehende Stolpersteine.
{% /callout %}

{% callout type="danger" title="Gefahr" %}
Verwenden Sie `danger` für destruktive Aktionen und Dinge, die etwas kaputtmachen.
{% /callout %}

{% callout type="success" title="Erfolg" %}
Verwenden Sie `success`, um einen erfolgreichen Ablauf oder einen erledigten
Schritt zu bestätigen.
{% /callout %}

## Tabs

Gruppieren Sie gleichwertige Anleitungen (Paketmanager, Betriebssysteme,
Sprachen), sodass Leser nur die Variante sehen, die sie interessiert.

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

Das `labels`-Attribut des Eltern-Tags listet alle Tabs vorab auf (durch
Kommas getrennt), damit die Tab-Leiste auf dem Server schon vor der
Hydration korrekt gerendert wird. `initial` legt fest, welcher Tab beim
Laden geöffnet ist; lassen Sie es weg, um standardmäßig den ersten zu
verwenden. Das `label` jedes `{% tab %}` muss einem Namen in `labels`
entsprechen.

Beispiel live:

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
