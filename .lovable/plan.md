# Fiche plat coulissante — Gold Elegance

## Objectif
Permettre d’ouvrir chaque carte du thème Gold Elegance dans une fiche immersive, puis de passer d’un plat à l’autre par glissement horizontal.

## Expérience client
- Toute la carte du plat devient cliquable, sans gêner les boutons favoris, 3D, RA, allergènes ou note du chef.
- La fiche s’ouvre au-dessus du menu avec la grande photo, les badges, la catégorie, le nom, le prix, la description complète et les actions disponibles.
- Un glissement vers la gauche ou la droite affiche le plat suivant ou précédent parmi les plats actuellement visibles.
- Des flèches discrètes, un compteur et des repères visuels rendent aussi la navigation accessible sans geste tactile.
- La fiche se ferme avec une croix, la touche Échap ou un retour explicite, puis rend le défilement au menu.

## Détails techniques
- Ajouter une fiche dédiée au thème Gold Elegance, affichée au niveau de la page pour éviter les problèmes de positionnement mobile.
- Utiliser une animation horizontale et un seuil de geste afin de ne pas déclencher un changement pendant un simple défilement vertical.
- Conserver le plat ouvert lors des changements de favoris et réinitialiser proprement la 3D à chaque changement de plat.
- Respecter les préférences de réduction des animations et les zones de sécurité iPhone.

## Vérification
- Tester l’ouverture depuis plusieurs cartes, le glissement dans les deux sens et les limites premier/dernier plat.
- Tester la fermeture, les favoris, les informations du plat et les boutons 3D/RA conditionnels.
- Contrôler l’affichage sur mobile et ordinateur, puis valider la compilation.
