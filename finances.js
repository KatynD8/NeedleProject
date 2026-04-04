// === FINANCES ===
let finTab = "transactions"; // 'transactions' | 'stats'
let finYear = new Date().getFullYear();
let finMonth = new Date().getMonth();

const MOIS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const MOIS_LONG = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const CAT_RECETTES = ["Séance", "Acompte", "Pourboire", "Merchandise", "Autre"];
const CAT_DEPENSES = [
  "Encres",
  "Aiguilles",
  "Hygiène",
  "Matériel",
  "Loyer",
  "Communication",
  "Formation",
  "Autre",
];
const MODES_PAIEMENT = [
  "CB",
  "Espèces",
  "Virement",
  "Chèque",
  "Lydia",
  "PayPal",
  "Autre",
];

function renderFinances() {
  if (finTab === "stats") {
    renderFinancesStats();
    return;
  }

  const now = new Date();
  const all = DB.getFinancesMonth(finYear, finMonth);
  const ca = DB.getTotalCA(finYear, finMonth);
  const dep = DB.getTotalDepenses(finYear, finMonth);
  const net = ca - dep;

  document.getElementById("page-finances").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">FINANCES</div>
        <div class="page-subtitle">${MOIS_LONG[finMonth].toUpperCase()} ${finYear}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-ghost" onclick="finMonth--;if(finMonth<0){finMonth=11;finYear--;}renderFinances()">◂</button>
        <button class="btn btn-ghost" onclick="finMonth=new Date().getMonth();finYear=new Date().getFullYear();renderFinances()">CE MOIS</button>
        <button class="btn btn-ghost" onclick="finMonth++;if(finMonth>11){finMonth=0;finYear++;}renderFinances()">▸</button>
        <button class="btn btn-primary" onclick="openAddFinance()">+ ENTRÉE</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active">TRANSACTIONS</button>
      <button class="tab-btn" onclick="finTab='stats';renderFinances()">STATISTIQUES</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px">
      <div class="stat-card">
        <div class="stat-label">Chiffre d'affaires</div>
        <div class="stat-value" style="font-size:26px;color:var(--green)">${formatMoney(ca)}</div>
        <div class="stat-sub">recettes du mois</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dépenses</div>
        <div class="stat-value" style="font-size:26px;color:var(--red)">${formatMoney(dep)}</div>
        <div class="stat-sub">charges du mois</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Résultat net</div>
        <div class="stat-value" style="font-size:26px;color:${net >= 0 ? "var(--accent)" : "var(--red)"}">${formatMoney(net)}</div>
        <div class="stat-sub">${net >= 0 ? "bénéfice" : "déficit"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Transactions</div>
        <div class="stat-value">${all.length}</div>
        <div class="stat-sub">ce mois</div>
      </div>
    </div>

    ${
      all.length === 0
        ? `
      <div class="empty-state"><div class="empty-icon">◬</div><div class="empty-text">AUCUNE TRANSACTION CE MOIS</div></div>
    `
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>DATE</th><th>TYPE</th><th>CATÉGORIE</th><th>DESCRIPTION</th><th>CLIENT</th><th>MODE</th><th>MONTANT</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          ${all
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(
              (f) => `
            <tr>
              <td><span class="text-mono">${formatDate(f.date)}</span></td>
              <td>${f.type === "recette" ? '<span class="badge badge-green">↑ RECETTE</span>' : '<span class="badge badge-red">↓ DÉPENSE</span>'}</td>
              <td><span class="badge badge-gray">${f.categorie || "—"}</span></td>
              <td style="font-size:12px;max-width:180px">${f.description || "—"}</td>
              <td style="font-size:12px">${f.clientId ? clientName(f.clientId) : f.fournisseur || "—"}</td>
              <td style="font-size:11px;color:var(--ink-muted)">${f.modePaiement || "—"}</td>
              <td>
                <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${f.type === "recette" ? "var(--green)" : "var(--red)"}">
                  ${f.type === "recette" ? "+" : "−"}${formatMoney(f.montant)}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm" onclick="openEditFinance(${f.id})">EDIT</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteFinance(${f.id})">✕</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    }
  `;
}

function renderFinancesStats() {
  // Calculs annuels
  const year = finYear;
  const monthly = MOIS.map((m, i) => ({
    label: m,
    ca: DB.getTotalCA(year, i),
    dep: DB.getTotalDepenses(year, i),
  }));

  const totalCA = monthly.reduce((s, m) => s + m.ca, 0);
  const totalDep = monthly.reduce((s, m) => s + m.dep, 0);
  const bestMonth = [...monthly].sort((a, b) => b.ca - a.ca)[0];
  const maxVal = Math.max(...monthly.map((m) => Math.max(m.ca, m.dep)), 1);

  // RDV terminés avec tarif
  const rdvs = DB.getRdvs().filter(
    (r) => r.statut === "termine" && r.tarif > 0,
  );
  const avgTarif =
    rdvs.length > 0 ? rdvs.reduce((s, r) => s + r.tarif, 0) / rdvs.length : 0;

  document.getElementById("page-finances").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">FINANCES</div>
        <div class="page-subtitle">STATISTIQUES ${year}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-ghost" onclick="finYear--;renderFinances()">◂ ${year - 1}</button>
        <button class="btn btn-ghost" onclick="finYear=new Date().getFullYear();renderFinances()">CETTE ANNÉE</button>
        <button class="btn btn-ghost" onclick="finYear++;renderFinances()">${year + 1} ▸</button>
        <button class="btn btn-primary" onclick="openAddFinance()">+ ENTRÉE</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn" onclick="finTab='transactions';renderFinances()">TRANSACTIONS</button>
      <button class="tab-btn active">STATISTIQUES</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-label">CA annuel</div>
        <div class="stat-value" style="font-size:22px;color:var(--green)">${formatMoney(totalCA)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Charges annuelles</div>
        <div class="stat-value" style="font-size:22px;color:var(--red)">${formatMoney(totalDep)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Net annuel</div>
        <div class="stat-value" style="font-size:22px;color:${totalCA - totalDep >= 0 ? "var(--accent)" : "var(--red)"}">${formatMoney(totalCA - totalDep)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tarif moyen / séance</div>
        <div class="stat-value" style="font-size:22px;color:var(--accent)">${formatMoney(avgTarif)}</div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px">
      <div class="card">
        <div class="section-title">CA mensuel ${year}</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
          ${monthly
            .map(
              (m) => `
            <div class="perf-bar-row">
              <span class="perf-bar-label">${m.label}</span>
              <div class="perf-bar-track">
                <div class="perf-bar-fill" style="width:${(m.ca / maxVal) * 100}%"></div>
              </div>
              <span class="perf-bar-value">${m.ca > 0 ? formatMoney(m.ca) : "—"}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div class="card">
        <div class="section-title">Résumé mensuel</div>
        <div style="margin-top:8px">
          ${monthly
            .filter((m) => m.ca > 0 || m.dep > 0)
            .map(
              (m) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span style="font-family:var(--font-mono);font-size:11px">${m.label}</span>
              <div style="display:flex;gap:14px">
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--green)">+${formatMoney(m.ca)}</span>
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--red)">-${formatMoney(m.dep)}</span>
                <span style="font-family:var(--font-mono);font-size:11px;color:${m.ca - m.dep >= 0 ? "var(--accent)" : "var(--red)"}">=${formatMoney(m.ca - m.dep)}</span>
              </div>
            </div>
          `,
            )
            .join("")}
          ${monthly.every((m) => m.ca === 0 && m.dep === 0) ? `<div style="text-align:center;padding:20px;color:var(--ink-muted);font-size:12px">Aucune donnée pour ${year}</div>` : ""}
        </div>
        ${
          bestMonth.ca > 0
            ? `
          <div style="margin-top:12px;padding:10px 12px;background:var(--accent-glow);border:1px solid var(--accent-dim);border-radius:var(--radius)">
            <div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-muted);letter-spacing:2px;margin-bottom:3px">MEILLEUR MOIS</div>
            <div style="font-size:13px;color:var(--accent)">${bestMonth.label} — ${formatMoney(bestMonth.ca)}</div>
          </div>`
            : ""
        }
      </div>
    </div>
  `;
}

function openAddFinance(preType) {
  const clients = DB.getClients();
  openModal(`
    <div class="modal-title">NOUVELLE ENTRÉE</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Type *</label>
        <select class="form-select" id="f-type" onchange="toggleFinanceFields()">
          <option value="recette" ${preType !== "depense" ? "selected" : ""}>Recette ↑</option>
          <option value="depense" ${preType === "depense" ? "selected" : ""}>Dépense ↓</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Montant (€) *</label>
        <input class="form-input" id="f-montant" type="number" step="0.01" min="0" value="0">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-select" id="f-categorie">
          ${CAT_RECETTES.map((c) => `<option>${c}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="f-date" type="date" value="${new Date().toISOString().split("T")[0]}">
      </div>
    </div>
    <div class="form-group" id="f-client-group">
      <label class="form-label">Client (si séance)</label>
      <select class="form-select" id="f-client">
        <option value="">— Aucun</option>
        ${clients.map((c) => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join("")}
      </select>
    </div>
    <div class="form-group" id="f-fourn-group" style="display:none">
      <label class="form-label">Fournisseur</label>
      <input class="form-input" id="f-fourn" placeholder="Cheyenne, Amazon...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Mode de paiement</label>
        <select class="form-select" id="f-mode">
          ${MODES_PAIEMENT.map((m) => `<option>${m}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label"></label>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description *</label>
      <input class="form-input" id="f-desc" placeholder="Séance dragon — Laure Martin...">
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewFinance()">ENREGISTRER</button>
    </div>
  `);
  if (preType === "depense") toggleFinanceFields();
}

function toggleFinanceFields() {
  const type = document.getElementById("f-type").value;
  const sel = document.getElementById("f-categorie");
  const cats = type === "recette" ? CAT_RECETTES : CAT_DEPENSES;
  sel.innerHTML = cats.map((c) => `<option>${c}</option>`).join("");
  document.getElementById("f-client-group").style.display =
    type === "recette" ? "" : "none";
  document.getElementById("f-fourn-group").style.display =
    type === "depense" ? "" : "none";
}

async function saveNewFinance() {
  const montant = parseFloat(document.getElementById("f-montant").value);
  const desc = document.getElementById("f-desc").value.trim();
  const type = document.getElementById("f-type").value;
  if (!montant || !desc) {
    toast("Montant et description obligatoires", "error");
    return;
  }
  const clientId = parseInt(document.getElementById("f-client")?.value) || null;
  await DB.addFinance({
    type,
    montant,
    desc,
    description: desc,
    categorie: document.getElementById("f-categorie").value,
    date: document.getElementById("f-date").value,
    clientId: clientId || null,
    fournisseur: document.getElementById("f-fourn")?.value.trim() || "",
    modePaiement: document.getElementById("f-mode").value,
  });
  closeModal();
  renderFinances();
  toast(
    `Entrée ${type === "recette" ? "recette" : "dépense"} ajoutée`,
    "success",
  );
}

function openEditFinance(id) {
  const f = DB.getFinances().find((x) => x.id === id);
  if (!f) return;
  const clients = DB.getClients();
  openModal(`
    <div class="modal-title">MODIFIER ENTRÉE</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-select" id="ef-type">
          <option value="recette" ${f.type === "recette" ? "selected" : ""}>Recette ↑</option>
          <option value="depense" ${f.type === "depense" ? "selected" : ""}>Dépense ↓</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Montant (€)</label>
        <input class="form-input" id="ef-montant" type="number" step="0.01" value="${f.montant || 0}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <input class="form-input" id="ef-cat" value="${f.categorie || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="ef-date" type="date" value="${f.date || ""}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-input" id="ef-desc" value="${f.description || ""}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Mode paiement</label>
        <select class="form-select" id="ef-mode">
          ${MODES_PAIEMENT.map((m) => `<option ${f.modePaiement === m ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Client / Fournisseur</label>
        <select class="form-select" id="ef-client">
          <option value="">— Aucun</option>
          ${clients.map((c) => `<option value="${c.id}" ${f.clientId === c.id ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveEditFinance(${id})">SAUVEGARDER</button>
    </div>
  `);
}

async function saveEditFinance(id) {
  await DB.updateFinance(id, {
    type: document.getElementById("ef-type").value,
    montant: parseFloat(document.getElementById("ef-montant").value) || 0,
    categorie: document.getElementById("ef-cat").value.trim(),
    date: document.getElementById("ef-date").value,
    description: document.getElementById("ef-desc").value.trim(),
    modePaiement: document.getElementById("ef-mode").value,
    clientId: parseInt(document.getElementById("ef-client").value) || null,
  });
  closeModal();
  renderFinances();
  toast("Entrée mise à jour", "success");
}

async function deleteFinance(id) {
  confirmModal(
    "Supprimer cette entrée financière ? Cette action est irréversible.",
    async () => {
      await DB.deleteFinance(id);
      renderFinances();
      toast("Entrée supprimée", "info");
    },
  );
}
