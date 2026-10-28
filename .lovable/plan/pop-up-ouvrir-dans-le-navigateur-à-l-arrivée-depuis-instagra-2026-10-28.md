# Pop-up « Ouvrir dans le navigateur » à l'arrivée depuis Instagram

## Ce qui change
- Quand un client ouvre le menu depuis Instagram (ou Facebook, TikTok… navigateurs intégrés), la pop-up « Ouvrir dans le navigateur » s'affiche automatiquement dès la fin de l'écran d'accueil, sans attendre qu'il touche le bouton RA.
- Le texte s'adapte : « Pour profiter de la réalité augmentée, ouvrez le menu dans Safari ou Chrome. »
- Elle passe en priorité sur les autres pop-ups (menu du jour, offres, message de prévention), qui s'afficheront ensuite.
- Si le client la ferme, elle ne revient pas pendant la visite ; elle réapparaîtra toujours au clic sur la RA.
- Aucun changement dans un navigateur normal.

## Technique
- `Index.tsx` : après le splash, si navigateur intégré détecté, ouvrir `OpenInBrowserDialog` (flag sessionStorage `inapp_prompt_shown`), event analytics `inapp_prompt_auto`.
- Réserver la file `popupQueue` / `useExclusiveOverlay` pour bloquer les autres pop-ups tant qu'elle est ouverte.
- Prop `reason="arrival" | "ar"` sur `OpenInBrowserDialog` pour le texte.
