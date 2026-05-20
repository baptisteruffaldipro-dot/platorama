# Refonte bouton AR + ombres carrousel

## 1. Bouton AR (`src/components/ARButton.tsx`)
Reprendre la direction "Glass sombre épuré" choisie :
- Fond `bg-black/40` + `backdrop-blur-xl` + bordure `border-white/10` (hover : bordure `accent/50`).
- Layout vertical centré : icône ScanEye Lucide dans un cercle doré semi-transparent → titre en petites capitales tracking large (couleur accent doré) → sous-texte en serif (Cormorant) gris clair → indicateur "tap up" (flèche haut + traits) en bas.
- Coins décoratifs qui apparaissent au hover.
- Shimmer doré qui balaie au hover.
- Conserver le tooltip d'onboarding et la logique `onClick` / `restaurantId` existants.
- Utiliser les tokens HSL existants (`--accent` 38 30% 50%) au lieu du hex `#A38C5B`.
- Retirer l'icône custom `ar-icon.png` et l'import associé.
- Retirer l'animation `active:scale-95` agressive → garder `active:scale-[0.98]`.

## 2. Ombres derrière les plats du carrousel (`src/components/DishCarousel.tsx`)
La "lueur externe" du plat sélectionné a déjà été retirée, mais l'utilisateur voit encore des halos sombres derrière les vignettes non sélectionnées. Source : `bg-muted/20` sur le wrapper circulaire qui crée un disque gris foncé visible sur le fond vidéo flouté.
- Remplacer `bg-muted/20` par `bg-transparent` sur le wrapper de toutes les vignettes.
- Vérifier qu'aucune ombre n'est ajoutée via les `<img>` (pas de filter:drop-shadow, pas de shadow Tailwind).

## Hors-scope
- Pas de modification du nettoyage caméra / restart AR (déjà fonctionnel).
- Pas de changement sur les autres templates ni sur la logique métier.
