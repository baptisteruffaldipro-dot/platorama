# Nouveau thème « Gold Elegance »

## Résultat attendu
Ajouter un nouveau thème sélectionnable dans les réglages, inspiré de la structure du menu de référence sans reprendre sa marque ni ses contenus :

- grand bandeau d’identité du restaurant ;
- recherche flottante ;
- catégories horizontales et accessibles au défilement ;
- grille très photographique des plats ;
- palette noir, ivoire, or et blanc ;
- titres Outfit et textes Figtree ;
- rendu mobile-first, avec deux colonnes lorsque la largeur le permet.

## Contenu des cartes plats
Chaque carte conservera les fonctions Platorama existantes :

- photo, titre long avec retour à la ligne, prix et description limitée à deux lignes avec « Voir plus » ;
- favoris et badges, dont « Le plus aimé » ;
- allergènes et note du chef propres au plat ;
- accès 3D/RA uniquement lorsque le plat possède un modèle compatible ;
- traduction des catégories, plats et libellés.

## Intégration
- Créer une vue dédiée au nouveau thème, sans modifier la présentation des thèmes actuels.
- Ajouter « Gold Elegance » à la galerie des thèmes dans les réglages ; aucune nouvelle structure de données n’est nécessaire pour le sélectionner.
- Utiliser l’identité et les visuels déjà configurés pour le restaurant, avec un remplacement propre lorsqu’un logo ou une photo manque.
- Conserver le bandeau Platorama actuel et ses actions activables, puis intégrer la navigation du thème juste en dessous.

## Détails techniques
- Étendre le registre des modèles avec une nouvelle variante de présentation.
- Ajouter une vue autonome et la brancher au menu public.
- Définir les couleurs, ombres et surfaces via des jetons sémantiques dédiés au thème, sans couleurs écrites directement dans les éléments.
- Charger Outfit et Figtree avec le mécanisme de polices déjà utilisé par les réglages du restaurant.
- Respecter les états tactiles, les zones sûres mobiles et la réduction des animations.

## Vérifications
- Tester la sélection du thème dans les réglages.
- Vérifier la recherche, le changement de catégorie, les favoris, les détails, la 3D/RA et les descriptions dépliables.
- Contrôler visuellement le rendu sur mobile et ordinateur, notamment les titres longs, les photos absentes et les boutons superposés.
- Valider la compilation et l’absence d’erreur visible dans le menu.
