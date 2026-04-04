# 📦 TRAÇABILITÉ LOTS — Guide Complet

## 🎯 Vue d'ensemble

**Pourquoi les lots ?**
- ✅ **Traçabilité légale** : Numéro lot = traçabilité produit
- ✅ **Dates expiration** : Encres & aiguilles ont des durées de vie
- ✅ **Conformité** : Obligation professionnelle (hygiène/sécurité)
- ✅ **Qualité** : Garder historique produits utilisés

**Plan'ink V1.1** offre un système **complet de traçabilité** pour encres et aiguilles.

---

## 🚀 Démarrage Rapide (5 min)

### 1️⃣ Accéder aux Lots
```
Stocks → Chercher produit (Encre ou Aiguilles)
→ Clic bouton 📦 (si lots existent)
→ Vue détail du produit avec ses lots
```

### 2️⃣ Ajouter un Lot
```
Lots → + AJOUTER UN LOT
→ Remplir :
  - Numéro lot : LOT-2025-001 (alphanumérique)
  - Quantité : 10
  - Date expiration : 2026-12-31 (optionnel)
→ ENREGISTRER
```

### 3️⃣ Voir Détails
```
Clic bouton 📦 sur produit
→ Voir tous les lots
→ Status expiration (vert/orange/rouge)
→ Pouvoir ajouter/supprimer lots
```

### 4️⃣ Dashboard Alertes
```
Dashboard → Voir section "ALERTES LOTS"
→ Lots expirés (rouge) & expirant (orange)
→ Cliquer pour gérer
```

---

## 📋 Système Lots Détail

### Structure d'un Lot

```javascript
{
  number: "LOT-2025-001",           // Identifiant unique lot
  quantity: 10,                      // Quantité en ce moment
  expiryDate: "2026-12-31",         // Date expiration (ISO)
  dateAdded: "2025-01-15T10:00:00Z", // Quand ajouté
  lastUpdated: "2025-01-15T10:00:00Z" // Dernière modif
}
```

### Où sont les Lots ?
```javascript
// Chaque stock a un array "batches"
{
  id: 3001,
  nom: "Encre Noire Intenze",
  quantite: 8,              // TOTAL tous lots
  batches: [                // Array de lots
    { number: "LOT-001", quantity: 5, ... },
    { number: "LOT-002", quantity: 3, ... }
  ]
}

// Quantité totale = somme batches
// 5 + 3 = 8 ✓
```

---

## 🎨 Interface Lots

### Vue Stocks (Table)
```
Produit        Quantité   Seuil  État    Prix    Valeur   Actions
Encre Noire    8 flacons  5      OK      12.50€  100€     ± EDIT ✕ 📦
  📦 2 lots                                                 ^
                                                         Clic ici !
```

**Le 📦 indique** : Ce produit a des lots enregistrés  
**Nombre après** : Combien de lots (ex: "2 lots")

### Modal Détail Lots

```
📦 LOTS — Encre Noire Intenze

[Quantité totale: 8 flacons] [Nombre de lots: 2]

Lot 1: LOT-2024-1001
       Ajouté: 10/06/2024 · 5 flacons
       ✓ Valide (579j)

Lot 2: LOT-2025-0042  
       Ajouté: 15/01/2025 · 3 flacons
       ✓ Valide (534j)

+ AJOUTER UN LOT
[FERMER]
```

### Statuts Expiration

| Statut | Couleur | Texte | Signification |
|--------|---------|-------|---------------|
| ✓ Valide | 🟢 Vert | 500j | Normal |
| ⚠️ Attn | 🟡 Orange | 29j | Expire dans < 30j |
| 🚨 Expiré | 🔴 Rouge | EXPIRÉ | À retirer |
| N/A | 🔵 Gris | N/A | Pas de date |

---

## 🛠️ Opérations Lots

### ➕ Ajouter un Lot

#### À qui pour?
- ✅ **Encres** : Toujours tracer
- ✅ **Aiguilles** : Toujours tracer
- ⚠️ **Autres** : Optionnel mais recommandé

#### Informations Obligatoires
1. **Numéro lot** : Alphanumérique + tirets
   - Formats acceptés : `LOT-2025-001`, `BATCH-123`, `SN-INK-4521`
   - Doit être unique par produit

2. **Quantité** : Nombre entier > 0
   - Ex: 5, 10, 150 (selon unité produit)

#### Informations Optionnelles
3. **Date expiration** : AAAA-MM-DD
   - Ex: `2026-12-31`
   - Vide = pas de date (recommandé pour hygiène/soins)

### ➖ Retirer un Lot

```
Clic ✕ sur lot
→ Confirmation
→ Lot supprimé
→ Quantité totale recalculée
```

⚠️ **Avant de supprimer** :
- Vérifier quantité (perte de traçabilité)
- Utiliser si lot vraiment inutile

