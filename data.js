// === DATA LAYER — v1.2 ===
// Sauvegarde dans un vrai fichier JSON sur le disque via Electron
// Fallback sur localStorage si ouvert dans un navigateur normal

var IS_ELECTRON = typeof window.electronAPI !== "undefined";

var _cache = null;

async function loadCache() {
  if (_cache) return _cache;
  if (IS_ELECTRON) {
    _cache = await window.electronAPI.loadData();
  } else {
    _cache = {
      clients:  JSON.parse(localStorage.getItem("inkmaster_clients")  || "[]"),
      rdvs:     JSON.parse(localStorage.getItem("inkmaster_rdvs")     || "[]"),
      stocks:   JSON.parse(localStorage.getItem("inkmaster_stocks")   || "[]"),
      contrats: JSON.parse(localStorage.getItem("inkmaster_contrats") || "[]"),
      finances: JSON.parse(localStorage.getItem("inkmaster_finances") || "[]"),
      settings: JSON.parse(localStorage.getItem("inkmaster_settings") || "{}"),
    };
  }
  _cache.clients  = _cache.clients  || [];
  _cache.rdvs     = _cache.rdvs     || [];
  _cache.stocks   = _cache.stocks   || [];
  _cache.contrats = _cache.contrats || [];
  _cache.finances = _cache.finances || [];
  _cache.settings = _cache.settings || {};

  // Migration silencieuse : normalise l'ancienne clé "lot" → "numLot"
  _cache.stocks = _cache.stocks.map((s) => {
    if (s.lot !== undefined && s.numLot === undefined) {
      s.numLot = s.lot;
      delete s.lot;
    }
    return s;
  });

  return _cache;
}

async function persist() {
  if (IS_ELECTRON) {
    await window.electronAPI.saveData(_cache);
  } else {
    localStorage.setItem("inkmaster_clients",  JSON.stringify(_cache.clients));
    localStorage.setItem("inkmaster_rdvs",      JSON.stringify(_cache.rdvs));
    localStorage.setItem("inkmaster_stocks",    JSON.stringify(_cache.stocks));
    localStorage.setItem("inkmaster_contrats",  JSON.stringify(_cache.contrats));
    localStorage.setItem("inkmaster_finances",  JSON.stringify(_cache.finances));
    localStorage.setItem("inkmaster_settings",  JSON.stringify(_cache.settings));
  }
}

