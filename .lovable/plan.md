# Cohérence des informations par plat

## Modifications prévues
- Retirer du bandeau supérieur les boutons **Allergènes** et **Note du chef**, car leur contenu dépend du plat affiché.
- Ajouter à chaque plat concerné deux petits boutons discrets : un pour ses allergènes et un pour sa note du chef.
- Afficher ces boutons près des informations du plat dans Dark Luxe/Vision AR et dans les vues de menu où plusieurs plats sont visibles.
- Conserver les fenêtres actuelles, la traduction et les avertissements allergènes.
- Remplacer l’icône « i » des formules par une icône de prix/menu plus explicite, sans modifier le contenu des formules.

## Détails techniques
- Créer une action réutilisable pour éviter des comportements différents entre les modèles de carte.
- Utiliser les composants et couleurs existants, avec des boutons plus petits que ceux du bandeau.
- Vérifier le rendu mobile, l’ouverture de chaque fenêtre et l’absence d’erreur de compilation.

## Hors périmètre
- Aucun changement dans les données des plats, les prix ou les réglages administrateur.