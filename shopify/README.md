# ArtDecor Mauve — Shopify

Thème Shopify Online Store 2.0 reprenant la direction artistique mauve/lavande d’ArtDecor : couverture éditoriale, photos intérieures, collection, récit de marque et pied de page. Sections et textes de la page d’accueil éditables dans l’éditeur de thème. Catalogue, fiche produit/variantes, panier, recherche, tri, pagination, pages de contenu et écran de mot de passe utilisent les objets et formulaires natifs Shopify.

## Installer

1. Dans Shopify Admin : **Boutique en ligne / Online Store → Thèmes / Themes → Importer un thème / Import theme → Importer un fichier ZIP** (le libellé peut varier).
2. Téléverser **ArtDecor-Mauve-Shopify.zip**. Ouvrir l’aperçu avant publication.
3. Dans **Personnaliser / Customize**, choisir les photos, les textes, la collection à la une, le menu principal et le menu de pied de page. Le nom affiché ArtDecor est éditable dans l’en-tête et le pied de page.
4. Dans **Paramètres**, définir le nom commercial, la devise (MAD si nécessaire), les marchés, les taxes applicables, les zones et tarifs de livraison et les politiques de vente/retour/confidentialité. Aucun tarif de livraison ni frais de paiement n’est codé dans le thème.
5. Pour le paiement à la livraison : **Paramètres → Paiements → Moyens de paiement manuels → Paiement à la livraison / Cash on Delivery**. Vérifier la disponibilité et les instructions proposées par Shopify pour votre boutique. Le checkout est géré par Shopify, pas par le thème.
6. Les produits, stocks et commandes se gèrent dans Shopify Admin. L’administration privée Netlify ne fait pas partie du thème.

## Importer les 24 produits (facultatif)

Dans **Produits → Importer**, utiliser **ArtDecor-Shopify-Produits.csv**. Les 24 références proviennent de la sélection Engro ArtDecor, avec description, SKU, prix fournisseur et URL de photo. Shopify télécharge les photos depuis leurs URL publiques ; contrôler le résultat de l’import, qui peut dépendre de leur disponibilité.

Les produits sont volontairement en **brouillon**, non publiés, avec stock **0** : renseigner les prix de vente et le stock réel, vérifier les taxes et les descriptions avant activation. Les prix sont ceux du fournisseur, sans marge, dans sa devise d’origine (DH/MAD). Configurer la devise de la boutique avant import. Le CSV n’importe aucun client, commande, mot de passe ou réglage d’intégration.

Créer les collections puis choisir la collection à la une dans l’éditeur. Les collections peuvent aussi être ajoutées au menu principal. La recherche et le tri sont natifs Shopify. Pas de synchronisation automatique du catalogue ou du stock Engro.

## Migration depuis Netlify

Cette livraison prépare le thème ; elle ne crée pas de compte Shopify, ne publie pas de thème sur un magasin et ne déplace pas le domaine.

Conserver le site Netlify et ses données pendant la préparation. Les commandes historiques, photos téléversées dans l’admin, modifications de catalogue et comptes clients ne sont pas transférés automatiquement. L’intégration Google Sheets des Netlify Functions n’est pas installée dans Shopify : une automatisation Shopify distincte devra être configurée si souhaitée.

Le domaine artdecormaroc.com reste sur son hébergement actuel. Ne modifier son DNS qu’après la préparation de la boutique, en suivant les valeurs exactes fournies dans **Shopify → Paramètres → Domaines**. Préserver les enregistrements de messagerie.

## Validation

Shopify CLI Theme Check : fichiers Liquid, schémas et structure contrôlés. La publication, l’import réel du CSV et un parcours panier/checkout réel exigent un accès à la boutique Shopify et restent à vérifier dans son aperçu. Avant publication, tester un produit à plusieurs variantes, un article épuisé, la modification des quantités, les frais de livraison et une commande de test.

Développement : Node.js et Shopify CLI. `shopify theme check --path <dossier-du-theme>`. Le ZIP contient directement layout/, assets/, config/, sections/, snippets/, templates/, locales/ sans dossier parent et sans les données Netlify.
