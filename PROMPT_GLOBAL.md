# Prompt global — Frise Chronologique Interactive (Technologie Services)

## Rôle et objectif
Agis en tant que développeur front-end expert. Crée une application web de frise chronologique interactive destinée à un usage scolaire (élèves/enseignants). Le livrable est **un fichier HTML unique et autonome** (HTML, CSS et JavaScript inline), **sans dépendance externe** (ni html2canvas, ni jsPDF, ni framework). Seules les polices Google Fonts sont autorisées. L'app doit ensuite pouvoir être empaquetée en application Windows (.exe) via Electron.

## 1. Design & identité visuelle
- **Typographie** : une seule famille, **Inter** (Google Fonts), pour les titres, l'interface et les exports, comme les éditeurs EasyBloc. **Aucun emoji** : icônes SVG au trait (`<symbol>` réutilisés par `<use href="#i-…">`).
- **Palette** : teal `#3a7d76`, bordeaux `#8c2b35`, rouille `#b5451e`, or `#c8922a`, ardoise `#4a5568`, olive `#5c6e2e`, prune `#6b3f5e`, bleu nuit `#2c4a5e`.
- **Fonds** : principal crème (`#f0ece1`), bande horizontale centrale (`#e2ddcf`), blanc pour la bande du titre, les modales et le pied de page ; bandeau d'outils en dégradé vert d'eau `#1f9e8f` vers violet `#6a2c91` sans filet (charte Educatech, comme le bandeau des éditeurs Easybloc). Le violet `#6a2c91` sert d'accent (bouton principal, onglet actif, focus).
- **Style UI** : celui du bandeau EasyBloc — bandeau de 44 px, boutons transparents à texte blanc de 13 px, arrondi de 4 px, menu déroulant blanc ; dans les fenêtres, boutons de 34 px arrondis à 4 px, fenêtre arrondie à 8 px avec titre sur fond dégradé.

