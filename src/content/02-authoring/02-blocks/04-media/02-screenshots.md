---
title: Screenshots
---

# Screenshots

The `screenshot` block renders an image with optional browser-frame
chrome, a caption, and a separate dark-mode variant. The faux window
controls match the reader's own operating system (macOS, Windows, or
Linux). Images are resolved from `static/screenshots/`. Click any image
to enlarge it in a dialog (this also applies to plain Markdown `![]()`
images).

Here is the open-docs landing page, rendered by this very block:

{% screenshot
   src="open-docs-home.png"
   alt="The open-docs landing page"
   dark="open-docs-home-dark.png"
   caption="The open-docs landing page. The window controls above match your OS." /%}

The syntax:

```markdown
{% screenshot
   src="dashboard.png"
   alt="The project dashboard"
   caption="The dashboard after first login"
   dark="dashboard-dark.png"
   variant="frame"
   width="720px" /%}
```

## Attributes

| Attribute | Required | Effect |
|---|---|---|
| `src` | yes | Image file under `static/screenshots/`. |
| `alt` | yes | Accessible description. |
| `caption` | no | Caption shown beneath the image. |
| `dark` | no | Alternate image used when dark mode is active. |
| `variant` | no | `frame` (faux-browser chrome, default) or `flat` (bordered image). |
| `width` | no | Max width, e.g. `720px`. Defaults to the content column width. |

## Adding the image files

Drop the files into your static directory:

{% filetree %}
- static/
  - screenshots/
    - dashboard.png
    - dashboard-dark.png
{% /filetree %}

In Docker, mount your assets at `/static`. They are merged into the
image's `static/`, so you only override what you provide. See
[Static assets](/customizing/configuration#static-assets).

{% callout type="warn" title="Reference real files" %}
A `screenshot` pointing at a missing image fails validation when the
site starts. Add the file before referencing it.
{% /callout %}
