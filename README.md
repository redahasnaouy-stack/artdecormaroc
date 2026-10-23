# ArtDecor

Boutique dérivée de `redahasnaouy-stack/decoration.ma`, avec une identité visuelle indépendante : mauve profond, lavande, composition éditoriale et photographies grand format. Les fonctions de commande directe et de gestion sont conservées.

Catalogue de décoration en français : grille de quatre produits sur ordinateur, recherche, filtres, fiches descriptives et dashboard privé pour gérer les produits et photos. Commande directe d’un produit avec formulaire client, sans panier. Les anciennes commandes restent consultables dans l’administration.

## Particularités ArtDecor

- Thème mauve et lavande, couverture éditoriale et navigation fixe, adaptés au mobile.
- Même parcours que decoration.ma : recherche, catégories, tri, fiches produit et commande directe (sans panier).
- Administration privée sur `/admin` : produits, photos, stock, commandes et statuts.
- Site et stockage indépendants : aucun compte, commande ou mot de passe de decoration.ma n’est copié.
- Aucune compilation : Netlify publie directement `public` avec les Functions configurées.

## Démarrer

Node.js 24 ou supérieur. Installer les dépendances avec `npm ci --cache /tmp/artdecor-npm-cache` (Netlify Blobs est utilisé sur Netlify).

```sh
npm start
```

Port : `3000`, modifiable avec `PORT`. Boutique sur `/`, administration sur `/admin`.

Pour initialiser le compte administrateur, saisir un mot de passe privé dans le terminal, sans le mettre dans l’historique :

```sh
read -rsp 'Mot de passe administrateur (12 caractères minimum) : ' ADMIN_PASSWORD
export ADMIN_PASSWORD
npm run setup-admin
unset ADMIN_PASSWORD
npm start
```

Le fichier `.env.example` documente les noms des variables ; le serveur ne charge pas automatiquement `.env`. Injecter les variables via votre terminal ou les paramètres sécurisés de l’environnement.

Le mot de passe est conservé sous forme de hash scrypt. La variable `ADMIN_PASSWORD` peut aussi être injectée au démarrage comme remplacement. Les sessions expirent après 24 heures et sont supprimées au redémarrage. En production derrière HTTPS, définir `COOKIE_SECURE=1`.

## Données et état du projet

SQLite dans `data/store.sqlite` (ignoré par Git), créé au premier démarrage. Sauvegarder le dossier `data` régulièrement. Les commandes recalculent les prix côté serveur et réservent le stock dans une transaction.

Le catalogue contient 24 produits de décoration importés depuis le catalogue public Engro le 23 octobre 2026, avec 24 références distinctes de la sélection initiale de decoration.ma : noms, descriptions, prix affichés et photos du fournisseur. Les prix sont ceux du fournisseur, sans marge ajoutée. Chaque fiche du catalogue source conserve son URL et son identifiant Engro dans `netlify/catalog.json`. Le stock initial hérité du site de référence est fixé à 10 unités par produit : il s’agit d’une quantité de démonstration, à ajuster au stock réel avant de prendre des commandes. Vérifier également les prix de vente. Les photos importées sont conservées dans `public/assets` et leur URL source est enregistrée dans le catalogue. Les nouvelles photos peuvent être téléversées directement depuis le dashboard.

Le paiement est uniquement à la livraison. Aucun encaissement électronique ni envoi automatique de message. Avant une ouverture commerciale : configurer HTTPS et sauvegardes, ajouter les coordonnées commerciales et les conditions de vente/retour/confidentialité adaptées, remplacer les exemples et intégrer si nécessaire un prestataire de paiement et de livraison. Le serveur intégré est une base de développement ; ajouter une limitation de débit et une surveillance avant exposition publique.

## Vérifications

```sh
npm test
```

Les tests utilisent une copie temporaire et ne modifient pas la base de la boutique.

## Déployer sur Netlify

1. Envoyer les fichiers du projet, y compris `netlify.toml`, `netlify/`, `package.json` et `package-lock.json`, dans le dépôt GitHub.
2. Dans Netlify : **Add new project → Import an existing project → GitHub**, sélectionner `redahasnaouy-stack/artdecormaroc` et la branche qui contient ce code.
3. Laisser Netlify lire `netlify.toml` : dossier publié `public`, Functions `netlify/functions`. Commande de build : laisser vide. Aucun serveur `npm start` ni dossier `/docs` sur Netlify.
4. Ajouter uniquement `ADMIN_PASSWORD` (secret privé d’au moins 12 caractères) dans les variables Netlify disponibles aux Functions. Redéployer après le changement.
5. Vérifier `/api/products`, `/admin`, puis une commande de test.

Aucun compte Neon, PostgreSQL ou variable `DATABASE_URL` n’est nécessaire. Les produits, commandes et stocks sont conservés côté serveur dans le store Netlify Blobs `artdecor-store-v1`, propre au site, partagé entre ses déploiements. Le catalogue de démonstration est utilisé avant la première écriture. Les mises à jour utilisent une lecture forte et des écritures conditionnelles par ETag pour éviter les pertes de mises à jour concurrentes.

