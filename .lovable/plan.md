# Améliorations interface AR (template Vision)

## 1. Bouton AR plus désirable (`src/components/ARButton.tsx`)

Objectif : créer un CTA qu'on a vraiment envie de toucher.

- **Couleur vivante** : passer du beige sable actuel à un dégradé doré chaud (amber → orange) avec léger reflet métallique pour rappeler l'idée d'un plat appétissant.
- **Animation continue** : halo pulsant doux derrière le disque + très léger shimmer qui balaie la pill toutes les ~3s (transparence en mouvement).
- **Micro-interactions** : à l'appui, ondulation (ripple) qui part du disque ; au hover/focus, le disque tourne légèrement et l'icône AR s'agrandit.
- **Icône** : conserver l'icône AR existante mais l'animer (rotation lente continue très subtile) pour signaler que c'est "vivant".
- **Typo CTA** : conserver le titre, mais ajouter une petite flèche animée (→) qui pousse à droite à la fin du titre pour suggérer l'action.
- **Lisibilité** : ombre portée plus douce et plus profonde pour mieux le détacher du fond vidéo flouté.
- **Onboarding tooltip** : conservé, mais aligné sur la nouvelle palette dorée.

## 2. Carrousel épuré (`src/components/DishCarousel.tsx`)

- Retirer toute ombre ou halo derrière les vignettes des plats non sélectionnés (actuellement opacity + ring inexistant, mais vérifier qu'aucun `shadow-*` / `drop-shadow` n'est appliqué sur le wrapper rond).
- Retirer la **lueur externe** du plat sélectionné : supprimer le `boxShadow: "0 0 14px 3px rgba(255,255,255,0.25)"` sur la vignette active. Garder uniquement le `border-2 border-foreground` + l'effet `-translate-y-3` pour marquer la sélection.

## 3. Caméra qui se relance au retour de l'AR (`src/components/CameraBackground.tsx` + `src/pages/Index.tsx`)

Problème : `handleLaunchAR` dans `Index.tsx` stoppe tous les `<video>` (`stream.getTracks().stop()`) pour libérer la caméra pour ARKit/Scene Viewer. Au retour de l'AR, `CameraBackground` ne se relance pas car son `useEffect` n'est exécuté qu'au montage.

Correctif :
- Dans `CameraBackground`, extraire `startCamera` et le rappeler quand l'onglet redevient visible (`document.visibilitychange` → `document.visibilityState === "visible"`) et au `pageshow` (retour iOS depuis Quick Look). Aussi écouter `focus` de window en filet de sécurité.
- Vérifier que le `videoRef.current.srcObject` est null ou que les tracks sont stoppées avant de relancer (sinon, no-op).
- Nettoyer correctement les listeners au démontage.
- En complément, dans `handleLaunchAR`, après le `a.click()` iOS, planifier un événement custom (`window.dispatchEvent(new Event("ar-returned"))`) au prochain `visibilitychange`, écouté par `CameraBackground` comme déclencheur supplémentaire.

## Hors-scope

- Pas de changement de logique métier, pas de modification des templates autres que Vision, pas de touche aux fichiers Supabase ou auth.

## Détails techniques

- Toutes les couleurs passent par des tokens HSL ; si la nouvelle teinte dorée n'existe pas déjà comme token, ajouter `--ar-cta` et `--ar-cta-glow` dans `src/index.css` et l'utiliser dans `ARButton`.
- Animations en CSS pur (`@keyframes` dans `index.css`) — pas de nouvelle dépendance.
- Sur iOS, `getUserMedia` peut être refusé si rappelé trop vite après la libération : ajouter un petit délai (300ms) avant le redémarrage.
