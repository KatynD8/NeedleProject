# ⚡ PLAN'INK — QUICK START

## 1️⃣ Lancer l'App

### Option A : Navigateur Web (Dev)
```bash
# Ouvrir simplement le fichier
# index.html

# Ou avec serveur local (optionnel)
python -m http.server 8000
# Puis : http://localhost:8000
```

### Option B : Electron (Production - À venir)
```bash
npm install
npm start
```

---

## 2️⃣ Données de Démo

L'app charge automatiquement :

### 👥 Clients (3)
- **Laure Martin** : Cliente régulière, manga style, allergies : Latex
- **Marc Dupont** : Géométrie sacrée minimaliste
- **Sophie Leclerc** : Première visite, rose réaliste

### 📅 RDV (3)
- Aujourd'hui 10:00 → Dragon dos (Laure)
- Demain 14:00 → Mandala avant-bras (Marc)
- +2j 11:00 → Rose réaliste (Sophie)

### 📦 Stocks (8)
- Encres (3) : Noire, Rouge, Bleue
- Aiguilles (2) : RL #12, Magnum
- Hygiène (2) : Gants, Film
- Soins (1) : Baume tattoo care

---

## 3️⃣ Exploration Rapide (5 min)

### 📊 Dashboard
- Vue : Clients, RDV, Stocks, Alertes
- Action : Cliquer sur un RDV

### 👥 Clients
- Vue : Table 3 clients
- Action : `+ AJOUTER` nouveau client

### 📅 Agenda
- Vue : Calendrier mensuel
- Action : Cliquer jour → Voir RDV

### 📦 Stocks
- Vue : Table 8 produits
- Action : Cliquer `±` → Ajuster quantité

### 📄 Contrats
- Vue : Table (vide par défaut)
- Action : `+ NOUVEAU` → Générer PDF

---

## 4️⃣ First Tasks (Test Checklist)

### ✅ Créer Client
1. Clients → `+ AJOUTER`
2. Prénom: "Alice"
3. Nom: "Dupre"
4. Email: "alice@email.fr"
5. Allergies: "Nickel"
6. Clic `ENREGISTRER`
✅ Client apparaît en table

### ✅ Créer RDV
1. Agenda → `+ NOUVEAU RDV`
2. Client: "Alice Dupre"
3. Titre: "Fenix aile"
4. Date: Demain
5. Heure: 15:00
6. Durée: 90
7. Clic `ENREGISTRER`
✅ RDV apparaît au calendrier

### ✅ Générer Contrat
1. Contrats → `+ NOUVEAU CONTRAT`
2. Client: "Alice Dupre"
3. Description: "Fenix aile"
4. Zone: "Épaule droite"
5. Clic `GÉNÉRER`
✅ Contrat créé

### ✅ Voir Contrat PDF
1. Contrats → Clic `VOIR`
2. Modal : Contrat complet
3. Clic `IMPRIMER / PDF`
4. `Ctrl+P` → Imprimer PDF
✅ PDF généré correctement

---

## 5️⃣ Données Persistantes

### Où sont mes données ?
- **Navigateur** : `localStorage` (F12 → Application → Local Storage)
- **Electron** : `~/.planink/data.json` (à venir)

### Exporter Données
```javascript
// Console (F12)
getStats() // Voir résumé
exportToJSON() // Télécharger JSON
exportClientsCSV() // Télécharger CSV
```

### Réinitialiser
```javascript
// Console (F12)
localStorage.clear();
location.reload();
```

---

## 6️⃣ Commandes Console Utiles

### Vue d'ensemble
```javascript
const stats = getStats();
console.log(stats);
// { clientsTotal: 3, rdvsToday: 1, ... }
```

### Afficher tous les clients
```javascript
DB.getClients().forEach(c => console.log(`${c.prenom} ${c.nom} - ${c.email}`));
```

### Ajouter stock
```javascript
DB.addStock({
  categorie: "Encres",
  nom: "Encre Verte Test",
  quantite: 10,
  unite: "flacons",
  seuil: 3,
  prix: 12.50
});
renderStocks();
```

### Voir tous les RDV
```javascript
DB.getRdvs().forEach(r => console.log(`${r.date} ${r.heure} - ${r.titre}`));
```

---

## 7️⃣ Navigation Rapide

| Page | Raccourci | Fonction |
|------|-----------|----------|
| Dashboard | Clic icône 📊 | Vue d'ensemble |
| Clients | Clic icône 👥 | Gestion clients |
| Agenda | Clic icône 📅 | Calendrier RDV |
| Stocks | Clic icône 📦 | Inventaire |
| Contrats | Clic icône 📄 | Contrats PDF |

---

## 8️⃣ Troubleshooting

### Données disparues ?
```javascript
localStorage.clear();
location.reload();
// App recharge avec démo data
```

### Formulaire ne soumet pas ?
- ✅ Champs obligatoires remplis ?
- ✅ Pas d'erreur console (F12) ?
- ✅ Navigateur à jour ?

### RDV n'apparaît pas ?
- ✅ Date future ? (calendrier montre mois courant)
- ✅ Client existe ?
- ✅ Statut = "Confirmé" (annulé pas affiché)

### Contrat PDF blanc ?
- ✅ Client a un nom ?
- ✅ Description remplie ?
- ✅ Browser print dialog ouvert ?

---

## 9️⃣ Tips Pro

### ⚡ Speed Up Workflow
- Recherche clients = temps réel (tape + Enter)
- Clic RDV = détail jour direct
- `± stock` = quick buttons (-5, -1, +1, +5)

### 🎨 Comprendre UI
- 🟢 Vert = OK
- 🟡 Jaune = Attention
- 🔴 Rouge = Urgent
- ⚫ Noir = Interactive

### 📋 Gestion Clients
- ⚠️ Toujours remplir **ALLERGIES**
- 📝 Notes = contexte important
- 👥 Avatar = initiales (auto-générées)

### 📅 Agenda
- 📍 Aujourd'hui = bordure noire
- 📌 Prochains RDV = sidebar droit
- 🔔 Vérifier allergies AVANT séance

### 📦 Stocks
- 🚨 Alertes = dashboard orange/rouge
- 💰 Valeur = quantité × prix
- 📊 Barre = % du seuil

### 📄 Contrats
- ✍️ Générer AVANT séance
- 🏥 Vérifier allergies
- 🖨️ Imprimer A4 couleur

---

## 🔟 Contact & Support

**Support Plan'ink** :
- Email : studio@planink.fr
- Docs : Voir `README.md`
- Guide : Voir `GUIDE_TESTEURS.md`
- Changelog : Voir `CHANGELOG.md`

---

## ✨ Vous êtes Prêt !

Lancez l'app, créez quelques données, explorez les pages.

**Happy tattooing !** 🎨