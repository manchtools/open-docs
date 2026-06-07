---
title: Tokens de contenido
---

# Tokens de contenido

Los tokens de contenido te permiten inyectar valores de tiempo de
despliegue en el texto sin editar el Markdown. Cualquier variable de
entorno que empiece por `PUBLIC_TOKEN_` se expone como un marcador de
posición `{{NAME}}`.

## Cómo funciona

Define la variable:

```sh
PUBLIC_TOKEN_API_URL="https://api.example.com"
```

…y luego haz referencia a ella en cualquier parte de una página:

```markdown
Send requests to {{API_URL}}/v1/widgets.
```

En tiempo de compilación, `{{API_URL}}` se reemplaza por el valor, así
que la página renderizada dice "Send requests to
https://api.example.com/v1/widgets."

El prefijo `PUBLIC_TOKEN_` se elimina para formar el nombre del marcador:
`PUBLIC_TOKEN_SUPPORT_EMAIL` → `{{SUPPORT_EMAIL}}`.

## Cuándo usarlos

- URLs específicas de cada entorno (hosts de la API de staging frente a
  producción).
- Valores que prefieres no fijar a mano en el Markdown, como la cadena de
  versión actual o una dirección de soporte.
- Reutilizar el mismo valor en muchas páginas desde una única fuente de
  verdad.

{% callout type="info" title="Sustitución de cadenas literal" %}
El reemplazo ocurre antes de que Markdoc analice la página, como un
intercambio literal de cadenas. Es seguro siempre que el valor inyectado
no contenga a su vez caracteres con significado en Markdoc. Las URLs y
cadenas de configuración corrientes no dan problema.
{% /callout %}

## Tokens sin definir

Si no hay ninguna variable que coincida, el texto `{{NAME}}` se deja
intacto. Por eso esta página puede mostrar `{{API_URL}}` literalmente: no
hay ningún token así definido en la compilación de la demo.
