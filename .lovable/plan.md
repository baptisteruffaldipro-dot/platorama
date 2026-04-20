

## Connecter platorama.fr aux menus virtuels

Ton domaine `platorama.fr` héberge déjà ta landing page chez un autre service. Plutôt que de tout casser, on va utiliser un **sous-domaine dédié** pour les menus Lovable. Résultat final :

- Ta landing reste sur `https://platorama.fr` (inchangée)
- Tes menus deviennent accessibles via `https://menu.platorama.fr/m/arrosoir` (ou `https://app.platorama.fr/m/arrosoir`)
- Les QR codes générés utiliseront automatiquement cette URL courte

### Étapes côté Lovable (toi, ~2 min)

1. **Publier le projet** s'il ne l'est pas déjà (bouton `Publish` en haut à droite)
2. Aller dans **Project Settings → Domains**
3. Cliquer **Connect Domain**
4. Saisir le sous-domaine choisi, par exemple : `menu.platorama.fr`
5. Lovable affiche les enregistrements DNS à ajouter (A record + TXT record)

### Étapes côté registrar (là où tu as acheté platorama.fr)

Dans le panneau DNS de ton registrar, ajouter :

```text
Type: A      Name: menu          Value: 185.158.133.1
Type: TXT    Name: _lovable      Value: lovable_verify=XXX  (fourni par Lovable)
```

Important : **ne touche pas** aux enregistrements existants pour `@` (root) et `www` — ils continuent de pointer vers ta landing page.

Propagation DNS : généralement 5-30 min, jusqu'à 72 h max. Lovable provisionne automatiquement le SSL (HTTPS).

### Côté code (moi, après que le domaine soit Active)

Aucun changement obligatoire — le composant `QRCodePanel` utilise déjà `window.location.origin`, donc dès que les utilisateurs ouvrent l'admin depuis `https://menu.platorama.fr`, les QR codes pointeront automatiquement vers la bonne URL.

**Optionnel mais recommandé** : forcer une URL de production fixe pour que les QR codes soient toujours générés avec `menu.platorama.fr`, même si l'admin est ouvert depuis la preview Lovable. Cela évite qu'un QR généré depuis la preview pointe vers `id-preview--...lovable.app`.

### Détails techniques

- Modification de `src/lib/slug.ts` : introduire une constante `PRODUCTION_ORIGIN` (ex. `https://menu.platorama.fr`) lue depuis une variable d'env `VITE_PUBLIC_MENU_ORIGIN`, avec fallback sur `window.location.origin` si non définie.
- `buildMenuUrl()` utilise `PRODUCTION_ORIGIN` en priorité.
- Aucune migration DB, aucun changement de routes (`/m/:slug` reste identique).

### Alternatives si tu préfères

- **Utiliser le domaine racine `platorama.fr` pour les menus** et déplacer ta landing ailleurs → plus radical, casse ta landing actuelle.
- **Garder uniquement `platorama.lovable.app`** → URLs déjà courtes et propres, pas besoin de DNS.

### Questions ouvertes

- Quel sous-domaine veux-tu utiliser : `menu.platorama.fr`, `app.platorama.fr`, `carte.platorama.fr`, autre ?
- Veux-tu aussi que je hardcode l'URL de prod dans le code (étape optionnelle) ?

