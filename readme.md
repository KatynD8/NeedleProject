# 🎨 PLAN'INK — Studio Management V1

## 🚀 Présentation

**Plan'ink** est une application web de gestion de studio de tatouage, conçue pour les testeurs. C'est une plateforme tout-en-un pour gérer clients, rendez-vous, stocks et contrats de consentement.

---

## ✨ Nouvelles Améliorations (V1.1)

### 🎯 Rebranding Complet
- ✅ Logo & nom : `INKMASTER` → `PLAN'INK Studio Manager`
- ✅ Dashboard français : `DASHBOARD` → `TABLEAU DE BORD`
- ✅ Contrats : mise à jour adresse Plan'ink (Rouen)

### 🖼️ Design System Noir & Blanc Professionnel
**Palette de couleurs modernisée** :
- `Fond clair` : `#ffffff` (au lieu de `#0a0a0b`)
- `Panel` : `#f8f8f8` (gris clair professionnel)
- `Accent` : `#000000` (noir pur, au lieu du doré)
- `Border` : `#e0e0e0` (gris doux)

### 🔤 Typographie Modernisée
- **Polices** : `Inter` (moderne, lisible) + `Space Mono` (technique)
- **Hiérarchie** : Plus épurée, moins d'emphasis sur spacing/letterSpacing
- **Poids** : `500-700` pour meilleure hiérarchie

### 🎨 Composants Redesignés

#### Boutons
- **Primary** : Noir plein, hover subtil avec ombre `0 4px 12px rgba(0,0,0,0.15)`
- **Ghost** : Transparent, bordure gris clair, hover background gris
- **Danger** : Rouge doux avec transparence

#### Badges
- Couleurs pastel : `#e8f5e9` (succès), `#ffebee` (erreur), etc.
- Sans bordures opaques, design épuré

#### Avatars
- **Format** : Noir avec initiales blanches, ombre subtile
- **Taille** : 40-64px avec shadow `0 2px 8px rgba(0,0,0,0.12)`

#### Cards & Stat Cards
- Ombre subtile : `0 1px 3px rgba(0,0,0,0.04)`
- Accent bar : 3px noir au-dessus (au lieu de 2px doré)
- Border : 1px gris clair

#### Tables
- Header : 2px border-bottom noir (au lieu de 1px gris)
- Hover row : background gris clair doux
- Padding optimisé : 14px 16px

#### Agenda
- Jours "aujourd'hui" : border 2px noir + background gris clair
- RDV chips : design épuré sans glow, font `Inter`
- Gap grid : 3px (au lieu de 2px)

#### Modales
- Shadow réaliste : `0 20px 60px rgba(0,0,0,0.2)` (au lieu de `0.6`)
- Background : blanc pur
- Moins de blur : `blur(2px)` (au lieu de `blur(4px)`)

#### Formulaires
- Focus ring : noir doux `0 0 0 3px rgba(0,0,0,0.06)`
- Hover : border-color passe au gris light
- Custom dropdown SVG : flèche grise en SVG

### 🎯 Micro-interactions Améliorées
- **Transitions** : `0.18s ease` cohérente sur tous les éléments
- **Hover states** : Subtiles, sans glow excessif
- **Animations** : Fade-in plus douce, timing unifié
- **Scrollbar** : 8px, plus visible, hover effect gris light

### 📝 Contenu Enrichi
- **Clients** : Notes descriptives plus détaillées
- **RDV** : Infos complémentaires dans les notes
- **Contrats** : Adresse Plan'ink (Rouen), typo `Inter` améliore la lisibilité

### 🔤 Labels Améliorés
- Agenda : `◂ PRÉC.` → `← PRÉCÉDENT`, `SUIV. ▸` → `SUIVANT →`
- Clients : Recherche → "Rechercher un client..."
- Icône recherche : `⌕` → `🔍`
- Clients button : `+ NOUVEAU CLIENT` → `+ AJOUTER`
- Stocks button : `+ AJOUTER` → `+ NOUVEAU PRODUIT`

### 🎨 Raffinements Visuels Finaux
- **Progress bars** : Hauteur 6px, animation cubic-bezier
- **Stat cards** : Font-display 32px (au lieu de 38px), ratio meilleur
- **Empty states** : Icon 52px, opacity 0.2, spacing optimisé
- **Contrat preview** : Padding 36px, line-height 1.8, typo Pro
- **Section titles** : Font-body 12px (au lieu de font-mono), spacing régulier

---

## 📦 Structure du Projet

```
plan-ink/
├── index.html          # Structure HTML + modales
├── style.css           # Design system complet (780+ lines)
├── data.js             # Gestion data + seed demo
├── app.js              # Router & helpers
├── dashboard.js        # Tableau de bord
├── clients.js          # Gestion clients
├── agenda.js           # Calendrier & RDV
├── stocks.js           # Inventaire
├── contrats.js         # Contrats consentement
└── README.md           # Ce fichier
```

---

## 🚀 Installation & Démarrage

### Version Navigateur (Dev)
```bash
# Ouvrir simplement index.html dans un navigateur
# Les données sont sauvegardées en localStorage
```

### Version Electron (Production)
L'app détecte `window.electronAPI` pour sauvegarder en fichier JSON sur disque.
```javascript
const IS_ELECTRON = typeof window.electronAPI !== "undefined";
```