### 📝 Modifier un Lot

Pour **modifier** : Supprimer + Recréer

Pour **ajuster quantité** :
1. Retirer lot (`✕`)
2. Ajouter nouveau lot avec bonne quantité

---

## 🚨 Gestion Expiration

### Détection Automatique

Plan'ink **détecte** automatiquement :
- ✅ Lots expirant dans < 30 jours → Orange
- ✅ Lots déjà expirés → Rouge
- ✅ Lots valides > 90 jours → Vert
- ✅ Sans date → Gris (N/A)

### Dashboard Alertes

```
⚠️ ALERTES LOTS
🚨 2 lot(s) EXPIRÉ(S) | ⏰ 1 lot(s) EXPIRE(NT) BIENTÔT
```

**Clic sur alerte** → Aller aux lots

### Avant Chaque RDV

✅ **Checklist Traçabilité** :
1. Voir RDV dans Agenda
2. Vérifier allergies client
3. **Vérifier lots aiguilles/encres** :
   - Stocks → Encres/Aiguilles
   - Clic 📦 → Voir détails
   - Vérifier aucun lot expiré
4. Utiliser produits valides
5. Noter lot utilisé si possible

---

## 📊 Données Démo

### Lots Prédéfinis

#### Encres
```
🟤 Encre Noire Intenze
  ├─ LOT-2024-1001 : 5 flacons (expire 15/08/2026)
  └─ LOT-2025-0042 : 3 flacons (expire 20/03/2027)

🔴 Encre Rouge Dynamic
  └─ BATCH-RED-0156 : 3 flacons (expire 10/12/2025)

🔵 Encre Bleue Eternal
  └─ (Pas de lot enregistré)
```

#### Aiguilles
```
🔹 Aiguilles RL #12
  ├─ SN-RL12-4521 : 80 pièces (expire 30/06/2026)
  └─ SN-RL12-4589 : 70 pièces (expire 15/11/2026)

🔹 Aiguilles Magnum Courbe
  └─ SN-MAG-8801 : 40 pièces (expire 20/05/2026)
```

---

## 🔍 Console Commands

### Voir Stats Lots
```javascript
// Console (F12)
getLotStats()
// Retourne:
// {
//   totalBatches: 5,
//   expiredBatches: 0,
//   expiringBatches: 1,
//   totalQuantityInBatches: 193,
//   trackedStocks: 4
// }
```

### Voir Lots Expirant
```javascript
getExpiringBatches(30)
// Retourne array avec :
// [{ stockId, stockName, batchNumber, daysLeft, ... }]
```

### Voir Lots Expirés
```javascript
getExpiredBatches()
// Retourne array lots expirés
```

### Exporter Traçabilité
```javascript
exportLotTraceability()
// Télécharge JSON avec rapport complet
```

---

## 📄 Exemple Workflow Complet

### Cas : Réception Encre Nouvelle

```
1️⃣ RECEVOIR LA COMMANDE
   Colis arrive avec facture
   Lot number: LOT-2025-0156
   Quantité: 5 flacons
   Date expiration: 2027-06-15

2️⃣ ENREGISTRER LE LOT
   Stocks → Encres → Encre Noire
   Clic 📦 (ou créer si 1ère fois)
   + AJOUTER UN LOT
   
   Numéro lot: LOT-2025-0156
   Quantité: 5
   Date expiration: 2027-06-15
   → ENREGISTRER

3️⃣ VÉRIFIER
   Voir table stocks
   Quantité totale mise à jour ✓
   Badge 📦 montre le lot ✓

4️⃣ UTILISER PENDANT RDV
   Agenda → Voir RDV
   Stocks → Chercher Encre
   📦 → Vérifier LOT-2025-0156 valide
   Utiliser ce lot ✓

5️⃣ APRÈS RDV (Optionnel)
   Ajuster quantité :
   - 5 utilisé → Retirer 5 du lot
   - Mais Plan'ink gère auto
```

### Cas : Détection Expiration

```
⏰ SITUATION: Lot expire dans 20 jours

DASHBOARD:
⚠️ ALERTES LOTS
⏰ 1 lot(s) EXPIRE(NT) BIENTÔT

ACTION:
1. Clic alerte
2. Voir modal détails
3. Voir "LOT-XXX : ⚠️ EXPIRE IN 20j"
4. Utiliser ce lot d'abord (FIFO)
5. Commander nouveau stock
6. Une fois nouv reçu, retirer ancien

APRÈS EXPIRATION:
- Lot passe 🔴 EXPIRÉ
- Plus utilisable
- Supprimer de l'app
```

---

## ⚙️ Configuration Lots

### Dans config.js

```javascript
// Format numéro lot accepté
/^[A-Z0-9\-]{3,20}$/

// Min 3 caractères, max 20
// Alphanumérique + tirets uniquement

// Exemples valides:
// LOT-2025-001 ✓
// BATCH-123 ✓
// SN-INK-4521 ✓
// ink_lot_1 ✗ (underscore pas autorisé)
// lot2025 ✗ (pas assez long)
```

