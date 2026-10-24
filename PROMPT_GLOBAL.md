# Prompt global — Frise Chronologique Interactive (RAJ Editions)

## Rôle et objectif
Agis en tant que développeur front-end expert. Crée une application web de frise chronologique interactive destinée à un usage scolaire (élèves/enseignants). Le livrable est **un fichier HTML unique et autonome** (HTML, CSS et JavaScript inline), **sans dépendance externe** (ni html2canvas, ni jsPDF, ni framework). Seules les polices Google Fonts sont autorisées. L'app doit ensuite pouvoir être empaquetée en application Windows (.exe) via Electron.

## 1. Design & identité visuelle
- **Typographie** : Lora (serif) pour les titres, Source Sans 3 pour l'interface.
- **Palette** : teal `#3a7d76`, bordeaux `#8c2b35`, rouille `#b5451e`, or `#c8922a`, ardoise `#4a5568`, olive `#5c6e2e`, prune `#6b3f5e`, bleu nuit `#2c4a5e`.
- **Fonds** : principal crème (`#f0ece1`), bande horizontale centrale (`#e2ddcf`), blanc pour masthead/toolbar/modales.
- **Style UI** : élégant, éditorial, boutons typographiques sans bordures arrondies (hors carte « état vide »).

## 2. En-tête (masthead)
- À gauche : logo (`<img>` en base64, **léger** — 40×40 px, pas de PNG de plusieurs centaines de Ko), suivi de la mention **« 🄯 RAJ Editions »** (police Lora, petite, couleur ardoise).
- Centre : grand titre éditable au clic (`contenteditable`), et dessous trois champs discrets alignés « Nom », « Prénom », « Classe » (fond transparent, bordure visible au survol/focus).
- À droite : compteur dynamique du nombre d'éléments (les césures ne comptent pas).

## 3. Barre d'outils
- Plage d'années « De / À » + bouton « Appliquer ».
- Zoom : « − », « + », « Ajuster » (zoom automatique = largeur de l'écran, recalculé à chaque ajout/modification/redimensionnement).
- Échelles primaire et secondaire : « Auto » ou valeurs fixes (1, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000 ans).
- Actions : « ❓ Aide », « ✎ Style axe », « + Ajouter », « 💾 Sauvegarder », « 📂 Ouvrir », « 🗑️ Effacer » (avec confirmation), « Export PNG », « Export PDF ».

## 4. Axe et zone de dessin
- Zone scrollable déplaçable par cliquer-glisser sur le fond.
- **Marge de sécurité** `MARGIN_X = 60px` à gauche et à droite dans tous les calculs.
- Axe en SVG personnalisable en direct (modale « Style axe ») : épaisseur, couleur (sélecteur + pastilles), type de trait (plein/tirets/pointillés), style de flèche (triangle plein, chevron, losange, cercle, aucune).
- Graduations : primaire (trait long + texte avec contour clair), secondaire (trait court semi-transparent, sans texte).
- **Échelle « Auto » dépendante du zoom** : choisir le plus petit intervalle garantissant un espacement minimal en pixels (≈80 px primaire, ≈16 px secondaire) à partir de `pxPerYear` — jamais uniquement à partir de la plage d'années.

## 5. Éléments chronologiques
Trois types : **événement ponctuel**, **période**, **césure**.
- Événement : point coloré sur l'axe (zone de clic élargie autour du point visible), ligne d'attache verticale en pointillés de la couleur de la catégorie, carte avec bordure supérieure colorée, image redimensionnable, date complète formatée, titre, description. Position haut/bas/auto (alternance), alignement gauche/centre/droite.
- Période : idem + bande colorée semi-transparente sur l'axe.
- **Césure (saut de temps)** : plage début→fin compressée sur l'axe en une largeur fixe de **30 px** avec un symbole de rupture en zigzag couvrant **exactement** la zone compressée `[bx, bx+30]`. Les césures qui se chevauchent sont fusionnées ; les graduations situées dans une césure sont masquées ; l'échelle (px/an) et le zoom auto tiennent compte de l'espace gagné ; double-clic sur le symbole pour modifier. Une césure n'a ni carte, ni point, ni entrée de légende.
- **Infobulle personnalisée** au survol (carte ou point) : image, date complète, titre, description intégrale ; positionnée près du curseur avec retournement aux bords de l'écran.
- Icône ✎ visible au survol d'une carte. Tout texte injecté dans le DOM est **échappé** (titre, description, catégorie).

## 6. Interactions avancées
- Seuil de mouvement (~3–5 px) pour distinguer clic et glissement (ne doit pas bloquer le double-clic).
- Double-clic dans le vide : crée un élément à l'année survolée. Double-clic sur une carte, un point ou une césure : édition.
- État vierge : axe en filigrane (opacité 40 %) + grand encadré cliquable (simple clic) pour ajouter le premier événement.
- Redimensionnement d'image : poignée en bas à droite, dimensions sauvegardées dans l'objet.
- Glisser vertical sur une carte : modifie sa distance à l'axe (la ligne d'attache suit en direct).
- Glisser horizontal : déplace la date en direct avec **aimantation selon la précision d'origine** (année seule → année entière ; mois → mois ; jour → jour).
- **Dates exactes** : conversion date ↔ année décimale via de vraies dates calendaires (`Date.UTC`, années bissextiles, mois de longueur variable). Aucune approximation du type « 30,416 jours/mois » (sinon dates invalides comme « 31 février »).

