# Photos de plats et offre Gold Elegance

## Objectif
Permettre au restaurateur d’ajouter simplement une vraie photo à chaque plat, puis d’utiliser Gold Elegance comme menu photo avec réalité augmentée facultative. Light Minimal reste présenté comme l’offre centrée sur la réalité augmentée.

## Réglages d’un plat
- Remplacer le champ technique « Thumbnail » par une zone claire « Photo du plat ».
- Permettre de choisir une image depuis l’appareil, afficher immédiatement son aperçu, puis la remplacer ou la retirer.
- Conserver la possibilité de coller une adresse d’image, dans une option secondaire.
- Regrouper ensuite les fichiers 3D dans une section « Réalité augmentée — facultatif » avec une explication courte : sans modèle, le plat reste disponible en photo uniquement.
- Afficher l’état du plat dans la liste d’administration avec sa photo et un indicateur discret lorsqu’un modèle 3D/RA est disponible.

## Comportement des thèmes
- **Gold Elegance** : la photo devient le visuel principal. Les boutons 3D et RA apparaissent uniquement pour les plats qui disposent d’un modèle compatible ; les plats sans modèle restent des cartes photo normales.
- **Light Minimal** : conserver son fonctionnement actuel orienté plats 3D/RA et clarifier son intitulé/sa description dans la galerie des thèmes.
- Clarifier également la description de **Gold Elegance** comme « Menu photo + réalité augmentée si disponible ».
- Aucun changement sur les autres thèmes.

## Données et compatibilité
- Réutiliser le champ photo et le stockage déjà présents : aucune modification de base de données nécessaire.
- Conserver les photos et modèles déjà enregistrés.
- Accepter les formats d’image usuels et afficher un message compréhensible en cas d’échec d’envoi.

## Vérifications
- Créer et modifier un plat avec photo seule.
- Créer et modifier un plat avec photo et modèles 3D.
- Vérifier le remplacement et la suppression d’une photo.
- Vérifier dans Gold Elegance que les actions 3D/RA sont absentes pour un plat photo seul et présentes pour un plat compatible.
- Vérifier Light Minimal, la liste d’administration, l’affichage mobile et la compilation.
