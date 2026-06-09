---
title: Captures d'écran
---

# Captures d'écran

Le bloc `screenshot` affiche une image avec, en option, un habillage façon
fenêtre de navigateur, une légende et une variante distincte pour le mode
sombre. Les images sont résolues depuis `static/screenshots/`. Cliquez sur une
image pour l'agrandir dans une boîte de dialogue (cela vaut aussi pour les
images Markdown classiques `![]()`). Les contrôles de fenêtre de l'habillage
s'adaptent au système d'exploitation du lecteur (macOS, Windows ou Linux).

Voici la page d'accueil d'open-docs, rendue par ce bloc même :

{% screenshot
   src="open-docs-home-fr.png"
   alt="La page d'accueil d'open-docs"
   dark="open-docs-home-fr-dark.png"
   caption="La page d'accueil d'open-docs. Les contrôles de fenêtre ci-dessus correspondent à votre système." /%}

```markdown
{% screenshot
   src="dashboard.png"
   alt="The project dashboard"
   caption="The dashboard after first login"
   dark="dashboard-dark.png"
   variant="frame"
   width="720px" /%}
```

## Attributs

| Attribut | Requis | Effet |
|---|---|---|
| `src` | oui | Fichier image sous `static/screenshots/`. |
| `alt` | oui | Description accessible. |
| `caption` | non | Légende affichée sous l'image. |
| `dark` | non | Image alternative utilisée quand le mode sombre est actif. |
| `variant` | non | `frame` (habillage façon navigateur, par défaut) ou `flat` (image avec bordure). |
| `width` | non | Largeur maximale, p. ex. `720px`. Par défaut, la largeur de la colonne de contenu. |

## Ajouter les fichiers image

Déposez les fichiers dans votre répertoire statique :

{% filetree %}
- static/
  - screenshots/
    - dashboard.png
    - dashboard-dark.png
{% /filetree %}

Sous Docker, montez vos ressources sur `/static`. Elles sont fusionnées dans le
dossier `static/` de l'image, vous ne remplacez donc que ce que vous fournissez.
Voir [Ressources statiques](/fr/customizing/configuration#assets-statiques).

{% callout type="warn" title="Référencez des fichiers réels" %}
Un `screenshot` pointant vers une image manquante fait échouer la validation
au démarrage du site. Ajoutez le fichier avant de le référencer.
{% /callout %}