En local, `npm start` continue à utiliser SQLite. Les données SQLite ou d’un ancien PostgreSQL ne sont pas transférées automatiquement. Le store actuel conserve l’ensemble de la boutique dans un document : adapté à une petite boutique ; archiver les commandes et revoir le stockage si le volume augmente. Les previews du même site peuvent accéder aux mêmes données : ne pas y saisir des commandes d’essai après ouverture commerciale.

Le déploiement et la persistance réelle sur votre compte Netlify restent à vérifier. Les tests locaux couvrent l’authentification, les conflits d’écriture simulés et le parcours SQLite. Une modification de `ADMIN_PASSWORD` invalide les sessions existantes. Aucun mot de passe ni token Blobs ne doit être ajouté au dépôt.

## Photos et migration du catalogue

Dans `/admin`, modifier un produit puis sélectionner **Photo du produit** depuis l’appareil. L’interface réduit la photo à 1600 pixels maximum et l’envoie au serveur ; l’aperçu permet de vérifier le résultat avant **Enregistrer**. Formats : JPEG, PNG ou WebP, 2 Mo maximum après compression. Les fichiers sont conservés dans Netlify Blobs (`artdecor-images`) ou dans `data/images` en local. Le téléchargement est réservé à l’administrateur ; les images publiées sont accessibles publiquement.

La migration du catalogue Engro est appliquée une seule fois. Les anciennes fiches de démonstration encore inchangées sont remplacées ; les produits personnalisés et les commandes sont préservés. Les imports ne synchronisent pas automatiquement les prix ni le stock fournisseur. Le header reste visible pendant le défilement. Les commandes se font directement depuis la fiche produit, sans panier.

Une migration unique ajoute 10 unités aux produits Engro déjà importés dont le stock est encore 0. Les quantités positives et les produits personnalisés restent inchangés. Elle ne se réapplique pas après une vente ou un passage à zéro ultérieur.

## Commande directe sans panier

Chaque fiche produit propose **Commander ce produit**. Le client renseigne quantité, nom, téléphone, ville et adresse ; le récapitulatif affiche le prix, les frais de livraison (39 DH, offerts dès 800 DH) et le total avant confirmation. Paiement à la livraison, sans paiement électronique. La commande apparaît dans `/admin` avec les coordonnées, les articles et le statut Nouvelle.

Les prix et la disponibilité sont validés côté serveur et le stock est déduit atomiquement. Un identifiant de demande empêche une double création lors d’une répétition de la même requête. Les anciennes commandes sont préservées. Les coordonnées ne sont accessibles que dans l’administration authentifiée.

## Google Sheets

Les nouvelles commandes peuvent être copiées automatiquement dans Google Sheets. Instructions de configuration : [integrations/google-sheets/README.md](integrations/google-sheets/README.md). Définir `GOOGLE_SHEETS_WEBHOOK_URL` et `GOOGLE_SHEETS_SYNC_TOKEN` côté Netlify après déploiement du script Google. Sans configuration, le site continue à enregistrer les commandes et affiche **À configurer** dans l’administration.

## Renouvellement du catalogue ArtDecor

La révision `artdecor-engro-2026-10-23` remplace les 24 références initiales par 24 autres références Engro, avec leurs photos locales et prix fournisseur. Les anciennes fiches encore inchangées sont retirées ; les fiches modifiées (y compris leur stock), les produits ajoutés par l’administration et toutes les commandes sont conservés. Les identifiants ne sont pas réutilisés. La migration est exécutée une seule fois, sur SQLite au démarrage et sur Netlify Blobs à la première lecture après déploiement. Une simple modification du fichier catalogue ne suffisait pas à actualiser les données déjà enregistrées. Les quantités initiales restent des exemples à vérifier, pas une disponibilité fournisseur confirmée.

## Nouveau projet Netlify

Cette copie reprend ArtDecor (révision 1a07599) : thème mauve, 24 références Engro distinctes de decoration.ma, administration et intégration Google Sheets. Importer ce dépôt dans un nouveau projet Netlify, branche main, dossier publié public, Functions netlify/functions, commande de build vide. Configurer ADMIN_PASSWORD et, si nécessaire, GOOGLE_SHEETS_WEBHOOK_URL et GOOGLE_SHEETS_SYNC_TOKEN dans les variables des Functions puis redéployer. Les valeurs ne sont jamais incluses dans Git.

Les données et images téléversées du précédent projet Netlify ne sont pas copiées : chaque site possède son propre stockage Blobs. Conserver l’ancien projet. Avant de rattacher artdecormaroc.com, retirer son association à l’ancien projet ; si le verrou SSL bloque cette opération, contacter le support Netlify. Aucun transfert DNS ou domaine n’est effectué par ce dépôt.
