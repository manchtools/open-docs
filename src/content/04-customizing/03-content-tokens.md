---
title: Content tokens
---

# Content tokens

Content tokens let you inject deploy-time values into prose without
editing the Markdown. Any environment variable starting with
`PUBLIC_TOKEN_` is exposed as a `{{NAME}}` placeholder.

## How it works

Set the variable:

```sh
PUBLIC_TOKEN_API_URL="https://api.example.com"
```

…then reference it anywhere in a page:

```markdown
Send requests to {{API_URL}}/v1/widgets.
```

At build time `{{API_URL}}` is replaced with the value, so the rendered
page reads "Send requests to https://api.example.com/v1/widgets."

The `PUBLIC_TOKEN_` prefix is dropped to form the placeholder name:
`PUBLIC_TOKEN_SUPPORT_EMAIL` → `{{SUPPORT_EMAIL}}`.

## When to use it

- Environment-specific URLs (staging vs production API hosts).
- Values you would rather not hard-code into Markdown, such as a
  current version string or a support address.
- Reusing the same value across many pages from one source of truth.

{% callout type="info" title="Plain string substitution" %}
Replacement happens before Markdoc parses the page, as a literal string
swap. It is safe as long as the injected value does not itself contain
Markdoc-significant characters. Ordinary URLs and config strings are
fine.
{% /callout %}

## Unset tokens

If no matching variable is set, the `{{NAME}}` text is left untouched.
That is why this page can show `{{API_URL}}` literally: no such
token is defined in the demo build.