### Validation Quantité

```javascript
// Quantité doit être :
// - Nombre entier positif
// - > 0
// - Pas de virgule/décimal

// Valide: 1, 5, 150
// Invalide: 0, 1.5, -5
```

---

## 📈 Statistiques Lots

### Voir Stats
```javascript
const stats = getLotStats();
console.log(stats);

// Retourne:
{
  totalBatches: 5,              // Nombre lots
  expiredBatches: 0,            // Expirés
  expiringBatches: 1,           // Expirént < 30j
  totalQuantityInBatches: 193,  // Quantité totale
  trackedStocks: 4              // Produits avec lots
}
```

### Rapports
- **Export JSON** : Tous les lots + statuts
- **Export CSV** : Table lots pour Excel
- **Console** : Stats en temps réel

---

## 🔒 Conformité Légale

### Pourquoi Tracer les Lots?

1. **Hygiène/Sécurité** :
   - Encres & aiguilles = produits médicaux
   - Obligation certification + traçabilité

2. **Responsabilité** :
   - Incident tattoo ? Tracer lot utilisé
   - Responsabilité civile/pénale

3. **Qualité** :
   - Produits périmés = dangereux
   - Besoin dater pour retirer à temps

### Recommandations

✅ **À faire** :
- Enregistrer lot **à la réception**
- Vérifier date avant chaque RDV
- Retirer lots périmés
- Garder historique (export JSON)

❌ **À ne pas faire** :
- Utiliser produit sans lot enregistré
- Ignorer alertes expiration
- Supprimer lots sans raison

---

## 🎯 Best Practices

### 1. Numérotation Lots

**Standardisez votre format** :
- `LOT-AAAA-NNN` : LOT-2025-001
- `BATCH-NNN` : BATCH-123
- `SN-XXX-NNNN` : SN-INK-4521

**Avantages** :
- Facile à retrouver
- Cohérent pour audit
- Lisible sur factures

### 2. Dates Expiration

**Encres** : Toujours remplir
- Durent 2-3 ans généralement
- Vérifier sur flacon fournisseur

**Aiguilles** : Toujours remplir
- Stériles = date importante
- Vérifier packaging

**Hygiène/Soins** : Optionnel
- Hygiène : Rarement expirent
- Soins : Variable, vérifier

### 3. Révision Régulière

**Chaque mois** :
- 📊 Voir stats lots
- 🗑️ Supprimer expirés
- 📋 Exporter rapport traçabilité

**Chaque trimestre** :
- Audit lots vs factures
- Vérifier quantités match
- Identifier écarts

---

## 🆘 Troubleshooting

### ❓ Je ne vois pas le bouton 📦

**Raison** : Le produit n'a pas de lots

**Solution** :
1. Ouvrir modal détail produit
2. Clic `+ AJOUTER UN LOT`
3. Ajouter premier lot
4. Bouton 📦 apparaît

### ❓ Impossible ajouter lot

**Causes possibles** :
- Numéro lot = alphanumérique + tirets uniquement
- Min 3 caractères
- Quantité < 1
- Date expiration format AAAA-MM-DD

**Solution** : Vérifier messages d'erreur

### ❓ Quantité totale incorrecte

**Cause** : Lots pas recalculés

**Solution** : 
```javascript
// Console
DB.getStocks().forEach(s => {
  if (s.batches) {
    s.quantite = s.batches.reduce((sum,b) => sum+b.quantity, 0);
    DB.updateStock(s.id, s);
  }
});
renderStocks();
```

### ❓ Supprimer tous les lots d'un produit

```javascript
// Console
const stock = DB.getStocks().find(s => s.id === 3001);
stock.batches = [];
stock.quantite = 0;
DB.updateStock(stock.id, stock);
renderStocks();
```

---

## 📞 Support Traçabilité

**Questions** :
- Email : studio@planink.fr
- Consultez : GUIDE_TESTEURS.md section Stocks

**Audits/Conformité** :
- Export JSON : `exportLotTraceability()`
- Garder pour 5 ans minimum

---

## ✨ Résumé

| Fonctionnalité | Status | Impact |
|----------------|--------|--------|
| Ajouter lots | ✅ Complet | Traçabilité |
| Dates expiration | ✅ Auto-détection | Sécurité |
| Alertes dashboard | ✅ Temps réel | Rapidité |
| Export traçabilité | ✅ JSON/CSV | Conformité |
| Stats lots | ✅ Console | Audit |
| Validation | ✅ Format strict | Qualité |

**Plan'ink = Traçabilité professionnelle** ✓

---

🎉 **Voilà ! Vous maîtrisez les lots. Prêt pour l'audit !**