// === STOCKS ===
const CATEGORIES = [
  "Encres",
  "Aiguilles",
  "Hygiène",
  "Soins",
  "Matériel",
  "Autre",
];
let stocksCat = "Tous";

function renderStocks() {
  const all = DB.getStocks();
  const filtered =
    stocksCat === "Tous" ? all : all.filter((s) => s.categorie === stocksCat);
  const totalVal = all.reduce((sum, s) => sum + s.quantite * s.prix, 0);
  const alerts = all.filter((s) => s.quantite <= s.seuil).length;
  const ruptures = all.filter((s) => s.quantite === 0).length;
  const cats = [...new Set(filtered.map((s) => s.categorie))].sort();

  document.getElementById("page-stocks").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">STOCKS</div>
        <div class="page-subtitle">${all.length} PRODUITS · VALEUR ESTIMÉE : ${totalVal.toFixed(2)} €</div>
      </div>
      <button class="btn btn-primary" onclick="openAddStock()">+ NOUVEAU PRODUIT</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-label">Total</div>
        <div class="stat-value">${all.length}</div>
        <div class="stat-sub">produits en stock</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alertes</div>
        <div class="stat-value" style="color:${alerts > 0 ? "#ff9800" : "var(--green)"}">${alerts}</div>
        <div class="stat-sub">stocks faibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ruptures</div>
        <div class="stat-value" style="color:${ruptures > 0 ? "var(--red)" : "var(--green)"}">${ruptures}</div>
        <div class="stat-sub">${ruptures > 0 ? "à réapprovisionner" : "situation normale"}</div>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap">
      ${["Tous", ...CATEGORIES]
        .map(
          (cat) => `
        <button class="btn ${stocksCat === cat ? "btn-primary" : "btn-ghost"} btn-sm"
          onclick="stocksCat='${cat}';renderStocks()">${cat.toUpperCase()}</button>
      `,
        )
        .join("")}
    </div>

    ${
      cats.length === 0
        ? `
      <div class="empty-state"><div class="empty-icon">📦</div><div class="empty-text">AUCUN PRODUIT</div></div>
    `
        : cats
            .map((cat) => {
              const items = filtered.filter((s) => s.categorie === cat);
              return `
        <div class="section-title">${cat}</div>
        <div class="table-wrap mb-3">
          <table>
            <thead>
              <tr>
                <th>PRODUIT</th><th>QUANTITÉ</th><th>SEUIL</th><th>ÉTAT</th><th>PRIX UNIT.</th><th>VALEUR</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((s) => {
                  const ratio = s.seuil > 0 ? s.quantite / s.seuil : 1;
                  const pct = Math.min(100, ratio * 100);
                  const cls =
                    s.quantite === 0 ? "alert" : ratio <= 1 ? "warn" : "ok";
                  const badge =
                    s.quantite === 0
                      ? "badge-red"
                      : ratio <= 1
                        ? "badge-yellow"
                        : "badge-green";
                  const label =
                    s.quantite === 0 ? "RUPTURE" : ratio <= 1 ? "FAIBLE" : "OK";
                  const hasBatches = s.batches && s.batches.length > 0;

                  return `
                  <tr>
                    <td><span style="font-weight:500">${s.nom}</span>${hasBatches ? '<div style="font-size:10px;color:var(--ink-muted);margin-top:2px">📦 ' + s.batches.length + " lot" + (s.batches.length > 1 ? "s" : "") + "</div>" : ""}</td>
                    <td>
                      <div style="font-family:var(--font-mono);font-size:13px">${s.quantite} <span style="color:var(--ink-muted);font-size:11px">${s.unite}</span></div>
                      <div class="stock-bar-wrap" style="min-width:80px">
                        <div class="stock-bar-track"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div>
                      </div>
                    </td>
                    <td><span class="text-mono text-muted">${s.seuil} ${s.unite}</span></td>
                    <td><span class="badge ${badge}">${label}</span></td>
                    <td><span class="text-mono">${s.prix ? s.prix.toFixed(2) + " €" : "—"}</span></td>
                    <td><span class="text-mono text-accent">${s.prix ? (s.quantite * s.prix).toFixed(2) + " €" : "—"}</span></td>
                    <td>
                      <div style="display:flex;gap:6px">
                        ${hasBatches ? '<button class="btn btn-ghost btn-sm" onclick="openBatchDetail(' + s.id + ')">📦</button>' : ""}
                        <button class="btn btn-ghost btn-sm" onclick="openAdjustStock(${s.id})">±</button>
                        <button class="btn btn-ghost btn-sm" onclick="openEditStock(${s.id})">EDIT</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteStock(${s.id})">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `;
            })
            .join("")
    }
  `;
}

function openAddStock() {
  openModal(`
    <div class="modal-title">NOUVEAU PRODUIT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-select" id="s-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Nom du produit</label>
        <input class="form-input" id="s-nom" placeholder="Encre Noire Intenze...">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Quantité</label>
        <input class="form-input" id="s-qty" type="number" value="0" min="0">
      </div>
      <div class="form-group">
        <label class="form-label">Unité</label>
        <input class="form-input" id="s-unite" placeholder="flacons, boîtes, pièces...">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Seuil d'alerte</label>
        <input class="form-input" id="s-seuil" type="number" value="5" min="0">
      </div>
      <div class="form-group">
        <label class="form-label">Prix unitaire (€)</label>
        <input class="form-input" id="s-prix" type="number" step="0.01" value="0">
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewStock()">ENREGISTRER</button>
    </div>
  `);
}

async function saveNewStock() {
  const nom = document.getElementById("s-nom").value.trim();
  if (!nom) {
    alert("Nom obligatoire.");
    return;
  }
  await DB.addStock({
    categorie: document.getElementById("s-cat").value,
    nom,
    quantite: parseFloat(document.getElementById("s-qty").value) || 0,
    unite: document.getElementById("s-unite").value.trim() || "unités",
    seuil: parseFloat(document.getElementById("s-seuil").value) || 0,
    prix: parseFloat(document.getElementById("s-prix").value) || 0,
  });
  closeModal();
  renderStocks();
}

function openAdjustStock(id) {
  const s = DB.getStocks().find((x) => x.id === id);
  if (!s) return;
  openModal(`
    <div class="modal-title">AJUSTER STOCK</div>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:14px;color:var(--ink-muted)">${s.nom}</div>
      <div style="font-family:var(--font-display);font-size:48px;color:var(--accent);margin:8px 0">${s.quantite}</div>
      <div style="font-size:12px;color:var(--ink-muted)">${s.unite}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Nouvelle quantité</label>
      <input class="form-input" id="adj-qty" type="number" value="${s.quantite}" min="0" style="font-size:18px;text-align:center">
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-5)">−5</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-1)">−1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+1">+1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+5">+5</button>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveAdjustStock(${id})">VALIDER</button>
    </div>
  `);
}

async function saveAdjustStock(id) {
  await DB.updateStock(id, {
    quantite: parseFloat(document.getElementById("adj-qty").value) || 0,
  });
  closeModal();
  renderStocks();
}

function openEditStock(id) {
  const s = DB.getStocks().find((x) => x.id === id);
  if (!s) return;
  openModal(`
    <div class="modal-title">MODIFIER PRODUIT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-select" id="es-cat">${CATEGORIES.map((c) => `<option ${s.categorie === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input class="form-input" id="es-nom" value="${s.nom}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Quantité</label>
        <input class="form-input" id="es-qty" type="number" value="${s.quantite}" min="0">
      </div>
      <div class="form-group">
        <label class="form-label">Unité</label>
        <input class="form-input" id="es-unite" value="${s.unite}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Seuil d'alerte</label>
        <input class="form-input" id="es-seuil" type="number" value="${s.seuil}" min="0">
      </div>
      <div class="form-group">
        <label class="form-label">Prix unitaire (€)</label>
        <input class="form-input" id="es-prix" type="number" step="0.01" value="${s.prix || 0}">
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveEditStock(${id})">SAUVEGARDER</button>
    </div>
  `);
}

async function saveEditStock(id) {
  await DB.updateStock(id, {
    categorie: document.getElementById("es-cat").value,
    nom: document.getElementById("es-nom").value.trim(),
    quantite: parseFloat(document.getElementById("es-qty").value) || 0,
    unite: document.getElementById("es-unite").value.trim(),
    seuil: parseFloat(document.getElementById("es-seuil").value) || 0,
    prix: parseFloat(document.getElementById("es-prix").value) || 0,
  });
  closeModal();
  renderStocks();
}

async function deleteStock(id) {
  if (confirm("Supprimer ce produit ?")) {
    await DB.deleteStock(id);
    renderStocks();
  }
}

// === BATCH/LOT MANAGEMENT ===

function openBatchDetail(stockId) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock) return;

  const batches = stock.batches || [];

  openModal(`
    <div class="modal-title">📦 LOTS — ${stock.nom}</div>
    
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600">QUANTITÉ TOTALE</div>
          <div style="font-size:20px;font-weight:700;color:var(--accent);margin-top:4px">${stock.quantite} ${stock.unite}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600">NOMBRE DE LOTS</div>
          <div style="font-size:20px;font-weight:700;color:var(--accent);margin-top:4px">${batches.length}</div>
        </div>
      </div>
    </div>
    
    ${
      batches.length === 0
        ? `
      <div class="empty-state" style="padding:40px 20px">
        <div class="empty-icon">📦</div>
        <div class="empty-text">AUCUN LOT ENREGISTRÉ</div>
      </div>
    `
        : `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${batches
          .map((batch, idx) => {
            const isExpired =
              batch.expiryDate && new Date(batch.expiryDate) < new Date();
            const daysLeft = batch.expiryDate
              ? Math.ceil(
                  (new Date(batch.expiryDate) - new Date()) /
                    (1000 * 60 * 60 * 24),
                )
              : null;
            const expiryColor = isExpired
              ? "var(--red)"
              : daysLeft && daysLeft < 30
                ? "#ff9800"
                : "var(--green)";

            return `
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:12px;display:flex;justify-content:space-between;align-items:flex-start">
              <div style="flex:1">
                <div style="font-weight:600;font-size:13px">${batch.number}</div>
                <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">
                  ${new Date(batch.dateAdded).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  · ${batch.quantity} ${stock.unite}
                </div>
                ${
                  batch.expiryDate
                    ? `
                  <div style="font-size:10px;color:${expiryColor};margin-top:4px;font-weight:600">
                    ${isExpired ? "❌ EXPIRÉ" : daysLeft < 30 ? "⚠️ EXPIRE IN " + daysLeft + "j" : "✓ Valide (" + daysLeft + "j)"}
                  </div>
                `
                    : '<div style="font-size:10px;color:var(--ink-muted);margin-top:4px">Sans date expiration</div>'
                }
              </div>
              <button class="btn btn-danger btn-sm" onclick="removeBatch(${stockId}, '${batch.number}')">✕</button>
            </div>
          `;
          })
          .join("")}
      </div>
    `
    }
    
    <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px">
      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="openAddBatch(${stockId})">+ AJOUTER UN LOT</button>
    </div>
    
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
    </div>
  `);
}

function openAddBatch(stockId) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock) return;

  openModal(`
    <div class="modal-title">AJOUTER LOT — ${stock.nom}</div>
    
    <div class="form-group">
      <label class="form-label">Numéro de lot</label>
      <input class="form-input" id="batch-number" placeholder="Ex: LOT-2025-001, BATCH-123" style="font-family:var(--font-mono)">
      <div style="font-size:10px;color:var(--ink-muted);margin-top:4px">Format: Alphanumérique, tirets autorisés</div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Quantité</label>
        <input class="form-input" id="batch-qty" type="number" value="1" min="1">
      </div>
      <div class="form-group">
        <label class="form-label">Date expiration</label>
        <input class="form-input" id="batch-expiry" type="date">
        <div style="font-size:10px;color:var(--ink-muted);margin-top:4px">Optionnel</div>
      </div>
    </div>
    
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin:16px 0">
      <div style="font-size:11px;color:var(--ink-muted);font-weight:600;margin-bottom:6px">ℹ️ INFO</div>
      <div style="font-size:12px;color:var(--ink-muted);line-height:1.6">
        Le lot sera associé à <strong>${stock.nom}</strong><br>
        La quantité totale du stock sera mise à jour automatiquement
      </div>
    </div>
    
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveBatch(${stockId})">ENREGISTRER</button>
    </div>
  `);
}

async function saveBatch(stockId) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock) return;

  const batchNumber = document.getElementById("batch-number").value.trim();
  const quantity = parseInt(document.getElementById("batch-qty").value);
  const expiryDate = document.getElementById("batch-expiry").value;

  if (!batchNumber) {
    alert("Numéro de lot obligatoire");
    return;
  }

  if (quantity < 1) {
    alert("Quantité doit être >= 1");
    return;
  }

  // Initialiser batches si nécessaire
  if (!stock.batches) stock.batches = [];

  // Vérifier si lot existe
  const existingBatch = stock.batches.find((b) => b.number === batchNumber);
  if (existingBatch) {
    if (
      !confirm(
        `Lot "${batchNumber}" existe déjà. Ajouter ${quantity} à ce lot ?`,
      )
    )
      return;
    existingBatch.quantity += quantity;
  } else {
    stock.batches.push({
      number: batchNumber,
      quantity: quantity,
      expiryDate: expiryDate || null,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }

  // Recalculer quantité totale
  stock.quantite = stock.batches.reduce((sum, b) => sum + b.quantity, 0);

  await DB.updateStock(stock.id, stock);
  closeModal();
  renderStocks();
}

async function removeBatch(stockId, batchNumber) {
  if (!confirm(`Supprimer le lot "${batchNumber}" ?`)) return;

  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock || !stock.batches) return;

  stock.batches = stock.batches.filter((b) => b.number !== batchNumber);
  stock.quantite = stock.batches.reduce((sum, b) => sum + b.quantity, 0);

  await DB.updateStock(stock.id, stock);
  closeModal();
  renderStocks();
}
