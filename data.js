// === DATA LAYER ===
const IS_ELECTRON = typeof window.electronAPI !== "undefined";
let _cache = null;

async function loadCache() {
  if (_cache) return _cache;
  if (IS_ELECTRON) {
    _cache = await window.electronAPI.loadData();
  } else {
    _cache = {
      clients: JSON.parse(localStorage.getItem("inkmaster_clients") || "[]"),
      rdvs: JSON.parse(localStorage.getItem("inkmaster_rdvs") || "[]"),
      stocks: JSON.parse(localStorage.getItem("inkmaster_stocks") || "[]"),
      contrats: JSON.parse(localStorage.getItem("inkmaster_contrats") || "[]"),
      finances: JSON.parse(localStorage.getItem("inkmaster_finances") || "[]"),
    };
  }
  _cache.clients = _cache.clients || [];
  _cache.rdvs = _cache.rdvs || [];
  _cache.stocks = _cache.stocks || [];
  _cache.contrats = _cache.contrats || [];
  _cache.finances = _cache.finances || [];
  return _cache;
}

async function persist() {
  if (IS_ELECTRON) {
    await window.electronAPI.saveData(_cache);
  } else {
    localStorage.setItem("inkmaster_clients", JSON.stringify(_cache.clients));
    localStorage.setItem("inkmaster_rdvs", JSON.stringify(_cache.rdvs));
    localStorage.setItem("inkmaster_stocks", JSON.stringify(_cache.stocks));
    localStorage.setItem("inkmaster_contrats", JSON.stringify(_cache.contrats));
    localStorage.setItem("inkmaster_finances", JSON.stringify(_cache.finances));
  }
}

const DB = {
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
  async updateClient(id, u) {
    const i = _cache.clients.findIndex((c) => c.id === id);
    if (i !== -1) {
      _cache.clients[i] = { ..._cache.clients[i], ...u };
      await persist();
    }
  },
  async deleteClient(id) {
    _cache.clients = _cache.clients.filter((c) => c.id !== id);
    await persist();
  },

  getRdvs() {
    return _cache.rdvs;
  },
  async addRdv(rdv) {
    rdv.id = Date.now();
    _cache.rdvs.push(rdv);
    await persist();
    return rdv;
  },
  async updateRdv(id, u) {
    const i = _cache.rdvs.findIndex((r) => r.id === id);
    if (i !== -1) {
      _cache.rdvs[i] = { ..._cache.rdvs[i], ...u };
      await persist();
    }
  },
  async deleteRdv(id) {
    _cache.rdvs = _cache.rdvs.filter((r) => r.id !== id);
    await persist();
  },

  getStocks() {
    return _cache.stocks;
  },
  async addStock(item) {
    item.id = Date.now();
    _cache.stocks.push(item);
    await persist();
    return item;
  },
  async updateStock(id, u) {
    const i = _cache.stocks.findIndex((s) => s.id === id);
    if (i !== -1) {
      _cache.stocks[i] = { ..._cache.stocks[i], ...u };
      await persist();
    }
  },
  async deleteStock(id) {
    _cache.stocks = _cache.stocks.filter((s) => s.id !== id);
    await persist();
  },

  getContrats() {
    return _cache.contrats;
  },
  async addContrat(c) {
    c.id = Date.now();
    c.createdAt = new Date().toISOString();
    _cache.contrats.push(c);
    await persist();
    return c;
  },
  async deleteContrat(id) {
    _cache.contrats = _cache.contrats.filter((c) => c.id !== id);
    await persist();
  },

  // --- HELPERS RELATIONS ---
  getRdvsForClient(clientId) {
    return _cache.rdvs.filter((r) => r.clientId === clientId);
  },
  getContratsForClient(clientId) {
    return _cache.contrats.filter((c) => c.clientId === clientId);
  },

  // --- FINANCES ---
  getFinances() {
    return _cache.finances;
  },
  getFinancesMonth(year, month) {
    return _cache.finances.filter((f) => {
      if (!f.date) return false;
      const d = new Date(f.date + "T12:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },
  getTotalCA(year, month) {
    return this.getFinancesMonth(year, month)
      .filter((f) => f.type === "recette")
      .reduce((s, f) => s + (f.montant || 0), 0);
  },
  getTotalDepenses(year, month) {
    return this.getFinancesMonth(year, month)
      .filter((f) => f.type === "depense")
      .reduce((s, f) => s + (f.montant || 0), 0);
  },
  async addFinance(entry) {
    entry.id = Date.now();
    entry.createdAt = new Date().toISOString();
    _cache.finances.push(entry);
    await persist();
    return entry;
  },
  async updateFinance(id, u) {
    const i = _cache.finances.findIndex((f) => f.id === id);
    if (i !== -1) {
      _cache.finances[i] = { ..._cache.finances[i], ...u };
      await persist();
    }
  },
  async deleteFinance(id) {
    _cache.finances = _cache.finances.filter((f) => f.id !== id);
    await persist();
  },

  async seed() {
    if (_cache.clients.length > 0) return;
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
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const j2 = new Date(Date.now() + 172800000).toISOString().split("T")[0];
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
    _cache.stocks = [
      {
        id: 3001,
        categorie: "Encres",
        nom: "Encre Noire Intenze",
        quantite: 8,
        unite: "flacons",
        seuil: 5,
        prix: 12.5,
      },
      {
        id: 3002,
        categorie: "Encres",
        nom: "Encre Rouge Dynamic",
        quantite: 3,
        unite: "flacons",
        seuil: 4,
        prix: 14,
      },
      {
        id: 3003,
        categorie: "Encres",
        nom: "Encre Bleue Eternal",
        quantite: 6,
        unite: "flacons",
        seuil: 3,
        prix: 13,
      },
      {
        id: 3004,
        categorie: "Aiguilles",
        nom: "Aiguilles RL #12",
        quantite: 150,
        unite: "pièces",
        seuil: 50,
        prix: 0.8,
      },
      {
        id: 3005,
        categorie: "Aiguilles",
        nom: "Aiguilles Magnum Courbe",
        quantite: 40,
        unite: "pièces",
        seuil: 30,
        prix: 1.2,
      },
      {
        id: 3006,
        categorie: "Hygiène",
        nom: "Gants Nitrile M",
        quantite: 2,
        unite: "boîtes",
        seuil: 3,
        prix: 8,
      },
      {
        id: 3007,
        categorie: "Hygiène",
        nom: "Film plastique",
        quantite: 5,
        unite: "rouleaux",
        seuil: 2,
        prix: 6,
      },
      {
        id: 3008,
        categorie: "Soins",
        nom: "Baume Tattoo Care",
        quantite: 12,
        unite: "tubes",
        seuil: 5,
        prix: 9.5,
      },
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
        createdAt: "2024-03-15T09:00:00Z",
      },
    ];
    _cache.finances = [];
    await persist();
  },
};

loadCache().then(async () => {
  await DB.seed();
  if (typeof renderDashboard === "function") renderDashboard();
});
