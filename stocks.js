// === STOCKS — v1.2 ===
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
      <button class="btn btn-primary" onclick="openAddStock()">+ AJOUTER</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-label">Produits total</div>
        <div class="stat-value">${all.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alertes</div>
        <div class="stat-value" style="color:${alerts > 0 ? "#f39c12" : "var(--green)"}">${alerts}</div>
        <div class="stat-sub">stocks faibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ruptures</div>
        <div class="stat-value" style="color:${ruptures > 0 ? "var(--red)" : "var(--green)"}">${ruptures}</div>
        <div class="stat-sub">stocks à zéro</div>
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
        ? `<div class="empty-state"><div class="empty-icon">◫</div><div class="empty-text">AUCUN PRODUIT</div></div>`
        : cats
            .map((cat) => {
              const items = filtered.filter((s) => s.categorie === cat);
              return `
        <div class="section-title">${cat}</div>
        <div class="table-wrap mb-3">
          <table>
            <thead>
              <tr>
                <th>PRODUIT</th><th>QUANTITÉ</th><th>SEUIL</th><th>ÉTAT</th><th>N° LOT</th><th>PRIX UNIT.</th><th>VALEUR</th><th>ACTIONS</th>
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
                  return `
                  <tr>
                    <td><span style="font-weight:500">${s.nom}</span></td>
                    <td>
                      <div style="font-family:var(--font-mono);font-size:13px">${s.quantite} <span style="color:var(--ink-muted);font-size:11px">${s.unite}</span></div>
                      <div class="stock-bar-wrap" style="min-width:80px">
                        <div class="stock-bar-track"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div>
                      </div>
                    </td>
                    <td><span class="text-mono text-muted">${s.seuil} ${s.unite}</span></td>
                    <td><span class="badge ${badge}">${label}</span></td>
                    <td><span class="text-mono" style="font-size:10px;color:var(--ink-muted)">${s.numLot || "—"}</span></td>
                    <td><span class="text-mono">${s.prix ? s.prix.toFixed(2) + " €" : "—"}</span></td>
                    <td><span class="text-mono text-accent">${s.prix ? (s.quantite * s.prix).toFixed(2) + " €" : "—"}</span></td>
                    <td>
                      <div style="display:flex;gap:6px">
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

// ── Ajout produit ─────────────────────────────────────────────────────────────

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
    <div class="form-group">
      <label class="form-label">N° de lot (traçabilité)</label>
      <input class="form-input" id="s-numlot" placeholder="Ex: LOT-2024-08-A">
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
    numLot: document.getElementById("s-numlot").value.trim(),
  });
  closeModal();
  renderStocks();
  toast("Produit ajouté ✓", "success");
}

// ── Ajustement stock — avec motif + historique ────────────────────────────────

function _buildMouvementsHTML(stockId) {
  const mouvements = DB.getStockMouvements(stockId).slice(0, 5);
  if (mouvements.length === 0) return "";

  const rows = mouvements
    .map((m) => {
      const isEntree = m.delta >= 0;
      const deltaStr = (isEntree ? "+" : "") + m.delta;
      const color = isEntree ? "var(--green)" : "var(--red)";
      const date = new Date(m.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      const heure = new Date(m.date).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
        <div>
          <span style="font-family:var(--font-mono);font-size:12px;color:${color};font-weight:700">${deltaStr}</span>
          <span style="font-size:11px;color:var(--ink-muted);margin-left:8px">→ ${m.quantiteApres}</span>
          ${m.motif ? `<span style="font-size:11px;color:var(--ink-muted);margin-left:8px;font-style:italic">${m.motif}</span>` : ""}
        </div>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-faint)">${date} ${heure}</span>
      </div>
    `;
    })
    .join("");

  return `
    <div style="margin-top:20px">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink-muted);margin-bottom:8px">
        HISTORIQUE (5 DERNIERS)
      </div>
      ${rows}
    </div>
  `;
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
      <input class="form-input" id="adj-qty" type="number" value="${s.quantite}" min="0"
        style="font-size:18px;text-align:center">
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-10)">−10</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-5)">−5</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=Math.max(0,parseFloat(i.value||0)-1)">−1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+1">+1</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+5">+5</button>
      <button class="btn btn-ghost" onclick="let i=document.getElementById('adj-qty');i.value=parseFloat(i.value||0)+10">+10</button>
    </div>

    <div class="form-group">
      <label class="form-label">Motif (optionnel)</label>
      <select class="form-select" id="adj-motif-select" onchange="
        const other = document.getElementById('adj-motif-other');
        other.style.display = this.value === '__autre' ? '' : 'none';
        if (this.value !== '__autre') document.getElementById('adj-motif-input').value = this.value;
      ">
        <option value="">— Sélectionner ou laisser vide —</option>
        <option value="Réception commande">Réception commande</option>
        <option value="Utilisation séance">Utilisation séance</option>
        <option value="Perte / casse">Perte / casse</option>
        <option value="Correction inventaire">Correction inventaire</option>
        <option value="Retour fournisseur">Retour fournisseur</option>
        <option value="__autre">✎ Autre...</option>
      </select>
      <input class="form-input" id="adj-motif-other" id2="adj-motif-input"
        placeholder="Préciser le motif..." style="display:none;margin-top:8px">
      <input type="hidden" id="adj-motif-input">
    </div>

    ${_buildMouvementsHTML(id)}

    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveAdjustStock(${id}, ${s.quantite})">VALIDER</button>
    </div>
  `);

  // Synchronise l'input caché avec le select au changement
  document
    .getElementById("adj-motif-select")
    .addEventListener("change", function () {
      const hidden = document.getElementById("adj-motif-input");
      if (this.value !== "__autre") hidden.value = this.value;
    });
  document
    .getElementById("adj-motif-other")
    .addEventListener("input", function () {
      document.getElementById("adj-motif-input").value = this.value;
    });
}

async function saveAdjustStock(id, quantiteAvant) {
  const nouvelleQte = parseFloat(document.getElementById("adj-qty").value) || 0;
  const motif =
    document.getElementById("adj-motif-input").value.trim() ||
    document
      .getElementById("adj-motif-select")
      .value.replace("__autre", "")
      .trim();
  const delta = nouvelleQte - quantiteAvant;

  // Mise à jour du stock
  await DB.updateStock(id, { quantite: nouvelleQte });

  // Enregistrement du mouvement seulement si la quantité a changé
  if (delta !== 0) {
    await DB.addStockMouvement({
      stockId: id,
      delta,
      quantiteApres: nouvelleQte,
      motif,
    });
  }

  closeModal();
  renderStocks();

  // Toast contextuel selon le sens du mouvement
  if (delta > 0) toast(`+${delta} enregistré ✓`, "success");
  else if (delta < 0) toast(`${delta} enregistré ✓`, "info");
}

// ── Édition produit ───────────────────────────────────────────────────────────

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
    <div class="form-group">
      <label class="form-label">N° de lot (traçabilité)</label>
      <input class="form-input" id="es-numlot" value="${s.numLot || ""}" placeholder="Ex: LOT-2024-08-A">
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
    numLot: document.getElementById("es-numlot").value.trim(),
  });
  closeModal();
  renderStocks();
  toast("Produit mis à jour ✓", "success");
}

async function deleteStock(id) {
  if (confirm("Supprimer ce produit ?")) {
    await DB.deleteStock(id);
    renderStocks();
    toast("Produit supprimé", "info");
  }
}
