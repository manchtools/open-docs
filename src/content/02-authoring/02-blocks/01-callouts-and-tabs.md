---
title: Callouts & tabs
---

# Callouts & tabs

Two Markdoc blocks cover most "more than prose" needs: **callouts** to
draw the eye, and **tabs** to group alternative instructions.

## Callouts

```markdown
{% callout type="info" title="Heads up" %}
Body text goes here. Markdown **inside** the callout works too.
{% /callout %}
```

`type` is one of `info`, `warn`, `danger`, or `success`. `title` is
optional. The four variants render like this:

{% callout type="info" title="Information" %}
Use `info` for tips, context, and "good to know" asides.
{% /callout %}

{% callout type="warn" title="Warning" %}
Use `warn` for sharp edges and easy-to-miss gotchas.
{% /callout %}

{% callout type="danger" title="Danger" %}
Use `danger` for destructive actions and things that break.
{% /callout %}

{% callout type="success" title="Success" %}
Use `success` to confirm a happy path or a completed step.
{% /callout %}

## Tabs

Group equivalent instructions — package managers, operating systems,
languages — so readers see only the variant they care about.

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

The parent `labels` attribute lists every tab up front (comma
separated) so the tab row renders correctly on the server before
hydration. `initial` picks the tab open on load; omit it to default to
the first. Each `{% tab %}`'s `label` must match a name in `labels`.

Live example:

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
