---
title: Screenshots
---

# Screenshots

The `screenshot` block renders an image with optional browser-frame
chrome, a caption, and a separate dark-mode variant. Images are
resolved from `static/screenshots/`.

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

## Putting images in place

Drop the files into your static directory:

{% filetree %}
- static/
  - screenshots/
    - dashboard.png
    - dashboard-dark.png
{% /filetree %}

In Docker, mount your assets at `/static` — they are merged into the
image's `static/`, so you only override what you provide. See
[Static assets](/customizing/configuration#static-assets).

{% callout type="warn" title="Reference real files" %}
A `screenshot` pointing at a missing image will fail the production
build, since every page is pre-rendered. Add the file before
referencing it.
{% /callout %}
