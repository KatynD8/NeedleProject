# 🧪 TEST RAPIDE — Feature Lots V1.2

## ⚡ 2 Minutes pour Tester les Lots

### ✅ Étape 1 : Ouvrir l'App
```
1. Ouvrir index.html
2. Attendre chargement (3 secondes)
3. Dashboard doit afficher alerte lots ⚠️
```

### 📦 Étape 2 : Voir les Lots Existants
```
MENU : Stocks (📦 icon)
↓
Table : Chercher "Encre Noire Intenze"
↓
Voir : Colonne Actions → Bouton 📦 (gris)
↓
CLIC : Ouvre modal avec les lots
  - LOT-2024-1001 : 5 flacons (Valide 579j)
  - LOT-2025-0042 : 3 flacons (Valide 534j)
```

### ➕ Étape 3 : Ajouter un Lot
```
DANS MODAL "LOTS":
↓
CLIC : "+ AJOUTER UN LOT"
↓
REMPLIR :
  - Numéro lot : LOT-2025-TEST-001
  - Quantité : 10
  - Date expiration : 2026-12-31
↓
CLIC : ENREGISTRER
↓
VÉRIFIER :
  - Lot apparaît dans liste
  - Quantité totale mise à jour (8 → 18)
  - Statut : ✓ Valide (669j)
```

### 🚨 Étape 4 : Voir Alerte Dashboard
```
RETOUR : Dashboard (📊 icon)
↓
REGARDER : Haut de page
↓
VOIR : "⚠️ ALERTES LOTS"
       "🚨 1 lot(s) EXPIRÉ(S)" (Encre Rouge)
       "⏰ 1 lot(s) EXPIRE(NT) BIENTÔT"
```

### 📊 Étape 5 : Vérifier Lot Expirant
```
MENU : Stocks → Encres
↓
CHERCHER : "Encre Rouge Dynamic"
↓
CLIC : 📦 (bouton orange)
↓
VOIR : BATCH-RED-0156
       ⚠️ EXPIRE IN 315j (ou proche de 30j si date proche)
```

### 🗑️ Étape 6 : Retirer un Lot
```
DANS MODAL LOTS:
↓
CLIC : ✕ sur un lot
↓
CONFIRMER : "Supprimer ?"
↓
VÉRIFIER :
  - Lot disparu
  - Quantité recalculée
```

---

## 🔍 Signes que ça Marche

### ✓ Tableau Stocks
- [ ] Colonne produit affiche "📦 2 lots" si lots existent
- [ ] Bouton 📦 clickable si lots présents
- [ ] Quantité totale correcte (somme des lots)

### ✓ Modal Lots
- [ ] Affiche "QUANTITÉ TOTALE" et "NOMBRE DE LOTS"
- [ ] Liste chaque lot avec numéro/quantité/date
- [ ] Statut expiration affiché (vert/orange/rouge)
- [ ] Bouton "+ AJOUTER UN LOT"

### ✓ Dashboard
- [ ] Alerte "⚠️ ALERTES LOTS" visible
- [ ] Compte lots expirant < 30j
- [ ] Compte lots déjà expirés

### ✓ Ajout Lot
- [ ] Modal s'ouvre au clic "+ AJOUTER"
- [ ] 3 champs : numéro, quantité, date
- [ ] Validation : numéro alphanumérique
- [ ] Confirmation avant enregistrement

---

## 🚀 Tests Avancés (5 min)

### Test 1 : Auto-calcul Quantité
```javascript
// Console (F12)
DB.getStocks()[0]  // Encre Noire
// Voir : quantite = 18 (5+3+10 du nouveau)
```

### Test 2 : Expiration Auto-Détectée
```javascript
// Console (F12)
getLotStats()
// Retourne :
// { totalBatches: 5, expiredBatches: 1, expiringBatches: 1, ... }
```

### Test 3 : Export Traçabilité
```javascript
// Console (F12)
exportLotTraceability()
// Télécharge JSON avec rapport complet
```

### Test 4 : Voir Lots Expirant
```javascript
// Console (F12)
getExpiringBatches(30)
// Montre tous lots expirant dans < 30 jours
```

---

## ❌ Si Ça ne Marche Pas

### Problème : Pas de bouton 📦
**Cause** : Produit n'a pas de lots
**Solution** : Ajouter un lot via "+ AJOUTER UN LOT"

### Problème : Modal vide
**Cause** : batches.js pas chargé
**Vérifier** :
```
Console (F12) → 
Taper : getLotStats
Si rouge = batches.js pas chargé
Si résultat = batches.js OK ✓
```

### Problème : Quantité incorrecte
**Solution** :
```javascript
// Console
const stock = DB.getStocks()[0];
stock.quantite = stock.batches.reduce((sum,b) => sum+b.quantity, 0);
DB.updateStock(stock.id, stock);
renderStocks();
```

---

## 📋 Checklist Validation

- [ ] Dashboard charge sans erreur
- [ ] Voir "📦 N lots" dans table stocks
- [ ] Clic 📦 ouvre modal
- [ ] Voir lots existants avec dates
- [ ] Ajouter nouveau lot (réussi)
- [ ] Quantité mise à jour (auto)
- [ ] Dashboard affiche alerte lots
- [ ] Retirer un lot (réussi)
- [ ] Console getLotStats() fonctionne
- [ ] Export traçabilité fonctionne

**Si tout ✓ = FEATURE FONCTIONNE !**

---

## 💡 Points Clés à Tester

1. **Données de Démo** :
   - Encre Noire : 2 lots
   - Encre Rouge : 1 lot (expirant < 30j)
   - Aiguilles RL : 2 lots
   - Aiguilles Magnum : 1 lot

2. **Interface** :
   - 📦 Icon dans table
   - Modal détail clair
   - Boutons fonctionnels
   - Auto-calcul quantité

3. **Alerts** :
   - Dashboard alerte
   - Statuts couleur (vert/orange/rouge)
   - Jours restants calculés

4. **Console** :
   - getLotStats()
   - getExpiringBatches()
   - getExpiredBatches()
   - exportLotTraceability()

---

## 🎯 Workflow Complet (2 min)

```
1. Dashboard : Voir alerte lots ⚠️
2. Stocks : Trouver "Encre Rouge" → Clic 📦
3. Voir : BATCH-RED-0156 expirant bientôt
4. Ajouter : Nouveau lot "LOT-2025-NEW"
5. Vérifier : Quantité recalculée
6. Retirer : Lot test via ✕
7. Console : getLotStats() → JSON
8. Export : exportLotTraceability() → Download
```

---

## 📞 Si Bugs

**Email** : studio@planink.fr
**Info à fournir** :
- Navigateur (Chrome/Firefox/Safari)
- Étape exacte qui bug
- Screenshot si possible
- Erreur console (F12)

---

## ✨ C'est Tout !

La feature **Traçabilité Lots V1.2** est **ACTIVE** et **PRÊTE À TESTER** ! 🚀

Commence par le **Test Rapide (2 min)** puis explore les **Tests Avancés**.

**Bon test ! 📦**