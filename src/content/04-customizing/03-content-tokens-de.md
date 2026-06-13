---
title: Content-Tokens
---

# Content-Tokens

Mit Content-Tokens fügen Sie Deploy-Zeit-Werte in den Fließtext ein, ohne das
Markdown zu bearbeiten. Jede Umgebungsvariable, die mit `PUBLIC_TOKEN_`
beginnt, wird als Platzhalter `{{NAME}}` bereitgestellt.

## So funktioniert es

<!-- docref: begin src=scripts/tokens.js#applyTokens:6536bf55 -->

Setzen Sie die Variable:

```sh
PUBLIC_TOKEN_API_URL="https://api.example.com"
```

…und referenzieren Sie sie dann an beliebiger Stelle auf einer Seite:

```markdown
Send requests to {{API_URL}}/v1/widgets.
```

Beim Parsen des Inhalts wird `{{API_URL}}` durch den Wert ersetzt, sodass die
gerenderte Seite „Send requests to https://api.example.com/v1/widgets." lautet.

Das Präfix `PUBLIC_TOKEN_` entfällt, um den Platzhalternamen zu bilden:
`PUBLIC_TOKEN_SUPPORT_EMAIL` → `{{SUPPORT_EMAIL}}`.

<!-- docref: end -->

## Wann Sie es verwenden

- Umgebungsspezifische URLs (Staging- vs. Produktions-API-Hosts).
- Werte, die Sie lieber nicht fest ins Markdown schreiben wollen, etwa eine
  aktuelle Versionsangabe oder eine Support-Adresse.
- Denselben Wert über viele Seiten hinweg aus einer einzigen Quelle der
  Wahrheit wiederverwenden.

{% callout type="info" title="Reine String-Ersetzung" %}
Die Ersetzung erfolgt, bevor Markdoc die Seite parst, als wörtlicher
String-Tausch. Sie ist sicher, solange der eingefügte Wert nicht selbst für
Markdoc bedeutsame Zeichen enthält. Gewöhnliche URLs und Konfigurations-Strings
sind unproblematisch.
{% /callout %}

## Nicht gesetzte Tokens

Ist keine passende Variable gesetzt, bleibt der Text `{{NAME}}` unverändert.
Deshalb kann diese Seite `{{API_URL}}` wörtlich anzeigen: im Demo-Build ist
kein solches Token definiert.
