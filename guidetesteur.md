# 🎯 PLAN'INK — GUIDE TESTEURS
 
## 👋 Bienvenue dans Plan'ink !
 
Plan'ink est un **studio manager** complet pour gérer tatouages, clients, RDV et contrats.
 
---
 
## 📚 Table des matières
 
1. [🚀 Démarrage rapide](#démarrage-rapide)
2. [📊 Tableau de Bord](#tableau-de-bord)
3. [👥 Gestion Clients](#gestion-clients)
4. [📅 Agenda & RDV](#agenda--rdv)
5. [📦 Gestion Stocks](#gestion-stocks)
6. [📄 Contrats](#contrats)
7. [💡 Tips & Tricks](#tips--tricks)
8. [🐛 Reporting Bugs](#reporting-bugs)
 
---
 
## 🚀 Démarrage Rapide
 
### Installation
1. Ouvrir `index.html` dans un navigateur (Chrome, Firefox, Safari)
2. L'app charge automatiquement **3 clients + 3 RDV + 8 stocks de démo**
3. Les données sont sauvegardées **localement** (localStorage)
 
### Interface
- **Sidebar gauche** : Navigation (5 pages)
- **Contenu principal** : Page active avec formulaires & tables
- **Modales** : Formulaires pour créer/éditer
 
---
 
## 📊 Tableau de Bord
 
### Vue d'ensemble
C'est votre **hub central**. Vous voyez :
- 📈 4 stat cards : Clients, Séances aujourd'hui, À venir, Alertes
- 📅 Prochains RDV (5 prochains)
- ⚠️ Alertes stocks (produits faibles)
 
### Interaction
- **Cliquer sur un RDV** → Voir détails du jour
- **Section vide** → Créer nouveau RDV/produit
 
### Color-coding
- 🟢 Vert = OK, stocks bons
- 🟠 Orange = Alerte, stocks faibles
- 🔴 Rouge = Rupture, stock à zéro
 
---
 
## 👥 Gestion Clients
 
### Affichage
Table avec :
- Avatar (initiales) + Nom
- Email + Tél
- Date naissance
- Allergies (badge rouge si présentes)
- Nombre RDV
- Date d'ajout
 
### Actions
 
#### Créer un Client
1. Clic `+ AJOUTER`
2. Remplir :
   - ✅ Prénom (obligatoire)
   - ✅ Nom (obligatoire)
   - Email
   - Téléphone
   - Date de naissance
   - Allergies (très important !)
   - Notes (style, préférences, etc.)
3. Clic `ENREGISTRER`
 
#### Voir Détails Client
1. Clic bouton `VOIR`
2. Modal avec :
   - Info client (grand avatar)
   - Allergies en badge rouge ⚠️
   - Historique RDV complet
   - Nombre contrats
3. Depuis là : `+ RDV` rapide
 
#### Éditer Client
1. Clic bouton `EDIT`
2. Modifier champs
3. Clic `SAUVEGARDER`
 
#### Supprimer Client
1. Clic `✕`
2. Confirmation
3. ⚠️ Irréversible !
 
### Recherche
- Champ en haut : Recherche **en temps réel**
- Cherche par : Prénom, Nom, Email
- Vide = montre tous
 
### Tips
- ✅ **Toujours remplir allergies** (important légal)
- 📝 Notes = contexte (premier RDV, style, références)
- 📞 Tél + Email = contact rappels RDV
 
---
 
## 📅 Agenda & RDV
 
### Calendrier
- **Vue mensuelle** : Grille 7x6
- **Jour courant** : Bordure noire + fond gris clair
- **RDV chips** : Heure + titre du tatouage
- **Clic jour** → Voir tous RDV du jour
 
### Navigation
- `← PRÉCÉDENT` / `SUIVANT →` : Mois
- `AUJOURD'HUI` : Retour à maintenant
 
### Créer RDV
1. Clic `+ NOUVEAU RDV`
2. Sélectionner client (obligatoire)
3. Remplir :
   - ✅ Titre/Description (ex: "Dragon dos")
   - Date (par défaut : aujourd'hui)
   - Heure (par défaut : 10:00)
   - Durée en minutes (15, 30, 45, 60, 90, 120...)
   - Statut : Confirmé / En attente
   - Notes : Références, détails
4. Clic `ENREGISTRER`
 
### Statuts RDV
- 🟢 **CONFIRMÉ** : Client a validé
- 🟡 **EN ATTENTE** : Attente confirmation
- 🔵 **TERMINÉ** : Séance faite
- 🔴 **ANNULÉ** : Annulé (ne compte pas)
 
### Sidebar Droit
- Prochains RDV (8 max)
- Cliquable = voir détails du jour
 
### Tips
- ⏰ Durée = temps estimé (utile pour planning)
- 📝 Notes = infos importantes (références, follow-up)
- 🔔 Vérifier allergies client avant RDV !
 
---
 
## 📦 Gestion Stocks
 
### Affichage
Table avec :
- Produit + Catégorie
- Quantité + Barre de progress
- Seuil d'alerte
- État : 🟢 OK / 🟠 FAIBLE / 🔴 RUPTURE
- Prix unitaire
- Valeur totale
- Actions
 
### Filtres
- `TOUS` : Voir tout
- `ENCRES`, `AIGUILLES`, etc. : Par catégorie
- Filtre = conservé lors de navigation
 
### Stat Cards
- **Total** : Nombre produits
- **Alertes** : Produits faibles
- **Ruptures** : À zéro (urgent !)
 
### Actions
 
#### Ajouter Produit
1. Clic `+ NOUVEAU PRODUIT`
2. Remplir :
   - Catégorie (dropdown)
   - Nom (obligatoire)
   - Quantité actuelle
   - Unité (flacons, boîtes, pièces...)
   - Seuil alerte (ex: 5)
   - Prix unitaire (€)
3. Clic `ENREGISTRER`
 
#### Ajuster Quantité
1. Clic bouton `±`
2. Voir quantité actuelle (gros chiffre)
3. Quick buttons : `-5, -1, +1, +5`
4. Ou taper directement
5. Clic `VALIDER`
 
#### Éditer Produit
1. Clic `EDIT`
2. Modifier tous champs
3. Clic `SAUVEGARDER`
 
#### Supprimer
1. Clic `✕`
2. Confirmation
 
### Color Bars
- 🟢 **VERT (OK)** : Au-dessus du seuil
- 🟠 **ORANGE (ALERTE)** : Au seuil ou juste dessous
- 🔴 **ROUGE (RUPTURE)** : Zéro
 
### Tips
- 📊 Barre = % du seuil (100% = seuil atteint)
- 💰 Valeur = quantité × prix (utile budget)
- 🚨 Dashboard alerte = vérifier stocks immédiatement
- 📝 Catégorie = tri rapide
 
---
 
## 📄 Contrats
 
### Affichage
Table avec :
- Avatar client + Nom
- Description du tatouage
- Zone corporelle (badge bleu)
- Date séance
- Statut : ✓ SIGNÉ / EN ATTENTE
- Actions
 
### Stat Cards
- **Total** : Nombre contrats
- **Signés** : Nombre + %
- **À signer** : Urgents
 
### Filtres
- `TOUS` : Afficher tous
- `SIGNÉS` : Seulement signés
- `À SIGNER` : Seulement en attente
 
### Créer Contrat
1. Clic `+ NOUVEAU CONTRAT`
2. Sélectionner client (remplit allergies auto)
3. Remplir :
   - Description tatouage (obligatoire)
   - Zone corporelle (dropdown)
   - Date séance
   - Statut : Non signé / Signé
   - Allergies (pré-rempli, éditable)
   - Notes médicales (optionnel)
4. Clic `APERÇU` → Voir rendu PDF
5. Clic `GÉNÉRER` → Sauvegarde
 
### Voir Contrat
1. Clic `VOIR`
2. Modal : Contrat complet (lisible)
3. Clic `IMPRIMER / PDF` → Open print dialog
4. `Ctrl+P` ou `Cmd+P` → Imprimer physique ou enregistrer PDF
 
### Contenu Contrat
Formulaire légal complet avec :
- ✍️ Infos client (nom, DOB, email, tél)
- 📝 Description tatouage & zone
- ⚠️ Déclarations médicales (checklist)
- 👍 Consentement éclairé
- 🏥 Soins post-tatouage
- 📷 Autorisation photos
- ✍️ 2 zones signature (client + tatoueur)
 
### Tips
- 📋 Toujours faire contrat AVANT séance
- 🏥 Vérifier allergies avant signature
- 🖨️ Imprimer en color → meilleur rendu
- 📁 Garder copies : client + dossier
 
---
 
## 💡 Tips & Tricks
 
### Clavier
- `Tab` → Naviguer formulaires
- `Escape` → Fermer modal
- `Ctrl+S` / `Cmd+S` → Sauvegarde auto (localStorage)
 
### Données
- **Sauvegarde auto** : localStorage (navigateur) ou fichier (Electron)
- **Pas de serveur** : Données 100% locales
- **Export** : Future fonctionnalité (JSON/CSV)
 
### Performance
- Recherche = temps réel (0ms lag)
- Calendrier = 42 cellules, rapide
- Tables = 100+ lignes ok
- Modales = smooth animations
 
### Accessibilité
- ✅ WCAG AA (noir/blanc contraste max)
- ✅ Clavier complet navigable
- ✅ Labels clairs + placeholders
- ✅ Mobile responsive
 
---
 
## 🐛 Reporting Bugs
 
### Avant de Reporter
- ✅ Rafraîchir page (`F5`)
- ✅ Vider localStorage si bug persistant
  ```javascript
  localStorage.clear();
  ```
- ✅ Tester sur autre navigateur (Chrome, Firefox)
 
### Info à Fournir
1. 🖥️ **Navigateur** : Chrome 120, Firefox 115, Safari...
2. 📱 **Device** : Desktop, Tablet, Mobile
3. 🔴 **Bug description** : Quoi, où, quand
4. 📸 **Screenshot** : Si visuel
5. 🔄 **Étapes reproduire** : 1, 2, 3...
6. 💾 **Données démo** : Stock vide ? Clients supprimés ?
 
### Types Bugs Fréquents
- ❌ RDV n'apparaît pas → Vérifier date
- ❌ Client invisible → Filtre actif ? Supprimer ?
- ❌ Formulaire ne soumet pas → Champs obligatoires ?
- ❌ Style cassé → Clear cache (`Ctrl+Shift+Delete`)
 
---
 
## 🎯 Cas d'Usage Réalistes
 
### Matin : Vérifier Journée
1. Dashboard → Voir RDV du jour
2. Cliquer RDV → Voir client + allergies
3. Contrats → Vérifier signatures
4. Stocks → Checker alertes
 
### RDV : Avant Séance
1. Clients → Chercher client
2. VOIR → Historique + allergies ⚠️
3. Contrats → Générer/Imprimer nouveau si 1ère fois
4. Faire signer
 
### RDV : Pendant Séance
- Prendre photos pour portfolio (future)
- Noter détails dans RDV → Notes
 
### RDV : Après Séance
1. Agenda → Chercher RDV
2. EDIT → Passer statut → TERMINÉ
3. Stocks → Ajuster quantités utilisées
 
### Admin : Fin de Mois
1. Dashboard → Stat cards = résumé mois
2. Stocks → Vérifier seuils, commander si bas
3. Contrats → Tous signés ?
4. Clients → Nouveaux enregistrés ?
 
---
 
## 🎨 Comprendre l'UI
 
### Couleurs
- 🔵 **Bleu Badge** → Zone corporelle
- 🟢 **Vert Badge** → Succès / Confirmé
- 🟡 **Jaune Badge** → En attente
- 🔴 **Rouge Badge** → Erreur / Annulé / Rupture
- ⚫ **Noir Accent** → Clickable, primary button
 
### Icônes
- 📊 Dashboard
- 👥 Clients
- 📅 Agenda
- 📦 Stocks
- 📄 Contrats
 
### États
- **Gris clair** = Disabled / Inactive
- **Noir** = Active / Focus
- **Bordure** = Hover / Interactive
- **Ombre** = Depth
 
---
 
## 📞 Support
 
Pour questions ou bugs :
- Email : **studio@planink.fr**
- Discord : (à venir)
- GitHub : (à venir)
 
---
 
## ✨ Merci !
 
Merci de tester Plan'ink ! Vos retours nous aident à améliorer l'app. 🙏
 
Happy tattooing ! 🎨