// === DATA LAYER v1.1 ===

const IS_ELECTRON =
  typeof window !== "undefined" && typeof window.electronAPI !== "undefined";

let _cache = null;
let _initialized = false;

async function loadCache() {
  if (_initialized) return _cache;

  if (IS_ELECTRON) {
    try {
      const data = await window.electronAPI.loadData();
      // data est un objet vide {} si fichier inexistant, ou les vraies données
      _cache = data;
    } catch (e) {
      console.error("Erreur chargement Electron:", e);
      _cache = {};
    }
  } else {
    _cache = {
      clients: JSON.parse(localStorage.getItem("im_clients") || "null"),
      rdvs: JSON.parse(localStorage.getItem("im_rdvs") || "null"),
      stocks: JSON.parse(localStorage.getItem("im_stocks") || "null"),
      lots: JSON.parse(localStorage.getItem("im_lots") || "null"),
      contrats: JSON.parse(localStorage.getItem("im_contrats") || "null"),
      finances: JSON.parse(localStorage.getItem("im_finances") || "null"),
      settings: JSON.parse(localStorage.getItem("im_settings") || "null"),
    };
  }

  // S'assurer que toutes les clés existent
  if (!_cache || typeof _cache !== "object") _cache = {};
  if (!Array.isArray(_cache.clients)) _cache.clients = [];
  if (!Array.isArray(_cache.rdvs)) _cache.rdvs = [];
  if (!Array.isArray(_cache.stocks)) _cache.stocks = [];
  if (!Array.isArray(_cache.lots)) _cache.lots = [];
  if (!Array.isArray(_cache.contrats)) _cache.contrats = [];
  if (!Array.isArray(_cache.finances)) _cache.finances = [];
  if (!_cache.settings || typeof _cache.settings !== "object")
    _cache.settings = {};

  _initialized = true;

  // Debug : afficher le chemin et ce qui a été chargé
  if (IS_ELECTRON && window.electronAPI.getDataPath) {
    window.electronAPI
      .getDataPath()
      .then((p) => console.log("[Plan'ink] Data file:", p));
  }
  console.log(
    "[Plan'ink] Loaded — clients:",
    _cache.clients.length,
    "| rdvs:",
    _cache.rdvs.length,
    "| seeded:",
    _cache._seeded,
  );

  return _cache;
}

async function persist() {
  if (!_initialized) return;

  if (IS_ELECTRON) {
    const result = await window.electronAPI.saveData(_cache);
    if (!result) console.error("[Plan'ink] ERREUR: sauvegarde échouée !");
    else console.log("[Plan'ink] Saved — clients:", _cache.clients.length);
  } else {
    localStorage.setItem("im_clients", JSON.stringify(_cache.clients));
    localStorage.setItem("im_rdvs", JSON.stringify(_cache.rdvs));
    localStorage.setItem("im_stocks", JSON.stringify(_cache.stocks));
    localStorage.setItem("im_lots", JSON.stringify(_cache.lots));
    localStorage.setItem("im_contrats", JSON.stringify(_cache.contrats));
    localStorage.setItem("im_finances", JSON.stringify(_cache.finances));
    localStorage.setItem("im_settings", JSON.stringify(_cache.settings));
  }
}

