// === STOCKS & LOTS ===
const CATEGORIES = [
  "Encres",
  "Aiguilles",
  "Hygiène",
  "Soins",
  "Matériel",
  "Autre",
];
let stocksCat = "Tous";
let stocksTab = "stocks"; // 'stocks' | 'lots'

function renderStocks() {
  if (stocksTab === "lots") {
    renderLotsTab();
    return;
  }

  const all = DB.getStocks();
  const filtered =
    stocksCat === "Tous" ? all : all.filter((s) => s.categorie === stocksCat);
  const totalVal = all.reduce((sum, s) => sum + s.quantite * s.prix, 0);
  const alerts = all.filter(
    (s) => s.quantite <= s.seuil && s.quantite > 0,
  ).length;
  const ruptures = all.filter((s) => s.quantite === 0).length;
  const cats = [...new Set(filtered.map((s) => s.categorie))].sort();

  document.getElementById("page-stocks").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">STOCKS</div>
        <div class="page-subtitle">${all.length} PRODUITS · VALEUR ESTIMÉE : ${formatMoney(totalVal)}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" onclick="openAddStock()">+ PRODUIT</button>
        <button class="btn btn-primary" onclick="openAddLot()">+ NUMÉRO DE LOT</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="stocksTab='stocks';renderStocks()">STOCKS</button>
      <button class="tab-btn" onclick="stocksTab='lots';renderStocks()">NUMÉROS DE LOTS</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px">
      <div class="stat-card">
        <div class="stat-label">Produits</div>
        <div class="stat-value">${all.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alertes</div>
        <div class="stat-value" style="color:${alerts > 0 ? "var(--orange)" : "var(--green)"}">${alerts}</div>
        <div class="stat-sub">stocks faibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ruptures</div>
        <div class="stat-value" style="color:${ruptures > 0 ? "var(--red)" : "var(--green)"}">${ruptures}</div>
        <div class="stat-sub">stocks à zéro</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Valeur totale</div>
        <div class="stat-value" style="font-size:22px;color:var(--accent)">${formatMoney(totalVal)}</div>
      </div>
    </div>

    <div style="display:flex;gap:5px;margin-bottom:18px;flex-wrap:wrap">
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
        ? `<div class="empty-state"><div class="empty-icon">◫</div><div class="empty-text">AUCUN PRODUIT</div></div>`
        : cats
            .map((cat) => {
              const items = filtered.filter((s) => s.categorie === cat);
              return `
          <div class="section-title">${cat}</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>PRODUIT</th><th>QTÉ</th><th>SEUIL</th><th>ÉTAT</th><th>PRIX UNIT.</th><th>VALEUR</th><th>LOTS ACTIFS</th><th>ACTIONS</th></tr>
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
                      s.quantite === 0
                        ? "RUPTURE"
                        : ratio <= 1
                          ? "FAIBLE"
                          : "OK";
                    const activeLots = DB.getLotsForStock(s.id).filter(
                      (l) => l.statut === "actif",
                    );
                    return `
                  <tr>
                    <td>
                      <div style="font-weight:500">${s.nom}</div>
                      ${s.fournisseur ? `<div style="font-size:10px;color:var(--ink-muted)">${s.fournisseur}</div>` : ""}
                    </td>
                    <td>
                      <div style="font-family:var(--font-mono);font-size:13px">${s.quantite} <span style="font-size:10px;color:var(--ink-muted)">${s.unite}</span></div>
                      <div class="stock-bar-wrap" style="min-width:70px">
                        <div class="stock-bar-track"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div>
                      </div>
                    </td>
                    <td><span class="text-mono text-muted">${s.seuil} ${s.unite}</span></td>
                    <td><span class="badge ${badge}">${label}</span></td>
                    <td><span class="text-mono">${s.prix ? formatMoney(s.prix) : "—"}</span></td>
                    <td><span class="text-mono text-accent">${s.prix ? formatMoney(s.quantite * s.prix) : "—"}</span></td>
                    <td>
                      ${
                        activeLots.length === 0
                          ? '<span style="color:var(--ink-muted);font-size:10px">—</span>'
                          : activeLots
                              .slice(0, 2)
                              .map(
                                (l) => `
                          <span class="lot-tag" onclick="openLotDetail(${l.id})">◉ ${l.numeroLot}</span>
                        `,
                              )
                              .join(" ")
                      }
                      ${activeLots.length > 2 ? `<span style="font-size:10px;color:var(--ink-muted)">+${activeLots.length - 2}</span>` : ""}
                    </td>
                    <td>
                      <div style="display:flex;gap:5px">
                        <button class="btn btn-ghost btn-sm" onclick="openAdjustStock(${s.id})">±</button>
                        <button class="btn btn-ghost btn-sm" onclick="openEditStock(${s.id})">EDIT</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteStock(${s.id})">✕</button>
                      </div>
                    </td>
                  </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>`;
            })
            .join("")
    }
  `;
}

// === ONGLET LOTS ===
function renderLotsTab() {
  const lots = DB.getLots();
  const today = new Date().toISOString().split("T")[0];
  const soon = new Date(Date.now() + 180 * 86400000)
    .toISOString()
    .split("T")[0];

  const actifs = lots.filter((l) => l.statut === "actif");
  const expires = lots.filter(
    (l) => l.statut === "actif" && l.datePeremption && l.datePeremption <= soon,
  );
  const epuises = lots.filter((l) => l.statut === "epuise");

  document.getElementById("page-stocks").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">STOCKS</div>
        <div class="page-subtitle">${lots.length} LOTS · ${actifs.length} ACTIFS · ${expires.length} EXPIRANT BIENTÔT</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" onclick="openAddStock()">+ PRODUIT</button>
        <button class="btn btn-primary" onclick="openAddLot()">+ NUMÉRO DE LOT</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn" onclick="stocksTab='stocks';renderStocks()">STOCKS</button>
      <button class="tab-btn active" onclick="stocksTab='lots';renderStocks()">NUMÉROS DE LOTS</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px">
      <div class="stat-card">
        <div class="stat-label">Lots enregistrés</div>
        <div class="stat-value">${lots.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Lots actifs</div>
        <div class="stat-value" style="color:var(--green)">${actifs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Expirant < 6 mois</div>
        <div class="stat-value" style="color:${expires.length > 0 ? "#a569bd" : "var(--green)"}">${expires.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Épuisés / archivés</div>
        <div class="stat-value" style="color:var(--ink-muted)">${epuises.length}</div>
      </div>
    </div>

    ${
      expires.length > 0
        ? `
      <div class="info-box" style="margin-bottom:18px;border-color:rgba(142,68,173,0.4)">
        <span class="info-box-icon">⚠</span>
        <div>
          <strong>${expires.length} lot${expires.length > 1 ? "s" : ""} expirant dans moins de 6 mois</strong><br>
          ${expires.map((l) => `<span class="lot-inline">${l.numeroLot}</span> — ${l.nom} (${formatDate(l.datePeremption)})`).join(" &nbsp;·&nbsp; ")}
        </div>
      </div>
    `
        : ""
    }

    <div class="section-title">Lots actifs — Aiguilles</div>
    ${renderLotsTable(actifs.filter((l) => l.categorie === "Aiguilles"))}

    <div class="section-title">Lots actifs — Encres</div>
    ${renderLotsTable(actifs.filter((l) => l.categorie === "Encres"))}

    ${
      epuises.length > 0
        ? `
      <div class="section-title">Lots archivés / épuisés</div>
      ${renderLotsTable(epuises)}
    `
        : ""
    }
  `;
}

function renderLotsTable(lots) {
  if (lots.length === 0)
    return `<div class="empty-state" style="padding:24px"><div class="empty-text">AUCUN LOT</div></div>`;
  const today = new Date().toISOString().split("T")[0];
  const soon = new Date(Date.now() + 180 * 86400000)
    .toISOString()
    .split("T")[0];

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>NUMÉRO DE LOT</th><th>PRODUIT</th><th>FABRICANT</th><th>RÉCEPTION</th><th>FABRICATION</th><th>PÉREMPTION</th><th>QTÉ REST.</th><th>CERTIFICATION</th><th>STATUT</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          ${lots
            .map((l) => {
              const d = daysUntil(l.datePeremption);
              const peremBadge = !l.datePeremption
                ? '<span class="badge badge-gray">—</span>'
                : l.datePeremption < today
                  ? '<span class="badge badge-red">EXPIRÉ</span>'
                  : l.datePeremption <= soon
                    ? `<span class="badge badge-purple">J-${d}</span>`
                    : `<span class="badge badge-green">OK</span>`;
              const statutBdg =
                l.statut === "epuise"
                  ? '<span class="badge badge-gray">ÉPUISÉ</span>'
                  : l.statut === "actif"
                    ? '<span class="badge badge-green">ACTIF</span>'
                    : `<span class="badge badge-yellow">${l.statut}</span>`;

              // Utilisation dans les RDV
              const rdvsUtilisant = DB.getRdvs().filter(
                (r) =>
                  r.lotAiguille === l.id || (r.lotEncre || []).includes(l.id),
              );

              return `
            <tr>
              <td>
                <span class="lot-inline" style="font-size:11px;cursor:pointer" onclick="openLotDetail(${l.id})">${l.numeroLot}</span>
              </td>
              <td style="font-size:12px">${l.nom}</td>
              <td style="font-size:12px;color:var(--ink-muted)">${l.fabricant || "—"}</td>
              <td><span class="text-mono" style="font-size:11px">${formatDate(l.dateReception)}</span></td>
              <td><span class="text-mono" style="font-size:11px">${formatDate(l.dateFabrication)}</span></td>
              <td>
                <span class="text-mono" style="font-size:11px">${formatDate(l.datePeremption)}</span>
                <div style="margin-top:3px">${peremBadge}</div>
              </td>
              <td>
                <span class="text-mono">${l.quantiteRestante} ${l.unite || ""}</span>
                <div style="font-size:10px;color:var(--ink-muted)">/ ${l.quantiteRecue} reçus</div>
              </td>
              <td style="font-size:11px;color:var(--ink-muted);max-width:140px">${l.certificationSterilisation || "—"}</td>
              <td>${statutBdg}</td>
              <td>
                <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm" onclick="openLotDetail(${l.id})">VOIR</button>
                  <button class="btn btn-ghost btn-sm" onclick="openEditLot(${l.id})">EDIT</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteLot(${l.id})">✕</button>
                </div>
              </td>
            </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function openLotDetail(id) {
  const l = DB.getLot(id);
  if (!l) return;
  const today = new Date().toISOString().split("T")[0];
  const soon = new Date(Date.now() + 180 * 86400000)
    .toISOString()
    .split("T")[0];
  const d = daysUntil(l.datePeremption);

  const rdvsUtilisant = DB.getRdvs()
    .filter((r) => r.lotAiguille === l.id || (r.lotEncre || []).includes(l.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  openModal(
    `
    <div class="modal-title">${l.categorie === "Aiguilles" ? "🪡" : "🎨"} LOT ${l.numeroLot}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
      <div class="card">
        <div class="stat-label">Produit</div>
        <div style="font-size:14px;font-weight:500;margin-top:4px">${l.nom}</div>
        <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">${l.categorie} · ${l.fabricant || "—"}</div>
      </div>
      <div class="card">
        <div class="stat-label">Certification stérilisation</div>
        <div style="font-size:12px;margin-top:4px;color:var(--green)">${l.certificationSterilisation || "Non renseignée"}</div>
        ${l.temperatureStockage ? `<div style="font-size:11px;color:var(--ink-muted);margin-top:2px">Temp. stockage : ${l.temperatureStockage}</div>` : ""}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
      <div class="stat-card">
        <div class="stat-label">Réception</div>
        <div style="font-size:12px;margin-top:4px">${formatDate(l.dateReception)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Fabrication</div>
        <div style="font-size:12px;margin-top:4px">${formatDate(l.dateFabrication)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Péremption</div>
        <div style="font-size:12px;margin-top:4px;color:${!l.datePeremption ? "inherit" : l.datePeremption < today ? "var(--red)" : l.datePeremption <= soon ? "#a569bd" : "var(--green)"}">${formatDate(l.datePeremption)}</div>
        ${l.datePeremption ? `<div style="font-size:10px;color:var(--ink-muted)">${d > 0 ? d + " j restants" : "EXPIRÉ"}</div>` : ""}
      </div>
      <div class="stat-card">
        <div class="stat-label">Quantité</div>
        <div style="font-size:12px;margin-top:4px">${l.quantiteRestante} / ${l.quantiteRecue} ${l.unite || ""}</div>
      </div>
    </div>

    ${l.notes ? `<div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-size:12px;color:var(--ink-muted);margin-bottom:16px;font-style:italic">${l.notes}</div>` : ""}

    <div class="section-title">Traçabilité — Utilisations (${rdvsUtilisant.length} RDV)</div>
    ${
      rdvsUtilisant.length === 0
        ? `<div style="color:var(--ink-muted);font-size:12px;margin-bottom:14px">Aucune utilisation enregistrée</div>`
        : `<div class="table-wrap" style="margin-bottom:14px">
          <table>
            <thead><tr><th>DATE</th><th>CLIENT</th><th>PRESTATION</th><th>STATUT</th></tr></thead>
            <tbody>
              ${rdvsUtilisant
                .map(
                  (r) => `
                <tr>
                  <td><span class="text-mono" style="font-size:11px">${formatDate(r.date)}</span></td>
                  <td>${clientName(r.clientId)}</td>
                  <td style="font-size:12px">${r.titre}</td>
                  <td>${statutBadge(r.statut)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>`
    }

    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-ghost" onclick="closeModal();openEditLot(${id})">MODIFIER</button>
      ${l.statut === "actif" ? `<button class="btn btn-ghost" onclick="archiveLot(${id})">ARCHIVER</button>` : ""}
    </div>
  `,
    true,
  );
}

function openAddLot() {
  const stocks = DB.getStocks().filter(
    (s) => s.categorie === "Aiguilles" || s.categorie === "Encres",
  );
  openModal(
    `
    <div class="modal-title">NOUVEAU LOT</div>
    <div class="info-box" style="margin-bottom:16px">
      <span class="info-box-icon">◈</span>
      <span>Enregistrez le numéro de lot présent sur l'emballage des aiguilles ou des encres pour assurer la traçabilité en cas de rappel ou d'incident.</span>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Produit associé *</label>
        <select class="form-select" id="lot-stock" onchange="fillLotCategorie()">
          <option value="">Sélectionner...</option>
          ${stocks.map((s) => `<option value="${s.id}" data-cat="${s.categorie}">${s.nom} (${s.categorie})</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <input class="form-input" id="lot-categorie" value="" readonly>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Numéro de lot * <span style="color:var(--accent)">(tel que sur l'emballage)</span></label>
        <input class="form-input" id="lot-numero" placeholder="ex: CHY-2024-RL12-0847">
      </div>
      <div class="form-group">
        <label class="form-label">Fabricant</label>
        <input class="form-input" id="lot-fabricant" placeholder="Cheyenne, Intenze...">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de réception</label>
        <input class="form-input" id="lot-reception" type="date" value="${new Date().toISOString().split("T")[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Date de fabrication</label>
        <input class="form-input" id="lot-fabrication" type="date">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de péremption</label>
        <input class="form-input" id="lot-peremption" type="date">
      </div>
      <div class="form-group">
        <label class="form-label">Quantité reçue *</label>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="lot-qterecu" type="number" value="0" min="0" style="flex:1">
          <input class="form-input" id="lot-unite" placeholder="unité" style="width:100px">
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Certification stérilisation</label>
        <input class="form-input" id="lot-certif" placeholder="EO — ISO 11135, conforme REACH...">
      </div>
      <div class="form-group">
        <label class="form-label">Temp. de stockage</label>
        <input class="form-input" id="lot-temp" placeholder="15-25°C">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="lot-notes" placeholder="État à réception, observations..." style="min-height:55px"></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewLot()">ENREGISTRER</button>
    </div>
  `,
    true,
  );
}

function fillLotCategorie() {
  const sel = document.getElementById("lot-stock");
  const opt = sel.options[sel.selectedIndex];
  document.getElementById("lot-categorie").value = opt.dataset.cat || "";
}

async function saveNewLot() {
  const stockId = parseInt(document.getElementById("lot-stock").value);
  const numero = document.getElementById("lot-numero").value.trim();
  const qte = parseFloat(document.getElementById("lot-qterecu").value) || 0;
  if (!stockId || !numero) {
    toast("Produit et numéro de lot obligatoires", "error");
    return;
  }

  const stock = DB.getStock(stockId);
  await DB.addLot({
    stockId,
    nom: stock ? stock.nom : "",
    categorie: stock
      ? stock.categorie
      : document.getElementById("lot-categorie").value,
    numeroLot: numero,
    fabricant: document.getElementById("lot-fabricant").value.trim(),
    dateReception: document.getElementById("lot-reception").value,
    dateFabrication: document.getElementById("lot-fabrication").value,
    datePeremption: document.getElementById("lot-peremption").value,
    quantiteRecue: qte,
    quantiteRestante: qte,
    unite: document.getElementById("lot-unite").value.trim(),
    certificationSterilisation: document
      .getElementById("lot-certif")
      .value.trim(),
    temperatureStockage: document.getElementById("lot-temp").value.trim(),
    notes: document.getElementById("lot-notes").value.trim(),
    statut: "actif",
  });

  closeModal();
  renderStocks();
  toast(`Lot ${numero} enregistré`, "success");
}

function openEditLot(id) {
  const l = DB.getLot(id);
  if (!l) return;
  openModal(`
    <div class="modal-title">MODIFIER LOT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Numéro de lot</label>
        <input class="form-input" id="el-numero" value="${l.numeroLot || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Fabricant</label>
        <input class="form-input" id="el-fabricant" value="${l.fabricant || ""}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de réception</label>
        <input class="form-input" id="el-reception" type="date" value="${l.dateReception || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Date de fabrication</label>
        <input class="form-input" id="el-fabrication" type="date" value="${l.dateFabrication || ""}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de péremption</label>
        <input class="form-input" id="el-peremption" type="date" value="${l.datePeremption || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Quantité restante</label>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="el-qte" type="number" value="${l.quantiteRestante || 0}" min="0" style="flex:1">
          <input class="form-input" id="el-unite" value="${l.unite || ""}" style="width:100px">
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Certification</label>
        <input class="form-input" id="el-certif" value="${l.certificationSterilisation || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-select" id="el-statut">
          <option value="actif"  ${l.statut === "actif" ? "selected" : ""}>Actif</option>
          <option value="epuise" ${l.statut === "epuise" ? "selected" : ""}>Épuisé</option>
          <option value="retire" ${l.statut === "retire" ? "selected" : ""}>Retiré (rappel)</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="el-notes" style="min-height:55px">${l.notes || ""}</textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveEditLot(${id})">SAUVEGARDER</button>
    </div>
  `);
}

async function saveEditLot(id) {
  await DB.updateLot(id, {
    numeroLot: document.getElementById("el-numero").value.trim(),
    fabricant: document.getElementById("el-fabricant").value.trim(),
    dateReception: document.getElementById("el-reception").value,
    dateFabrication: document.getElementById("el-fabrication").value,
    datePeremption: document.getElementById("el-peremption").value,
    quantiteRestante: parseFloat(document.getElementById("el-qte").value) || 0,
    unite: document.getElementById("el-unite").value.trim(),
    certificationSterilisation: document
      .getElementById("el-certif")
      .value.trim(),
    statut: document.getElementById("el-statut").value,
    notes: document.getElementById("el-notes").value.trim(),
  });
  closeModal();
  renderStocks();
  toast("Lot mis à jour", "success");
}

async function archiveLot(id) {
  await DB.updateLot(id, { statut: "epuise" });
  closeModal();
  renderStocks();
  toast("Lot archivé", "info");
}

async function deleteLot(id) {
  if (
    !confirm(
      "Supprimer ce lot ? Cela retirera également les références depuis les RDV.",
    )
  )
    return;
  await DB.deleteLot(id);
  renderStocks();
  toast("Lot supprimé", "info");
}

// === STOCKS CRUD ===
function openAddStock() {
  openModal(`
    <div class="modal-title">NOUVEAU PRODUIT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-select" id="s-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Nom du produit *</label>
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
        <input class="form-input" id="s-unite" placeholder="flacons, boîtes...">
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
    <div class="form-group">
      <label class="form-label">Fournisseur</label>
      <input class="form-input" id="s-fourn" placeholder="Cheyenne, Intenze...">
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
    toast("Nom obligatoire", "error");
    return;
  }
  await DB.addStock({
    categorie: document.getElementById("s-cat").value,
    nom,
    quantite: parseFloat(document.getElementById("s-qty").value) || 0,
    unite: document.getElementById("s-unite").value.trim() || "unités",
    seuil: parseFloat(document.getElementById("s-seuil").value) || 0,
    prix: parseFloat(document.getElementById("s-prix").value) || 0,
    fournisseur: document.getElementById("s-fourn").value.trim(),
  });
  closeModal();
  renderStocks();
  toast("Produit ajouté", "success");
}

function openAdjustStock(id) {
  const s = DB.getStock(id);
  if (!s) return;
  openModal(`
    <div class="modal-title">AJUSTER STOCK</div>
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-size:13px;color:var(--ink-muted)">${s.nom}</div>
      <div style="font-family:var(--font-display);font-size:48px;color:var(--accent);margin:6px 0">${s.quantite}</div>
      <div style="font-size:12px;color:var(--ink-muted)">${s.unite}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Type de mouvement</label>
      <select class="form-select" id="adj-type">
        <option value="ajustement">Ajustement direct</option>
        <option value="entree">Entrée (réception commande)</option>
        <option value="sortie">Sortie (utilisation)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Quantité</label>
      <input class="form-input" id="adj-qty" type="number" value="${s.quantite}" min="0" style="font-size:18px;text-align:center">
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px">
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-10)">−10</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-1)">−1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+1">+1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+10">+10</button>
    </div>
    <div class="form-group">
      <label class="form-label">Raison (optionnel)</label>
      <input class="form-input" id="adj-raison" placeholder="Réception commande, inventaire...">
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveAdjustStock(${id})">VALIDER</button>
    </div>
  `);
}

async function saveAdjustStock(id) {
  const type = document.getElementById("adj-type").value;
  const qty = parseFloat(document.getElementById("adj-qty").value) || 0;
  const raison = document.getElementById("adj-raison").value.trim();
  await DB.addMouvement(id, { type, quantite: qty, raison });
  closeModal();
  renderStocks();
  toast("Stock mis à jour", "success");
}

function openEditStock(id) {
  const s = DB.getStock(id);
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
    <div class="form-group">
      <label class="form-label">Fournisseur</label>
      <input class="form-input" id="es-fourn" value="${s.fournisseur || ""}">
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
    fournisseur: document.getElementById("es-fourn").value.trim(),
  });
  closeModal();
  renderStocks();
  toast("Produit mis à jour", "success");
}

async function deleteStock(id) {
  if (!confirm("Supprimer ce produit et ses lots associés ?")) return;
  await DB.deleteStock(id);
  renderStocks();
  toast("Produit supprimé", "info");
}