// Helpers formatage
function formatMoney(n) {
  return (
    (n || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

const DB = {
  // --- CLIENTS ---
  getClients() {
    return _cache.clients;
  },
  getClient(id) {
    return _cache.clients.find((c) => c.id === id);
  },
  async addClient(client) {
    client.id = Date.now();
    client.createdAt = new Date().toISOString();
    _cache.clients.push(client);
    await persist();
    return client;
  },
  async updateClient(id, updates) {
    const i = _cache.clients.findIndex((c) => c.id === id);
    if (i !== -1) {
      _cache.clients[i] = { ..._cache.clients[i], ...updates };
      await persist();
    }
  },
  async deleteClient(id) {
    _cache.clients = _cache.clients.filter((c) => c.id !== id);
    await persist();
  },

  // --- RDV ---
  getRdvs() {
    return _cache.rdvs;
  },
  async addRdv(rdv) {
    rdv.id = Date.now();
    _cache.rdvs.push(rdv);
    await persist();
    return rdv;
  },
  async updateRdv(id, updates) {
    const i = _cache.rdvs.findIndex((r) => r.id === id);
    if (i !== -1) {
      _cache.rdvs[i] = { ..._cache.rdvs[i], ...updates };
      await persist();
    }
  },
  async deleteRdv(id) {
    _cache.rdvs = _cache.rdvs.filter((r) => r.id !== id);
    await persist();
  },

  // --- STOCKS ---
  getStocks() {
    return _cache.stocks;
  },
  async addStock(item) {
    item.id = Date.now();
    _cache.stocks.push(item);
    await persist();
    return item;
  },
  async updateStock(id, updates) {
    const i = _cache.stocks.findIndex((s) => s.id === id);
    if (i !== -1) {
      _cache.stocks[i] = { ..._cache.stocks[i], ...updates };
      await persist();
    }
  },
  async deleteStock(id) {
    _cache.stocks = _cache.stocks.filter((s) => s.id !== id);
    await persist();
  },

  // --- CONTRATS ---
  getContrats() {
    return _cache.contrats;
  },
  async addContrat(contrat) {
    contrat.id = Date.now();
    contrat.createdAt = new Date().toISOString();
    _cache.contrats.push(contrat);
    await persist();
    return contrat;
  },
  async updateContrat(id, updates) {
    const i = _cache.contrats.findIndex((c) => c.id === id);
    if (i !== -1) {
      // updatedAt permet de tracer la dernière modification
      _cache.contrats[i] = {
        ..._cache.contrats[i],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await persist();
    }
  },
  async deleteContrat(id) {
    _cache.contrats = _cache.contrats.filter((c) => c.id !== id);
    await persist();
  },

  // --- FINANCES ---
  getFinances() {
    return _cache.finances;
  },

  getFinancesMonth(year, month) {
    return _cache.finances.filter((f) => {
      const d = new Date(f.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  getTotalCA(year, month) {
    return this.getFinancesMonth(year, month)
      .filter((f) => f.type === "recette")
      .reduce((sum, f) => sum + (f.montant || 0), 0);
  },

  getTotalDepenses(year, month) {
    return this.getFinancesMonth(year, month)
      .filter((f) => f.type === "depense")
      .reduce((sum, f) => sum + (f.montant || 0), 0);
  },

  async addFinance(entry) {
    entry.id = Date.now();
    entry.createdAt = new Date().toISOString();
    _cache.finances.push(entry);
    await persist();
    return entry;
  },
  async updateFinance(id, updates) {
    const i = _cache.finances.findIndex((f) => f.id === id);
    if (i !== -1) {
      _cache.finances[i] = { ..._cache.finances[i], ...updates };
      await persist();
    }
  },
  async deleteFinance(id) {
    _cache.finances = _cache.finances.filter((f) => f.id !== id);
    await persist();
  },

  // --- SETTINGS ---
  getSettings() {
    return _cache.settings;
  },
  async saveSettings(updates) {
    _cache.settings = { ..._cache.settings, ...updates };
    await persist();
  },

  // --- SEED DEMO DATA ---
  // Guard sur le flag _seeded pour éviter le re-seed si l'utilisateur
  // supprime tous ses clients, et pour permettre un reset propre.
  async seed() {
    if (_cache.settings._seeded) return;

    _cache.clients = [
      {
        id: 1001,
        nom: "Martin",
        prenom: "Laure",
        email: "laure.martin@email.fr",
        tel: "06 12 34 56 78",
        dateNaissance: "1994-07-15",
        allergies: "Latex",
        notes: "Cliente régulière, manga style",
        createdAt: "2024-01-10T10:00:00Z",
      },
      {
        id: 1002,
        nom: "Dupont",
        prenom: "Marc",
        email: "marc.dupont@email.fr",
        tel: "07 98 76 54 32",
        dateNaissance: "1989-03-22",
        allergies: "",
        notes: "Amateur de géométrie",
        createdAt: "2024-02-14T14:00:00Z",
      },
      {
        id: 1003,
        nom: "Leclerc",
        prenom: "Sophie",
        email: "sophie.leclerc@email.fr",
        tel: "06 55 44 33 22",
        dateNaissance: "1998-11-05",
        allergies: "Nickel",
        notes: "Première séance",
        createdAt: "2024-03-01T09:00:00Z",
      },
    ];

    const today    = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const j2       = new Date(Date.now() + 172800000).toISOString().split("T")[0];

    _cache.rdvs = [
      {
        id: 2001,
        clientId: 1001,
        titre: "Dragon dos complet",
        date: today,
        heure: "10:00",
        duree: 180,
        statut: "confirme",
        notes: "Séance 3/5",
      },
      {
        id: 2002,
        clientId: 1002,
        titre: "Mandala avant-bras",
        date: tomorrow,
        heure: "14:00",
        duree: 90,
        statut: "confirme",
        notes: "",
      },
      {
        id: 2003,
        clientId: 1003,
        titre: "Rose minimaliste",
        date: j2,
        heure: "11:00",
        duree: 60,
        statut: "attente",
        notes: "Première fois",
      },
    ];

    // Clé canonique : numLot partout
    _cache.stocks = [
      { id: 3001, categorie: "Encres",    nom: "Encre Noire Intenze",      quantite: 8,   unite: "flacons", seuil: 5,  prix: 12.5, numLot: "" },
      { id: 3002, categorie: "Encres",    nom: "Encre Rouge Dynamic",      quantite: 3,   unite: "flacons", seuil: 4,  prix: 14,   numLot: "" },
      { id: 3003, categorie: "Encres",    nom: "Encre Bleue Eternal",      quantite: 6,   unite: "flacons", seuil: 3,  prix: 13,   numLot: "" },
      { id: 3004, categorie: "Aiguilles", nom: "Aiguilles RL #12",         quantite: 150, unite: "pièces",  seuil: 50, prix: 0.8,  numLot: "" },
      { id: 3005, categorie: "Aiguilles", nom: "Aiguilles Magnum Courbe",  quantite: 40,  unite: "pièces",  seuil: 30, prix: 1.2,  numLot: "" },
      { id: 3006, categorie: "Hygiène",   nom: "Gants Nitrile M",          quantite: 2,   unite: "boîtes",  seuil: 3,  prix: 8,    numLot: "" },
      { id: 3007, categorie: "Hygiène",   nom: "Film plastique",           quantite: 5,   unite: "rouleaux",seuil: 2,  prix: 6,    numLot: "" },
      { id: 3008, categorie: "Soins",     nom: "Baume Tattoo Care",        quantite: 12,  unite: "tubes",   seuil: 5,  prix: 9.5,  numLot: "" },
    ];

    _cache.contrats = [
      {
        id: 4001,
        clientId: 1001,
        clientNom: "Laure Martin",
        description: "Dragon dos complet",
        zone: "Dos",
        date: "2024-03-15",
        signe: true,
        prixTotal: 800,
        acompte: 200,
        lotsAiguilles: [],
        lotsEncres: [],
        createdAt: "2024-03-15T09:00:00Z",
      },
    ];

    const thisMonth = new Date().toISOString().slice(0, 7);
    _cache.finances = [
      {
        id: 5001,
        type: "recette",
        montant: 250,
        description: "Séance mandala",
        categorie: "Séance",
        date: `${thisMonth}-05`,
        clientId: 1002,
        modePaiement: "CB",
        createdAt: new Date().toISOString(),
      },
      {
        id: 5002,
        type: "recette",
        montant: 180,
        description: "Rose minimaliste",
        categorie: "Séance",
        date: `${thisMonth}-08`,
        clientId: 1003,
        modePaiement: "Espèces",
        createdAt: new Date().toISOString(),
      },
      {
        id: 5003,
        type: "depense",
        montant: 45,
        description: "Commande encres",
        categorie: "Encres",
        date: `${thisMonth}-03`,
        fournisseur: "Cheyenne",
        modePaiement: "Virement",
        createdAt: new Date().toISOString(),
      },
    ];

    // Marquer le seed comme effectué — ne se relance plus jamais
    _cache.settings._seeded = true;

    await persist();
  },
};

// === INIT ===
loadCache().then(async () => {
  await DB.seed();
  if (typeof applyLogoToSidebar === "function") applyLogoToSidebar();
  if (typeof renderDashboard === "function") renderDashboard();
});