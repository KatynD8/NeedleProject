// === FINANCES — v1.2 ===
let finTab = "transactions";
let finYear = new Date().getFullYear();
let finMonth = new Date().getMonth();
let finSort = { col: "date", dir: "desc" };

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

// ── Tri colonnes ──────────────────────────────────────────────────────────────

function setFinSort(col) {
  if (finSort.col === col) {
    finSort.dir = finSort.dir === "asc" ? "desc" : "asc";
  } else {
    finSort.col = col;
    finSort.dir = col === "montant" ? "desc" : "asc";
  }
  renderFinances();
}

function _sortFinances(arr) {
  const { col, dir } = finSort;
  const mult = dir === "asc" ? 1 : -1;
  return [...arr].sort((a, b) => {
    let va, vb;
    switch (col) {
      case "date":
        va = a.date || "";
        vb = b.date || "";
        break;
      case "type":
        va = a.type || "";
        vb = b.type || "";
        break;
      case "categorie":
        va = a.categorie || "";
        vb = b.categorie || "";
        break;
      case "montant":
        va = a.montant || 0;
        vb = b.montant || 0;
        break;
      default:
        va = "";
        vb = "";
    }
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
}

function _thFSort(label, col) {
  const active = finSort.col === col;
  const arrow = active ? (finSort.dir === "asc" ? " ↑" : " ↓") : "";
  return `<th style="cursor:pointer;user-select:none${active ? ";color:var(--accent)" : ""}"
    onclick="setFinSort('${col}')">${label}${arrow}</th>`;
}

// ── Rendu transactions ────────────────────────────────────────────────────────

function renderFinances() {
  if (finTab === "stats") {
    renderFinancesStats();
    return;
  }

  const all = _sortFinances(DB.getFinancesMonth(finYear, finMonth));
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
        <button class="btn btn-ghost" onclick="exportFinancesPDF()">⬇ PDF</button>
        <button class="btn btn-primary" onclick="openAddFinance()">+ ENTRÉE</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active">TRANSACTIONS</button>
      <button class="tab-btn" onclick="finTab='stats';renderFinances()">STATISTIQUES</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px">
      <div class="stat-card"><div class="stat-label">Chiffre d'affaires</div><div class="stat-value" style="font-size:26px;color:var(--green)">${formatMoney(ca)}</div><div class="stat-sub">recettes du mois</div></div>
      <div class="stat-card"><div class="stat-label">Dépenses</div><div class="stat-value" style="font-size:26px;color:var(--red)">${formatMoney(dep)}</div><div class="stat-sub">charges du mois</div></div>
      <div class="stat-card"><div class="stat-label">Résultat net</div><div class="stat-value" style="font-size:26px;color:${net >= 0 ? "var(--accent)" : "var(--red)"}">${formatMoney(net)}</div><div class="stat-sub">${net >= 0 ? "bénéfice" : "déficit"}</div></div>
      <div class="stat-card"><div class="stat-label">Transactions</div><div class="stat-value">${all.length}</div><div class="stat-sub">ce mois</div></div>
    </div>

    ${
      all.length === 0
        ? `<div class="empty-state"><div class="empty-icon">◬</div><div class="empty-text">AUCUNE TRANSACTION CE MOIS</div></div>`
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${_thFSort("DATE", "date")}
            ${_thFSort("TYPE", "type")}
            ${_thFSort("CATÉGORIE", "categorie")}
            <th>DESCRIPTION</th>
            <th>CLIENT / FOUR.</th>
            <th>MODE</th>
            ${_thFSort("MONTANT", "montant")}
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${all
            .map(
              (f) => `
            <tr>
              <td><span class="text-mono">${formatDate(f.date)}</span></td>
              <td>${f.type === "recette" ? '<span class="badge badge-green">↑ RECETTE</span>' : '<span class="badge badge-red">↓ DÉPENSE</span>'}</td>
              <td><span class="badge badge-gray">${escapeHTML(f.categorie) || "—"}</span></td>
              <td style="font-size:12px;max-width:180px">${escapeHTML(f.description) || "—"}</td>
              <td style="font-size:12px">${f.clientId ? escapeHTML(clientName(f.clientId)) : escapeHTML(f.fournisseur) || "—"}</td>
              <td style="font-size:11px;color:var(--ink-muted)">${escapeHTML(f.modePaiement) || "—"}</td>
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
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    }
  `;
}

// ── Stats annuelles ───────────────────────────────────────────────────────────

function renderFinancesStats() {
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
  const avgTarif = DB.getAvgTarifSeance(year);
  const nbSeances = DB.getFinances().filter((f) => {
    const d = new Date(f.date);
    return (
      d.getFullYear() === year &&
      f.type === "recette" &&
      f.categorie === "Séance"
    );
  }).length;

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
        <button class="btn btn-ghost" onclick="exportFinancesPDFAnnuel()">⬇ PDF ANNUEL</button>
        <button class="btn btn-primary" onclick="openAddFinance()">+ ENTRÉE</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn" onclick="finTab='transactions';renderFinances()">TRANSACTIONS</button>
      <button class="tab-btn active">STATISTIQUES</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">
      <div class="stat-card"><div class="stat-label">CA annuel</div><div class="stat-value" style="font-size:22px;color:var(--green)">${formatMoney(totalCA)}</div></div>
      <div class="stat-card"><div class="stat-label">Charges annuelles</div><div class="stat-value" style="font-size:22px;color:var(--red)">${formatMoney(totalDep)}</div></div>
      <div class="stat-card"><div class="stat-label">Net annuel</div><div class="stat-value" style="font-size:22px;color:${totalCA - totalDep >= 0 ? "var(--accent)" : "var(--red)"}">${formatMoney(totalCA - totalDep)}</div></div>
      <div class="stat-card">
        <div class="stat-label">Tarif moyen / séance</div>
        <div class="stat-value" style="font-size:22px;color:var(--accent)">${avgTarif > 0 ? formatMoney(avgTarif) : "—"}</div>
        <div class="stat-sub">${nbSeances > 0 ? `sur ${nbSeances} séance${nbSeances > 1 ? "s" : ""}` : "aucune séance"}</div>
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
              <div class="perf-bar-track"><div class="perf-bar-fill" style="width:${(m.ca / maxVal) * 100}%"></div></div>
              <span class="perf-bar-value">${m.ca > 0 ? formatMoney(m.ca) : "—"}</span>
            </div>`,
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
            </div>`,
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

// ── Export PDF récapitulatif mensuel ──────────────────────────────────────────

function exportFinancesPDF() {
  const transactions = DB.getFinancesMonth(finYear, finMonth);
  const ca = DB.getTotalCA(finYear, finMonth);
  const dep = DB.getTotalDepenses(finYear, finMonth);
  const net = ca - dep;
  const label = `${MOIS_LONG[finMonth]} ${finYear}`;

  const rows = transactions
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((f) => {
      const signe = f.type === "recette" ? "+" : "−";
      const color = f.type === "recette" ? "#27ae60" : "#c0392b";
      return `
        <tr>
          <td>${new Date(f.date + "T12:00:00").toLocaleDateString("fr-FR")}</td>
          <td>${f.type === "recette" ? "Recette" : "Dépense"}</td>
          <td>${f.categorie || "—"}</td>
          <td>${f.description || "—"}</td>
          <td>${f.modePaiement || "—"}</td>
          <td style="text-align:right;font-weight:600;color:${color}">${signe}${(f.montant || 0).toFixed(2)} €</td>
        </tr>`;
    })
    .join("");

  const s = _getStudioInfoForPDF();

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>Récapitulatif ${label}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${_getFinancePrintCSS()}
  </head><body>
    <div class="wrap">
      <div class="header">
        <div style="font-size:20px;font-weight:700;letter-spacing:2px">${s.studioNom}</div>
        <div style="font-size:12px;color:#555;margin-top:4px">${s.studioAdresse}</div>
        <h2>RÉCAPITULATIF FINANCIER — ${label.toUpperCase()}</h2>
        <div style="font-size:11px;color:#777">Édité le ${new Date().toLocaleDateString("fr-FR")}</div>
      </div>

      <div class="summary">
        <div class="sum-card green"><div class="sum-label">Recettes</div><div class="sum-val">${ca.toFixed(2)} €</div></div>
        <div class="sum-card red">  <div class="sum-label">Dépenses</div><div class="sum-val">${dep.toFixed(2)} €</div></div>
        <div class="sum-card ${net >= 0 ? "gold" : "red"}"><div class="sum-label">Résultat net</div><div class="sum-val">${net.toFixed(2)} €</div></div>
      </div>

      <h3>DÉTAIL DES TRANSACTIONS</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Catégorie</th><th>Description</th><th>Mode</th><th style="text-align:right">Montant</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right;font-weight:700;padding:10px 8px;border-top:2px solid #111">Total recettes</td>
            <td style="text-align:right;font-weight:700;padding:10px 8px;border-top:2px solid #111;color:#27ae60">+${ca.toFixed(2)} €</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align:right;font-weight:700;padding:4px 8px">Total dépenses</td>
            <td style="text-align:right;font-weight:700;padding:4px 8px;color:#c0392b">−${dep.toFixed(2)} €</td>
          </tr>
          <tr style="background:#fffbe6">
            <td colspan="5" style="text-align:right;font-weight:700;padding:10px 8px;border-top:1px solid #ddd;font-size:14px">Résultat net</td>
            <td style="text-align:right;font-weight:700;padding:10px 8px;border-top:1px solid #ddd;font-size:14px;color:${net >= 0 ? "#c8a96e" : "#c0392b"}">${net >= 0 ? "+" : ""}${net.toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">Document confidentiel — ${s.studioNom} — Conforme RGPD</div>
    </div>
    <div class="print-actions">
      <button onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
      <p>Dans la boîte de dialogue, choisissez <strong>« Enregistrer en PDF »</strong>.</p>
    </div>
  </body></html>`;

  _openPrintWindow(html);
}

function exportFinancesPDFAnnuel() {
  const year = finYear;
  const monthly = MOIS_LONG.map((m, i) => ({
    label: m,
    ca: DB.getTotalCA(year, i),
    dep: DB.getTotalDepenses(year, i),
  }));
  const totalCA = monthly.reduce((s, m) => s + m.ca, 0);
  const totalDep = monthly.reduce((s, m) => s + m.dep, 0);
  const s = _getStudioInfoForPDF();

  const rows = monthly
    .map(
      (m) => `
    <tr>
      <td>${m.label}</td>
      <td style="text-align:right;color:#27ae60">${m.ca > 0 ? "+" + m.ca.toFixed(2) + " €" : "—"}</td>
      <td style="text-align:right;color:#c0392b">${m.dep > 0 ? "−" + m.dep.toFixed(2) + " €" : "—"}</td>
      <td style="text-align:right;font-weight:600;color:${m.ca - m.dep >= 0 ? "#c8a96e" : "#c0392b"}">${m.ca - m.dep >= 0 ? "+" : ""}${(m.ca - m.dep).toFixed(2)} €</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>Récapitulatif annuel ${year}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${_getFinancePrintCSS()}
  </head><body>
    <div class="wrap">
      <div class="header">
        <div style="font-size:20px;font-weight:700;letter-spacing:2px">${s.studioNom}</div>
        <div style="font-size:12px;color:#555;margin-top:4px">${s.studioAdresse}</div>
        <h2>RÉCAPITULATIF ANNUEL — ${year}</h2>
        <div style="font-size:11px;color:#777">Édité le ${new Date().toLocaleDateString("fr-FR")}</div>
      </div>

      <div class="summary">
        <div class="sum-card green"><div class="sum-label">CA annuel</div><div class="sum-val">${totalCA.toFixed(2)} €</div></div>
        <div class="sum-card red"><div class="sum-label">Charges</div><div class="sum-val">${totalDep.toFixed(2)} €</div></div>
        <div class="sum-card ${totalCA - totalDep >= 0 ? "gold" : "red"}"><div class="sum-label">Net annuel</div><div class="sum-val">${(totalCA - totalDep).toFixed(2)} €</div></div>
      </div>

      <h3>RÉCAPITULATIF PAR MOIS</h3>
      <table>
        <thead><tr><th>Mois</th><th style="text-align:right">Recettes</th><th style="text-align:right">Dépenses</th><th style="text-align:right">Net</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#fffbe6">
            <td style="font-weight:700;padding:10px 8px;border-top:2px solid #111">TOTAL</td>
            <td style="text-align:right;font-weight:700;padding:10px 8px;border-top:2px solid #111;color:#27ae60">+${totalCA.toFixed(2)} €</td>
            <td style="text-align:right;font-weight:700;padding:10px 8px;border-top:2px solid #111;color:#c0392b">−${totalDep.toFixed(2)} €</td>
            <td style="text-align:right;font-weight:700;padding:10px 8px;border-top:2px solid #111;color:${totalCA - totalDep >= 0 ? "#c8a96e" : "#c0392b"}">${(totalCA - totalDep >= 0 ? "+" : "") + (totalCA - totalDep).toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>
      <div class="footer">Document confidentiel — ${s.studioNom} — Conforme RGPD</div>
    </div>
    <div class="print-actions">
      <button onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
      <p>Dans la boîte de dialogue, choisissez <strong>« Enregistrer en PDF »</strong>.</p>
    </div>
  </body></html>`;

  _openPrintWindow(html);
}

function _getStudioInfoForPDF() {
  const s =
    typeof _cache !== "undefined" && _cache.settings ? _cache.settings : {};
  return {
    studioNom: s.studioNom || "Plan'Ink Studio",
    studioAdresse:
      [s.studioAdresse, s.studioVille].filter(Boolean).join(" — ") ||
      "123 Rue de l'Encre — 75000 Paris",
  };
}

function _openPrintWindow(html) {
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) {
    alert("Autorisez les popups pour exporter le PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.addEventListener("load", () => setTimeout(() => win.print(), 400));
}

function _getFinancePrintCSS() {
  return `<style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; font-size:13px; color:#111; background:#fff; }
    .wrap { max-width:800px; margin:0 auto; padding:32px 40px; }
    .header { text-align:center; border-bottom:2px solid #111; padding-bottom:16px; margin-bottom:24px; }
    h2 { margin-top:14px; font-size:16px; letter-spacing:2px; }
    h3 { font-size:11px; font-weight:700; margin:20px 0 8px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #ddd; padding-bottom:4px; color:#333; }
    .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
    .sum-card { padding:14px; border-radius:8px; text-align:center; }
    .sum-card.green { background:#f0faf0; border:1px solid #a3d9a3; }
    .sum-card.red   { background:#fdf0f0; border:1px solid #f0a0a0; }
    .sum-card.gold  { background:#fffbe6; border:1px solid #e8d090; }
    .sum-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#666; margin-bottom:6px; }
    .sum-val   { font-size:20px; font-weight:700; }
    table { width:100%; border-collapse:collapse; margin-bottom:16px; }
    th { padding:8px; text-align:left; background:#f5f5f5; border:1px solid #ddd; font-size:11px; text-transform:uppercase; letter-spacing:1px; }
    td { padding:8px; border:1px solid #ddd; }
    tr:nth-child(even) { background:#fafafa; }
    .footer { margin-top:24px; font-size:10px; color:#999; text-align:center; border-top:1px solid #eee; padding-top:12px; }
    .print-actions { text-align:center; padding:24px; border-top:1px solid #eee; margin-top:16px; }
    .print-actions button { padding:12px 32px; font-size:14px; cursor:pointer; background:#111; color:#fff; border:none; border-radius:6px; }
    .print-actions p { margin-top:10px; font-size:12px; color:#777; }
    @page { margin:12mm 14mm; size:A4; }
    @media print { .print-actions { display:none; } .wrap { padding:0; } }
  </style>`;
}

// ── Modale saisie depuis RDV ──────────────────────────────────────────────────

function openFinanceFromRdv(rdvId) {
  const r = DB.getRdvs().find((x) => x.id === rdvId);
  if (!r) return;
  const c = DB.getClient(r.clientId);
  const clientNomStr = c ? `${c.prenom} ${c.nom}` : "";
  const clients = DB.getClients();

  openModal(`
    <div class="modal-title">💰 ENREGISTRER LA SÉANCE</div>
    <div style="padding:10px 12px;background:var(--accent-glow);border:1px solid var(--accent-dim);border-radius:var(--radius);margin-bottom:16px;font-size:12px;color:var(--accent);font-family:var(--font-mono)">
      ${escapeHTML(r.titre)} · ${escapeHTML(clientNomStr)} · ${formatDate(r.date)}
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Montant (€) *</label>
        <input class="form-input" id="f-montant" type="number" step="0.01" min="0" value="${r.tarif || 0}" style="font-size:18px;font-weight:700;text-align:center">
      </div>
      <div class="form-group">
        <label class="form-label">Mode de paiement</label>
        <select class="form-select" id="f-mode">${MODES_PAIEMENT.map((m) => `<option>${m}</option>`).join("")}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-select" id="f-categorie">${CAT_RECETTES.map((c) => `<option ${c === "Séance" ? "selected" : ""}>${c}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="f-client">
          <option value="">— Aucun</option>
          ${clients.map((cl) => `<option value="${cl.id}" ${cl.id === r.clientId ? "selected" : ""}>${escapeHTML(cl.prenom)} ${escapeHTML(cl.nom)}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-input" id="f-desc" value="${escapeHTML(r.titre)}${clientNomStr ? " — " + escapeHTML(clientNomStr) : ""}">
    </div>
    <input type="hidden" id="f-date-hidden" value="${r.date}">
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">IGNORER</button>
      <button class="btn btn-primary" onclick="saveFinanceFromRdv(${rdvId})">ENREGISTRER</button>
    </div>
  `);
}

async function saveFinanceFromRdv(rdvId) {
  const montant = parseFloat(document.getElementById("f-montant").value);
  const desc = document.getElementById("f-desc").value.trim();
  if (!montant || !desc) {
    toast("Montant et description obligatoires", "error");
    return;
  }
  const clientId = parseInt(document.getElementById("f-client")?.value) || null;
  const date = document.getElementById("f-date-hidden").value;
  await DB.addFinance({
    type: "recette",
    montant,
    description: desc,
    categorie: document.getElementById("f-categorie").value,
    date,
    clientId,
    fournisseur: "",
    modePaiement: document.getElementById("f-mode").value,
    rdvId,
  });
  await DB.updateRdv(rdvId, { tarif: montant });
  closeModal();
  toast("Recette enregistrée ✓", "success");
  if (
    typeof renderFinances === "function" &&
    document.getElementById("page-finances")?.classList.contains("active")
  ) {
    renderFinances();
  }
}

// ── Modale saisie manuelle ────────────────────────────────────────────────────

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
        <select class="form-select" id="f-categorie">${CAT_RECETTES.map((c) => `<option>${c}</option>`).join("")}</select>
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
        ${clients.map((c) => `<option value="${c.id}">${escapeHTML(c.prenom)} ${escapeHTML(c.nom)}</option>`).join("")}
      </select>
    </div>
    <div class="form-group" id="f-fourn-group" style="display:none">
      <label class="form-label">Fournisseur</label>
      <input class="form-input" id="f-fourn" placeholder="Cheyenne, Amazon...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Mode de paiement</label>
        <select class="form-select" id="f-mode">${MODES_PAIEMENT.map((m) => `<option>${m}</option>`).join("")}</select>
      </div>
      <div class="form-group"></div>
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
  sel.innerHTML = (type === "recette" ? CAT_RECETTES : CAT_DEPENSES)
    .map((c) => `<option>${c}</option>`)
    .join("");
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
    description: desc,
    categorie: document.getElementById("f-categorie").value,
    date: document.getElementById("f-date").value,
    clientId,
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
        <input class="form-input" id="ef-cat" value="${escapeHTML(f.categorie || "")}">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="ef-date" type="date" value="${f.date || ""}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-input" id="ef-desc" value="${escapeHTML(f.description || "")}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Mode paiement</label>
        <select class="form-select" id="ef-mode">
          ${MODES_PAIEMENT.map((m) => `<option ${f.modePaiement === m ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="ef-client">
          <option value="">— Aucun</option>
          ${clients.map((c) => `<option value="${c.id}" ${f.clientId === c.id ? "selected" : ""}>${escapeHTML(c.prenom)} ${escapeHTML(c.nom)}</option>`).join("")}
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
  if (!confirm("Supprimer cette entrée ?")) return;
  await DB.deleteFinance(id);
  renderFinances();
  toast("Entrée supprimée", "info");
}
