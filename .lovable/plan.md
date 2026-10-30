# Lien direct vers un plat en réalité augmentée

## Objectif
Un lien à mettre en bio Instagram : le visiteur clique, et le plat apparaît en RA le plus vite possible.

## Limite à connaître
Les téléphones (iPhone et Android) interdisent d'ouvrir la caméra RA sans un appui de la personne. Le "clic, hop" direct est donc impossible : le plus proche est **un seul appui** sur un grand bouton. Depuis Instagram, il faut en plus ouvrir le lien dans le navigateur (la pop-up existante s'en charge).

## Parcours
```text
Bio Instagram -> pop-up "Ouvrir dans le navigateur" (si dans Instagram)
             -> page plein écran du plat : photo/3D + gros bouton "Voir sur ma table"
             -> 1 appui -> le plat apparaît en RA
             -> retour : bouton "Voir tout le menu"
```
- Pas d'écran d'accueil, pas de pop-ups (menu du jour, offres, prévention) sur ce lien.
- Si le plat n'a pas de modèle RA : on affiche simplement sa fiche.

## Côté admin
Dans la fiche de chaque plat ayant un modèle RA : bouton **"Copier le lien RA direct"** (et QR code téléchargeable) — à coller dans la bio.

## Détails techniques
- Lien : `/m/:slug?ar=<dishId>` (paramètre lu dans `Index.tsx`).
- Mode "démo RA" : saute le splash, désactive `popupQueue` hors `OpenInBrowserDialog`, affiche un écran plein écran réutilisant `handleLaunchAR` sur l'appui (geste utilisateur requis par Quick Look / Scene Viewer).
- Événement analytics `ar_direct_link_open` pour mesurer les clics de la bio.
- Bouton copie + QR dans `Admin.tsx` (fiche plat), réutilisant la logique de copie de `QRCodePanel`.
