# Message de prévention sur les menus virtuels

## Résultat attendu
Un message de prévention configurable par restaurant, affiché au choix :
- **Pied de menu** — bloc discret tout en bas de la carte, présent dans tous les thèmes ;
- **Pop-up au début** — fenêtre à valider à l'ouverture du menu (comme le Menu du jour), affichée une fois par jour et par visiteur ;
- **Les deux**.

Message par défaut (personnalisable) :
« Les photos et plats virtuels sont issus de photos réelles ; cependant, les saisons et l'approvisionnement peuvent avoir un impact sur le rendu final du plat. Merci de votre compréhension. »

Le message est traduit automatiquement quand le client change de langue.

## Réglages (par restaurant)
Nouvelle section « Message de prévention » dans Réglages, avec :
- interrupteur Activé / Désactivé ;
- choix de l'emplacement : Pied de menu / Pop-up / Les deux ;
- zone de texte libre (le texte proposé ci-dessus sert de valeur par défaut) ;
- aperçu du rendu dans la section.

Stockage : 3 nouvelles colonnes sur `site_settings` (`disclaimer_enabled`, `disclaimer_mode`, `disclaimer_text`), appliquées aux lignes brouillon et publiées via le mécanisme existant (brouillon → publier), sans migration de données.

## Affichage client
- **Composant partagé unique** `MenuDisclaimer` avec deux modes de rendu (bloc pied de page / pop-up), stylé avec les couleurs et polices du menu (jetons existants), respectant la file d'attente des pop-ups (`popupQueue`) pour ne jamais se superposer au Menu du jour ou aux offres.
- **Pied de menu** : ajouté en fin de défilement dans chaque vue de menu (Liste classique, Gold Elegance, Pop Swipe, Organic Stories, Vintage Book, Wallet Stack, Signature Or, Carte Test) via le composant partagé — cohérent visuellement avec le pied de page de chaque thème.
- **Pop-up** : branché dans la page du menu public, une fois par jour et par restaurant (mémorisation locale, même logique que le Menu du jour), priorité après le Menu du jour.
- **Traduction** : le texte (personnalisé ou par défaut) est ajouté aux textes envoyés au service de traduction existant.

## Détails techniques
- Migration : `ALTER TABLE public.site_settings ADD COLUMN disclaimer_enabled boolean NOT NULL DEFAULT false, ADD COLUMN disclaimer_mode text NOT NULL DEFAULT 'footer', ADD COLUMN disclaimer_text text NOT NULL DEFAULT ''` (table existante, RLS et droits déjà en place).
- Étendre `SiteSettings`, `DEFAULT_SETTINGS` et `parseRow` dans `useSiteSettings.ts` ; ajouter les champs au formulaire de `SettingsPanel.tsx`.
- Texte par défaut appliqué côté client quand le champ est vide (pas de backfill nécessaire).

## Vérifications
- Tester l'activation, le choix d'emplacement et la personnalisation du texte depuis les réglages, puis la publication.
- Vérifier le pied de page en bas de chaque thème et le pop-up (une seule fois par jour, sans conflit avec les autres pop-ups).
- Contrôler la traduction du message sur une autre langue.
- Valider mobile et ordinateur, compilation et absence d'erreur dans le menu.