## 7. Modales et sauvegarde
- Modale d'édition : type, titre, début (J/M/A), fin (J/M/A pour période et césure), description, image (upload ou glisser-déposer, base64), catégorie (pastilles de couleur + nom), position, alignement, bouton Supprimer. Pour une césure : seuls type + dates début/fin sont affichés ; fin obligatoire et postérieure au début.
- Modale « Aide » : guide d'utilisation (navigation, glisser-déposer, césures, sauvegarde/export).
- « Sauvegarder » télécharge un `.json` (événements, style d'axe, vue/zoom/bornes, titre, infos élève) ; « Ouvrir » recharge et régénère la frise.
- Légende en pied de page : pastilles des catégories utilisées (masquée si aucune).

## 8. Moteur d'export natif (sans bibliothèque)
- `generateExportCanvas()` dessine tout sur un `<canvas>` hors écran en haute résolution (×2) : marge haute, logo (attendre `Image.onload`), titre centré, champs élève s'ils sont remplis, bande centrale, axe (avec zigzags de césure et flèche), graduations et textes identiques à l'écran, lignes d'attache en pointillés (`setLineDash([3,3])`), bandes de périodes, points, cartes (retour à la ligne automatique, dimensions d'images modifiées par drag).
- **PNG** : `canvas.toDataURL` → téléchargement.
- **PDF** : conversion en image, superposition plein écran, `@media print { @page { size: landscape; } }`, `window.print()`, puis restauration de la vue.

## 9. Application Windows (.exe)
- Empaquetage **Electron** (`main.js` charge `index.html`, menu masqué, fenêtre 1400×900) avec **electron-builder** : installeur NSIS (raccourcis Bureau/Menu Démarrer, dossier d'installation modifiable) + version portable.
- Versions : Electron 44, electron-builder 26. Prérequis : Node.js ≥ 22.12 (testé avec Node 24 LTS) ; icône `.ico` multi-résolution incluant **256×256** (obligatoire pour l'installeur) ; `appId` `com.rajeditions.frisechronologique`, auteur « RAJ Editions ».
- Commande : `npm install` puis `npm run dist` (script `build.js`) → exécutables copiés dans `release/`.
- `build.js` construit hors OneDrive (`%LOCALAPPDATA%\frise-chronologique-build`) pour éviter les échecs de `rcedit` et la synchronisation de ~300 Mo de fichiers intermédiaires.
- **Source unique** : `frise-desktop/index.html`. `frise.html` (version web) en est une copie, régénérée automatiquement à chaque `npm run dist`.

## Contraintes de qualité
- Un seul fichier HTML autonome pour l'app ; aucun appel réseau hormis Google Fonts.
- Aucune erreur console ; code lisible, commenté seulement là où c'est non évident.
- Tester les interactions (drag horizontal/vertical, redimensionnement d'image, césures, zoom/échelle auto, sauvegarde/ouverture JSON, exports) avant livraison.