const DB = {
  // === SETTINGS ===
  getSettings() {
    return _cache.settings;
  },
  async updateSettings(updates) {
    _cache.settings = { ..._cache.settings, ...updates };
    await persist();
  },

  // === CLIENTS ===
  getClients() {
    return _cache.clients;
  },
  getClient(id) {
    return _cache.clients.find((c) => c.id === id);
  },
  async addClient(c) {
    c.id = Date.now();
    c.createdAt = new Date().toISOString();
    c.totalSeances = 0;
    _cache.clients.push(c);
    await persist();
    return c;
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

  // === RDV ===
  getRdvs() {
    return _cache.rdvs;
  },
  getRdvsForClient(clientId) {
    return _cache.rdvs.filter((r) => r.clientId === clientId);
  },
  async addRdv(rdv) {
    rdv.id = Date.now();
    rdv.createdAt = new Date().toISOString();
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

  // === STOCKS ===
  getStocks() {
    return _cache.stocks;
  },
  getStock(id) {
    return _cache.stocks.find((s) => s.id === id);
  },
  async addStock(item) {
    item.id = Date.now();
    item.createdAt = new Date().toISOString();
    item.mouvements = item.mouvements || [];
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
    _cache.lots = _cache.lots.filter((l) => l.stockId !== id);
    await persist();
  },
  async addMouvement(stockId, mouv) {
    const i = _cache.stocks.findIndex((s) => s.id === stockId);
    if (i !== -1) {
      if (!_cache.stocks[i].mouvements) _cache.stocks[i].mouvements = [];
      mouv.id = Date.now();
      mouv.date = new Date().toISOString();
      _cache.stocks[i].mouvements.unshift(mouv);
      if (mouv.type === "entree") {
        _cache.stocks[i].quantite += mouv.quantite;
      } else if (mouv.type === "sortie") {
        _cache.stocks[i].quantite = Math.max(
          0,
          _cache.stocks[i].quantite - mouv.quantite,
        );
      } else {
        _cache.stocks[i].quantite = mouv.quantite;
      }
      await persist();
    }
  },

  // === LOTS ===
  getLots() {
    return _cache.lots;
  },
  getLotsForStock(stockId) {
    return _cache.lots.filter((l) => l.stockId === stockId);
  },
  getActiveLots() {
    return _cache.lots.filter(
      (l) => l.statut === "actif" || l.statut === "ouvert",
    );
  },
  getLot(id) {
    return _cache.lots.find((l) => l.id === id);
  },
  async addLot(lot) {
    lot.id = Date.now();
    lot.createdAt = new Date().toISOString();
    lot.statut = lot.statut || "actif";
    _cache.lots.push(lot);
    await persist();
    return lot;
  },
  async updateLot(id, updates) {
    const i = _cache.lots.findIndex((l) => l.id === id);
    if (i !== -1) {
      _cache.lots[i] = { ..._cache.lots[i], ...updates };
      await persist();
    }
  },
  async deleteLot(id) {
    _cache.lots = _cache.lots.filter((l) => l.id !== id);
    await persist();
  },

  // === CONTRATS ===
  getContrats() {
    return _cache.contrats;
  },
  getContratsForClient(clientId) {
    return _cache.contrats.filter((c) => c.clientId === clientId);
  },
  async addContrat(c) {
    c.id = Date.now();
    c.createdAt = new Date().toISOString();
    _cache.contrats.push(c);
    await persist();
    return c;
  },
  async updateContrat(id, updates) {
    const i = _cache.contrats.findIndex((c) => c.id === id);
    if (i !== -1) {
      _cache.contrats[i] = { ..._cache.contrats[i], ...updates };
      await persist();
    }
  },
  async deleteContrat(id) {
    _cache.contrats = _cache.contrats.filter((c) => c.id !== id);
    await persist();
  },

  // === FINANCES ===
  getFinances() {
    return _cache.finances;
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
  getFinancesMonth(year, month) {
    return _cache.finances.filter((f) => {
      const d = new Date(f.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },
  getTotalCA(year, month) {
    const entries =
      month !== undefined
        ? this.getFinancesMonth(year, month)
        : _cache.finances;
    return entries
      .filter((f) => f.type === "recette")
      .reduce((s, f) => s + f.montant, 0);
  },
  getTotalDepenses(year, month) {
    const entries =
      month !== undefined
        ? this.getFinancesMonth(year, month)
        : _cache.finances;
    return entries
      .filter((f) => f.type === "depense")
      .reduce((s, f) => s + f.montant, 0);
  },

  // === SEED — UNE SEULE FOIS ===
  async seed() {
    // On utilise un flag persisté pour ne jamais re-seeder
    if (_cache._seeded === true) {
      console.log("[Plan'ink] Seed déjà effectué, skip.");
      return;
    }
    // Sécurité supplémentaire : si des clients existent déjà, pas de seed
    if (_cache.clients.length > 0) {
      _cache._seeded = true;
      await persist();
      return;
    }

    console.log("[Plan'ink] Premier lancement — insertion des données démo...");

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const j2 = new Date(Date.now() + 172800000).toISOString().split("T")[0];
    const j7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const hier = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    _cache.clients = [
      {
        id: 1001,
        nom: "Martin",
        prenom: "Laure",
        email: "laure.martin@email.fr",
        tel: "06 12 34 56 78",
        dateNaissance: "1994-07-15",
        allergies: "Latex",
        notes: "Cliente régulière, manga style.",
        createdAt: "2024-01-10T10:00:00Z",
        totalSeances: 3,
      },
      {
        id: 1002,
        nom: "Dupont",
        prenom: "Marc",
        email: "marc.dupont@email.fr",
        tel: "07 98 76 54 32",
        dateNaissance: "1989-03-22",
        allergies: "",
        notes: "Amateur de géométrie et dotwork.",
        createdAt: "2024-02-14T14:00:00Z",
        totalSeances: 2,
      },
      {
        id: 1003,
        nom: "Leclerc",
        prenom: "Sophie",
        email: "sophie.leclerc@email.fr",
        tel: "06 55 44 33 22",
        dateNaissance: "1998-11-05",
        allergies: "Nickel",
        notes: "Première séance.",
        createdAt: "2024-03-01T09:00:00Z",
        totalSeances: 0,
      },
    ];

    _cache.rdvs = [
      {
        id: 2001,
        clientId: 1001,
        titre: "Dragon dos complet — séance 3/5",
        date: today,
        heure: "10:00",
        duree: 240,
        statut: "confirme",
        notes: "",
        tarif: 600,
        createdAt: new Date().toISOString(),
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
        tarif: 180,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2003,
        clientId: 1003,
        titre: "Rose minimaliste poignet",
        date: j2,
        heure: "11:00",
        duree: 60,
        statut: "attente",
        notes: "",
        tarif: 100,
        createdAt: new Date().toISOString(),
      },
    ];

    _cache.stocks = [
      {
        id: 3001,
        categorie: "Encres",
        nom: "Encre Noire Intenze",
        quantite: 8,
        unite: "flacons",
        seuil: 5,
        prix: 12.5,
        fournisseur: "Intenze Products",
        mouvements: [],
      },
      {
        id: 3002,
        categorie: "Encres",
        nom: "Encre Rouge Dynamic",
        quantite: 3,
        unite: "flacons",
        seuil: 4,
        prix: 14.0,
        fournisseur: "Dynamic",
        mouvements: [],
      },
      {
        id: 3003,
        categorie: "Aiguilles",
        nom: "Aiguilles RL #12",
        quantite: 150,
        unite: "pièces",
        seuil: 50,
        prix: 0.8,
        fournisseur: "Cheyenne",
        mouvements: [],
      },
      {
        id: 3004,
        categorie: "Hygiène",
        nom: "Gants Nitrile M",
        quantite: 2,
        unite: "boîtes",
        seuil: 3,
        prix: 8.0,
        fournisseur: "Medical",
        mouvements: [],
      },
    ];

    _cache.lots = [
      {
        id: 5001,
        stockId: 3003,
        nom: "Aiguilles RL #12",
        categorie: "Aiguilles",
        numeroLot: "CHY-2024-RL12-0847",
        fabricant: "Cheyenne",
        dateReception: "2024-10-15",
        dateFabrication: "2024-09-01",
        datePeremption: "2026-09-01",
        quantiteRecue: 200,
        quantiteRestante: 150,
        unite: "pièces",
        certificationSterilisation: "EO — ISO 11135",
        statut: "actif",
        notes: "",
        createdAt: "2024-10-15T10:00:00Z",
      },
      {
        id: 6001,
        stockId: 3001,
        nom: "Encre Noire Intenze",
        categorie: "Encres",
        numeroLot: "INT-2024-BLK-4428",
        fabricant: "Intenze Products",
        dateReception: "2024-09-20",
        dateFabrication: "2024-07-15",
        datePeremption: "2027-07-15",
        quantiteRecue: 12,
        quantiteRestante: 8,
        unite: "flacons",
        certificationSterilisation: "Stérile — conforme FDA",
        statut: "actif",
        notes: "",
        createdAt: "2024-09-20T10:00:00Z",
      },
    ];

    _cache.contrats = [];
    _cache.finances = [];
    _cache.settings = {
      studioNom: "Plan'ink Studio",
      studioAdresse: "123 Rue de l'Encre — 75000 Paris",
      studioTel: "01 23 45 67 89",
      studioEmail: "contact@planink.fr",
      artisteNom: "The Artist",
      artisteInitiales: "TK",
    };

    // FLAG CRITIQUE : marque le seed comme fait
    _cache._seeded = true;

    await persist();
    console.log("[Plan'ink] Seed terminé et sauvegardé.");
  },
};

// === INIT ===
loadCache().then(async () => {
  await DB.seed();
  if (typeof renderDashboard === "function") renderDashboard();
});
