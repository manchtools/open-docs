---
title: Jetons de contenu
---

# Jetons de contenu

Les jetons de contenu vous permettent d'injecter des valeurs calculées au
déploiement dans le texte sans modifier le Markdown. Toute variable
d'environnement commençant par `PUBLIC_TOKEN_` est exposée sous forme de
marqueur `{{NAME}}`.

## Fonctionnement

Définissez la variable :

```sh
PUBLIC_TOKEN_API_URL="https://api.example.com"
```

…puis référencez-la n'importe où dans une page :

```markdown
Send requests to {{API_URL}}/v1/widgets.
```

À la construction, `{{API_URL}}` est remplacé par la valeur, de sorte que
la page rendue affiche « Send requests to
https://api.example.com/v1/widgets. »

Le préfixe `PUBLIC_TOKEN_` est retiré pour former le nom du marqueur :
`PUBLIC_TOKEN_SUPPORT_EMAIL` → `{{SUPPORT_EMAIL}}`.

## Quand l'utiliser

- URL propres à un environnement (hôtes d'API de pré-production vs
  production).
- Valeurs que vous préférez ne pas coder en dur dans le Markdown, comme une
  chaîne de version courante ou une adresse de support.
- Réutilisation de la même valeur sur plusieurs pages à partir d'une source
  de vérité unique.

{% callout type="info" title="Substitution de chaîne brute" %}
Le remplacement a lieu avant que Markdoc n'analyse la page, sous la forme
d'un échange littéral de chaîne. C'est sans danger tant que la valeur
injectée ne contient pas elle-même de caractères significatifs pour
Markdoc. Les URL et chaînes de configuration ordinaires conviennent.
{% /callout %}

## Jetons non définis

Si aucune variable correspondante n'est définie, le texte `{{NAME}}` est
laissé tel quel. C'est pourquoi cette page peut afficher `{{API_URL}}`
littéralement : aucun jeton de ce type n'est défini dans la construction de
démonstration.
