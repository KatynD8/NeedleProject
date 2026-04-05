// === DASHBOARD ===

function renderDashboard() {
  updateSidebarArtist();
  const clients = DB.getClients();
  const rdvs = DB.getRdvs();
  const stocks = DB.getStocks();
  const lots = DB.getLots();
  const finances = DB.getFinances();
  const today = new Date().toISOString().split("T")[0];

  const rdvsAujourdhui = rdvs.filter(
    (r) => r.date === today && r.statut !== "annule",
  );
  const rdvsAVenir = rdvs.filter(
    (r) => r.date > today && r.statut !== "annule",
  );
  const alertsStock = stocks.filter((s) => s.quantite <= s.seuil);

  const now = new Date();
  const caMonth = DB.getTotalCA(now.getFullYear(), now.getMonth());

  // Lots expirant bientôt (< 6 mois)
  const soon = new Date(Date.now() + 180 * 86400000)
    .toISOString()
    .split("T")[0];
  const lotsAlerts = lots.filter(
    (l) => l.statut === "actif" && l.datePeremption && l.datePeremption <= soon,
  );

  const prochains = [...rdvs]
    .filter((r) => r.date >= today && r.statut !== "annule")
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure),
    )
    .slice(0, 6);

  const recentes = [...finances]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  document.getElementById("page-dashboard").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">DASHBOARD</div>
        <div class="page-subtitle">${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" onclick="openSettings()">⚙ PARAMÈTRES</button>
      </div>
    </div>

    <div class="stat-grid-5">
      <div class="stat-card">
        <div class="stat-label">Clients</div>
        <div class="stat-value">${clients.length}</div>
        <div class="stat-sub">enregistrés</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">RDV aujourd'hui</div>
        <div class="stat-value">${rdvsAujourdhui.length}</div>
        <div class="stat-sub">séances planifiées</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">À venir</div>
        <div class="stat-value">${rdvsAVenir.length}</div>
        <div class="stat-sub">rendez-vous futurs</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alertes stock</div>
        <div class="stat-value" style="color:${alertsStock.length > 0 ? "var(--red)" : "var(--green)"}">${alertsStock.length + lotsAlerts.length}</div>
        <div class="stat-sub">${alertsStock.length} stock · ${lotsAlerts.length} lot</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">CA ce mois</div>
        <div class="stat-value" style="font-size:26px;color:var(--accent)">${formatMoney(caMonth)}</div>
        <div class="stat-sub">recettes</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:24px">
      <!-- Prochains RDV -->
      <div>
        <div class="section-title">Prochains rendez-vous</div>
        <div class="card" style="padding:0">
          ${
            prochains.length === 0
              ? `<div class="empty-state"><div class="empty-icon">◷</div><div class="empty-text">AUCUN RDV À VENIR</div></div>`
              : prochains
                  .map(
                    (r) => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--border)">
                <div style="text-align:center;min-width:42px">
                  <div style="font-family:var(--font-display);font-size:20px;color:var(--accent);line-height:1">${new Date(r.date + "T12:00:00").getDate()}</div>
                  <div style="font-family:var(--font-mono);font-size:8px;color:var(--ink-muted);letter-spacing:1px">${new Date(r.date + "T12:00:00").toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}</div>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.titre}</div>
                  <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">${clientName(r.clientId)} · ${r.heure} · ${r.duree}min</div>
                  <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">
                    ${r.lotAiguille ? lotBadge(r.lotAiguille) : ""}
                    ${(r.lotEncre || []).map((id) => lotBadge(id)).join("")}
                  </div>
                </div>
                ${statutBadge(r.statut)}
              </div>
            `,
                  )
                  .join("")
          }
        </div>
      </div>

      <!-- Alertes -->
      <div>
        <div class="section-title">Alertes & Priorités</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${alertsStock
            .slice(0, 4)
            .map(
              (s) => `
            <div class="card" style="padding:12px;border-color:${s.quantite === 0 ? "rgba(192,57,43,0.3)" : "rgba(230,126,34,0.3)"}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:12px;font-weight:500">${s.nom}</div>
                  <div style="font-size:10px;color:var(--ink-muted);margin-top:2px">${s.categorie}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-family:var(--font-mono);font-size:13px;color:${s.quantite === 0 ? "var(--red)" : "var(--orange)"}">${s.quantite} ${s.unite}</div>
                  <div style="font-size:9px;color:var(--ink-muted)">seuil ${s.seuil}</div>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
          ${lotsAlerts
            .slice(0, 3)
            .map((l) => {
              const d = daysUntil(l.datePeremption);
              return `
            <div class="card" style="padding:12px;border-color:rgba(142,68,173,0.3)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:12px;font-weight:500">${l.nom}</div>
                  <div style="font-size:10px;color:var(--ink-muted);margin-top:2px">Lot <span class="lot-inline">${l.numeroLot}</span></div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:11px;color:#a569bd">Exp. ${formatDate(l.datePeremption)}</div>
                  <div style="font-size:10px;color:var(--ink-muted)">${d}j restants</div>
                </div>
              </div>
            </div>`;
            })
            .join("")}
          ${
            alertsStock.length === 0 && lotsAlerts.length === 0
              ? `<div class="card" style="padding:20px;text-align:center">
                <div style="color:var(--green);font-size:20px;margin-bottom:6px">✓</div>
                <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:2px">TOUT EST AU VERT</div>
               </div>`
              : ""
          }
        </div>
      </div>
    </div>

    <!-- Transactions récentes -->
    <div class="section-title">Transactions récentes</div>
    <div class="card" style="padding:0">
      ${
        recentes.length === 0
          ? `<div class="empty-state"><div class="empty-icon">◬</div><div class="empty-text">AUCUNE TRANSACTION</div></div>`
          : recentes
              .map(
                (f) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;background:${f.type === "recette" ? "var(--green-glow)" : "var(--red-glow)"};color:${f.type === "recette" ? "var(--green)" : "var(--red)"}">
                ${f.type === "recette" ? "↑" : "↓"}
              </div>
              <div>
                <div style="font-size:12px">${f.description}</div>
                <div style="font-size:10px;color:var(--ink-muted)">${formatDate(f.date)} · ${f.categorie}</div>
              </div>
            </div>
            <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${f.type === "recette" ? "var(--green)" : "var(--red)"}">
              ${f.type === "recette" ? "+" : "−"}${formatMoney(f.montant)}
            </div>
          </div>
        `,
              )
              .join("")
      }
    </div>
  `;
}

// === SETTINGS MODAL ===
function openSettings() {
  const s = DB.getSettings();
  openModal(`
    <div class="modal-title">PARAMÈTRES</div>
    <div class="section-title">Studio</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nom du studio</label>
        <input class="form-input" id="set-nom" value="${s.studioNom || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Téléphone</label>
        <input class="form-input" id="set-tel" value="${s.studioTel || ""}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Adresse</label>
        <input class="form-input" id="set-adresse" value="${s.studioAdresse || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="set-email" value="${s.studioEmail || ""}">
      </div>
    </div>
    <div class="section-title" style="margin-top:8px">Artiste</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nom complet</label>
        <input class="form-input" id="set-artiste" value="${s.artisteNom || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Initiales (avatar)</label>
        <input class="form-input" id="set-initiales" value="${s.artisteInitiales || ""}" maxlength="3">
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveSettings()">SAUVEGARDER</button>
    </div>
  `);
}

async function saveSettings() {
  await DB.updateSettings({
    studioNom: document.getElementById("set-nom").value.trim(),
    studioTel: document.getElementById("set-tel").value.trim(),
    studioAdresse: document.getElementById("set-adresse").value.trim(),
    studioEmail: document.getElementById("set-email").value.trim(),
    artisteNom: document.getElementById("set-artiste").value.trim(),
    artisteInitiales: document
      .getElementById("set-initiales")
      .value.trim()
      .toUpperCase(),
  });
  closeModal();
  updateSidebarArtist();
  toast("Paramètres sauvegardés", "success");
}