## 2. En-tête : bandeau d'outils puis bande du titre (variante A, choisie le 23/11/2026)
- À gauche : logo Technologie Services (`<img class="masthead-logo">` en base64, **léger** — `logo_ts.png` 360×100, environ 19 Ko ; pas de PNG de plusieurs centaines de Ko) sans pastille, couleurs d'origine, comme dans les éditeurs. Aucune mention de copyright. L'export PNG / PDF dessine ce même logo (`.masthead-logo`).
- Bandeau d'outils (dégradé) : logo, menu « Fichier », bouton « Ajouter » (blanc), période, zoom, graduations, « Style de l'axe », « Aide » à droite. Sous 1100 px de large, il passe sur plusieurs lignes au lieu de déborder.
- Bande blanche dessous : titre éditable au clic (`contenteditable`, une ligne, texte d'invite quand il est vide), champs « Nom », « Prénom », « Classe » avec libellés visibles, compteur d'éléments (« 1 élément », « 11 éléments » ; les césures ne comptent pas).

## 3. Bandeau d'outils
- Période « De / À » + « Appliquer » (ou Entrée) : refusée avec un message si une année manque ou si la première n'est pas antérieure à la seconde. Les éléments hors de la période ne sont pas dessinés et un message en indique le nombre.
- Zoom : « − », « + », « Ajuster » (la période couvre tous les éléments avec une marge de 5 %, et la frise prend la largeur de l'écran). Ajouter un élément hors de la période l'élargit juste assez pour le montrer.
- Graduations principales dans le bandeau ; graduations secondaires dans la fenêtre « Style de l'axe » : « Auto » ou valeurs fixes (1, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000 ans).
- Menu « Fichier » : Ouvrir… (Ctrl+O), Sauvegarder (Ctrl+S), Exporter en image (PNG), Imprimer ou enregistrer en PDF, Effacer la frise… (avec confirmation). Navigation au clavier (flèches, Échap).

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
- **Césure (saut de temps)** : plage début→fin compressée sur l'axe en une largeur fixe de **56 px** (variante C, choisie le 23/11/2026) : l'axe s'interrompt et la zone compressée `[bx, bx+56]` est tracée en pointillés, avec un trait à chaque bord et une pastille violette indiquant la durée masquée (« 30 ans », « 4 mois »). La date de début est écrite à gauche du bord gauche et la date de fin à droite du bord droit : elles ne peuvent pas se chevaucher ; les étiquettes de graduation qui les toucheraient sont omises. Les césures qui se chevauchent sont fusionnées ; les graduations situées dans une césure sont masquées ; l'échelle (px/an) et le zoom auto tiennent compte de l'espace gagné ; double-clic sur la césure pour la modifier. Une césure n'a ni carte, ni point, ni entrée de légende. L'export dessine la césure à l'identique.
- **Infobulle** : au survol d'un point, et au survol d'une carte seulement si sa description y est coupée (sinon elle répéterait la carte) ; filet supérieur de la couleur de la catégorie.
- Crayon (bouton rond de la couleur de la catégorie) visible au survol d'une carte : un clic ouvre la modification. Tout texte injecté dans le DOM est **échappé** (titre, description, catégorie).

## 6. Interactions avancées
- Seuil de mouvement (~3–5 px) pour distinguer clic et glissement (ne doit pas bloquer le double-clic).
- Double-clic dans le vide : crée un élément à l'année survolée. Double-clic sur une carte, un point ou une césure : édition.
- État vierge : axe en filigrane (opacité 40 %) + grand encadré cliquable (simple clic) pour ajouter le premier événement.
- Redimensionnement d'image : poignée en bas à droite, dimensions sauvegardées dans l'objet.
- Glisser à la souris, au stylet ou au doigt (Pointer Events, `touch-action: none` sur la zone de dessin) ; sur écran tactile, le crayon reste visible. La césure est atteignable au clavier (Tab, puis Entrée).
- Le glisser ne démarre qu'au clic gauche (un clic droit n'accroche plus la carte au curseur). La direction est fixée au début du geste : vertical = distance à l'axe seulement (la date ne change pas), horizontal = date seulement.
- Glisser horizontal : déplace la date en direct avec **aimantation selon la précision d'origine** (année seule → année entière ; mois → mois ; jour → jour).
- **Placement sans chevauchement** : à l'affichage, chaque carte qui en chevauche une autre du même côté est éloignée de l'axe par paliers ; en position « automatique », elle va du côté où elle s'éloigne le moins. Le réglage manuel de la distance sert de point de départ. Sous l'axe, une carte laisse au moins 48 px pour les années des graduations ; les étiquettes de graduation trop proches (autour d'une césure) sont omises. Pour une période, la carte s'attache au début, au milieu ou à la fin selon l'alignement. Si les cartes dépassent la hauteur visible, la zone de dessin s'agrandit (défilement vertical, centré sur l'axe) au lieu de les couper ; l'export inclut toute la hauteur.
- **Dates exactes** : conversion date ↔ année décimale via de vraies dates calendaires (années bissextiles, mois de longueur variable), avec `setUTCFullYear` (et non `Date.UTC`, qui lit les années 0 à 99 comme 1900 à 1999). Mois en minuscules, « 1er » pour le premier jour, années négatives affichées « 44 av. J.-C. » ; l'année 0 est refusée.

## 7. Modales et sauvegarde
- Modale d'édition : onglets Événement / Période / Césure, titre, date ou début (J/M/A), fin (période et césure), description, image (PNG, JPEG, GIF ou WebP, réduite à 1000 px de côté à l'import), catégorie (pastilles nommées pour les lecteurs d'écran + nom), position, alignement, bouton Supprimer. Pour une césure : seules les dates, avec une phrase d'explication. **Erreurs sous le champ concerné** (pas d'alerte du navigateur) : titre manquant, année manquante ou 0, jour sans mois ou hors du mois, fin antérieure au début. Légende « * champ obligatoire ».
- Modale « Aide » : guide d'utilisation (navigation, glisser-déposer, césures, sauvegarde/export).
- « Sauvegarder » télécharge un fichier **`.frise`** (format propre à l'application, nommé d'après le titre) : signature `FRISE`, un octet de numéro de format (1 = gzip, 0 = non compressé si le navigateur n'a pas `CompressionStream`), puis les données (événements, style d'axe, vue/zoom/bornes, titre, infos élève) compressées avec `CompressionStream`, sans bibliothèque. Ce n'est pas une protection : le but est d'éviter les modifications à la main et d'alléger les fichiers. « Ouvrir » accepte `.frise` et les anciens `.json` ; un format plus récent, un fichier abîmé ou de plus de 60 Mo est refusé avec un message. Le fichier est rechargé **après contrôle champ par champ** (`sanitizeData`, qui retire aussi un jour impossible comme le 31 février et remet dans l'ordre une période ou une césure inversée) : seuls des textes, des nombres, des couleurs `#rrggbb` et des images `data:image/(png|jpeg|gif|webp);base64` sont repris, pour qu'un fichier modifié ne puisse pas exécuter de code.
- **Sauvegarde automatique** dans le navigateur (`localStorage`, clé `frise_chronologique_v1`), restaurée à l'ouverture avec un message. Avertissement avant de quitter seulement si cette sauvegarde a échoué (jamais dans l'application Windows, où il bloquerait la fermeture sans message).
- Légende en pied de page : pastilles des catégories utilisées (masquée si aucune).

## 8. Moteur d'export natif (sans bibliothèque)
- `generateExportCanvas()` dessine tout sur un `<canvas>` hors écran en haute résolution (×2) : marge haute, logo (attendre `Image.onload`), titre centré, champs élève s'ils sont remplis, bande centrale, axe (avec les césures : pointillés, pastille de durée et dates ; et la flèche), graduations et textes identiques à l'écran, lignes d'attache en pointillés (`setLineDash([3,3])`), bandes de périodes, points, cartes (retour à la ligne automatique, dimensions d'images modifiées par drag).
- **PNG** : `canvas.toDataURL` → téléchargement.
- **PDF** : conversion en image, superposition plein écran, `@media print { @page { size: landscape; } }`, `window.print()`, puis restauration de la vue.

## 9. Application Windows (.exe)
- Empaquetage **Electron** (`main.js` charge `index.html`, menu masqué, fenêtre 1400×900, une seule instance, `sandbox`) avec **electron-builder** : installeur NSIS (raccourcis Bureau/Menu Démarrer, dossier d'installation modifiable) + version portable. L'installeur associe l'extension `.frise` à l'application (`fileAssociations`) : un double-clic sur un fichier l'ouvre, dans la fenêtre déjà ouverte s'il y en a une. `main.js` lit le fichier et l'envoie à la page par `preload.js`, qui n'expose que `window.friseDesktop.onOpenFile`. La version portable n'enregistre pas d'association.
- Versions : Electron 44, electron-builder 26. Prérequis : Node.js ≥ 22.12 (testé avec Node 24 LTS) ; icône `.ico` multi-résolution incluant **256×256** (obligatoire pour l'installeur) ; `appId` `com.rajeditions.frisechronologique`, auteur « RAJ Editions ».
- Commande : `npm install` puis `npm run dist` (script `build.js`) → exécutables copiés dans `release/`.
- `build.js` construit hors OneDrive (`%LOCALAPPDATA%\frise-chronologique-build`) pour éviter les échecs de `rcedit` et la synchronisation de ~300 Mo de fichiers intermédiaires.
- **Source unique** : `frise-desktop/index.html`. `index.html` à la racine (version web publiée par GitHub Pages) en est une copie, régénérée automatiquement à chaque `npm run dist`.

## Contraintes de qualité
- Un seul fichier HTML autonome pour l'app ; aucun appel réseau hormis Google Fonts.
- Aucune erreur console ; code lisible, commenté seulement là où c'est non évident.
- Tester les interactions (drag horizontal/vertical, redimensionnement d'image, césures, zoom/échelle auto, sauvegarde/ouverture JSON, exports) avant livraison.
