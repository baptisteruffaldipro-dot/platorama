# Mention « Le plus aimé »

## Modifications prévues
- Ajouter **Le plus aimé** aux badges disponibles dans la fiche d’un plat, pour pouvoir l’attribuer manuellement.
- Calculer automatiquement le ou les plats ayant reçu le plus de mises en favoris dans chaque restaurant.
- Afficher automatiquement la mention uniquement lorsqu’au moins un favori a été enregistré.
- Conserver les autres badges déjà attribués : la mention automatique viendra en complément, sans remplacer « Nouveau », « Best seller », etc.
- Afficher cette mention discrètement dans les différents modèles de carte, avec le même langage visuel que les badges existants.

## Détails techniques
- Lire uniquement les événements « favori » des plats du restaurant affiché et gérer les égalités au meilleur score.
- Centraliser l’apparence de la mention pour éviter les différences entre modèles.
- Ajouter le libellé aux textes traduisibles.
- Vérifier le menu mobile, l’édition manuelle d’un plat et l’absence d’erreur de compilation.

## Hors périmètre
- Aucun changement au fonctionnement actuel du bouton favori.
- Aucun classement public ni nombre de favoris affiché.
