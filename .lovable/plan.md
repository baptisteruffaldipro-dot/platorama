# Fidélité : inscription complète, RGPD et Wallet

## Résultat attendu
- L’inscription demande séparément et obligatoirement le nom, le prénom, l’email et le téléphone.
- Les doublons sont évités par établissement à partir de l’email ou du téléphone normalisés.
- Le bouton « Créer ma carte » reste parfaitement lisible dans tous les thèmes.
- Les choix marketing email et SMS restent facultatifs, séparés et désactivés par défaut.
- La carte créée propose « Ajouter à Apple Wallet » sur iPhone et « Ajouter à Google Wallet » sur Android.

## Interface client
- Remplacer le champ unique actuel par quatre champs clairement libellés, avec messages d’erreur précis.
- Ajouter les mentions de confidentialité sous le formulaire : finalités, responsable du traitement, durée de conservation, droits, retrait du consentement et contact `contact@platorama.fr`.
- Distinguer la création de la carte, nécessaire au programme, des deux consentements marketing facultatifs.
- Forcer le contraste du bouton principal avec les couleurs du thème.
- Afficher les boutons Wallet uniquement après création de la carte, avec un état explicite si le service Wallet n’est pas encore configuré.

## Administration
- Afficher le nom complet, l’email et le téléphone de chaque membre afin de faciliter la recherche de doublons.
- Conserver l’historique horodaté des consentements et de leur retrait.

## Données et sécurité
- Ajouter le nom de famille aux membres existants sans bloquer les anciennes cartes.
- Ajouter des valeurs normalisées pour email et téléphone et des index uniques par établissement.
- Valider les quatre champs côté téléphone et côté serveur, avec limites de longueur et format strict.
- Lorsqu’un email ou téléphone existe déjà dans le même établissement, restituer la carte existante au lieu d’en créer une seconde.

## Apple Wallet et Google Wallet
- Préparer un service serveur dédié qui génère les liens/pass Wallet sans exposer de secret au téléphone.
- Apple Wallet nécessite le certificat Pass Type ID signé par Apple.
- Google Wallet nécessite un compte émetteur approuvé et ses identifiants de service.
- Tant que ces éléments ne sont pas fournis, les boutons restent visibles mais expliquent que l’ajout au Wallet sera disponible après activation, sans simuler une fausse carte.

## Vérifications
- Tester l’inscription sur mobile, les champs invalides, le bouton, la détection de doublon et les consentements.
- Tester l’affichage de la carte existante et les boutons Apple/Google selon le téléphone.
- Vérifier la compilation et le fonctionnement de la fonction fidélité.