---

## 🎯 Fonctionnalités

### Dashboard
- 📊 Vue d'ensemble : clients, RDV, stocks, alertes
- 📅 5 prochains rendez-vous
- ⚠️ Alertes stocks en temps réel

### Clients
- 👥 Gestion complète (CRUD)
- 🔍 Recherche en temps réel
- 📋 Historique RDV
- ⚠️ Alertes allergies

### Agenda
- 📅 Calendrier mensuel
- ⏰ Détail des RDV par jour
- 🔔 Statuts (Confirmé, En attente, Annulé, Terminé)
- ➕ Création RDV rapide

### Stocks
- 📦 Inventaire multi-catégories
- 📊 Barre de progression
- 🚨 Alertes seuil
- 💰 Valeur estimée totale

### Contrats
- 📄 Contrats consentement éclairé
- ✍️ Formulaire générable PDF
- 🖨️ Impression/Export
- ✅ Suivi signatures

---

## 🎨 Design Tokens

### Couleurs (CSS Variables)
```css
--bg-base:      #ffffff     /* Fond principal */
--bg-panel:     #f8f8f8     /* Panel sidebar */
--bg-card:      #f5f5f5     /* Cards */
--bg-hover:     #efefef     /* Hover state */

--ink:          #1a1a1a     /* Texte principal */
--ink-muted:    #666666     /* Texte secondaire */
--ink-faint:    #999999     /* Texte très léger */

--accent:       #000000     /* Accent noir */
--red:          #d32f2f     /* Erreurs */
--green:        #388e3c     /* Succès */
--blue:         #1976d2     /* Info */
```

### Typographie
- **Display** : `Inter 700` — Titres pages (36px)
- **Body** : `Inter 400-600` — Texte courant (13-14px)
- **Mono** : `Space Mono 400-700` — Labels techniques (11-12px)

### Spacing
- Grid : `16px, 20px, 24px`
- Radius : `8px (cards), 12px (large)`
- Transitions : `0.18s ease`

---

## 👥 User Stories

### Tatoueur
> "Je veux voir d'un coup d'œil mes clients, mes RDV d'aujourd'hui et mes stocks."

✅ Dashboard avec 4 stat cards + sections prochains RDV et alertes

### Gérant
> "Je dois générer des contrats de consentement PDF pour chaque client."

✅ Formulaire contrat → Aperçu → Export PDF print-ready

### Réceptionniste
> "Je dois rechercher un client et créer rapidement un RDV."

✅ Recherche temps réel + créer RDV en 2 clics

---

## 🎯 Cas d'Usage Testeurs

1. **Explorer le dashboard** — Voir l'overview colorée & les chiffres clés
2. **Créer un client** — Tester le formulaire, note/allergies
3. **Créer un RDV** — Assigner à un client, définir durée/statut
4. **Générer un contrat** — PDF consentement cliquable
5. **Tester les stocks** — Ajouter produits, voir alertes
6. **Naviguer agenda** — Cliquer sur jours, voir détails

---

## 🔍 QA Checklist

- [ ] Dashboard : Cards alignées, chiffres corrects
- [ ] Clients : Créer → Éditer → Supprimer fonctionnels
- [ ] Recherche : Filter temps réel sans lag
- [ ] Agenda : Nav mois, "aujourd'hui" highlightée
- [ ] RDV : Statuts apparaissent correct
- [ ] Stocks : Barre prog % correcte, alertes rouges/orange/vertes
- [ ] Contrat : PDF généré avec données, imprimable
- [ ] Mobile : Responsive, scrolling fluide
- [ ] Données : Persistent en localStorage / Electron

---

## 📝 Notes Développement

### Pas de Framework
- Pure **JavaScript vanilla** (ES6+)
- DOM manipulation directe
- Pas de dépendances externes

### Styles Unifiés
- **1 seul CSS** : `style.css` (780+ lignes, tout organisé)
- **Variables CSS** : Thème noir/blanc 100% configurable
- **No Tailwind** : Flexibilité totale sur design

### Data Layer
- **localStorage** (navigateur) ou **JSON file** (Electron)
- **Cache en mémoire** pour perfs
- **Seed demo** : 3 clients, 3 RDV, 8 stocks

---

## 🚀 Roadmap V1.2+

- [ ] Export Excel clients/RDV
- [ ] SMS/Email notifications RDV
- [ ] Multi-artistes (roles/permissions)
- [ ] Galerie tatouages par client
- [ ] Statistiques avancées (CA, taux satisfaction)
- [ ] Dark mode toggle
- [ ] Paiements (Stripe intégration)

---

## 📸 Screenshots Clés

### Palette Noir & Blanc
- Fond blanc pur (`#fff`)
- Accents noir (`#000`)
- Gris doux (`#f5f5f5` → `#e0e0e0`)
- Aucun doré, aucune saturation

### Typographie Inter
- Clean, moderne, lisible
- Bien-espacée, hiérarchie claire
- Compact sur mobile, aéré sur desktop

### Contrastes
- WCAG AA partout
- Noir sur blanc = maximum contrast
- Accessible à tous les users

---

## 🤝 Support Testeurs

Questions ou bugs ? Utilise le formulaire dans l'app ou envoie un email à :
**support@planink.fr**

Merci de tester ! 🎨