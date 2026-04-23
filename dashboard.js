// === DASHBOARD ===

function renderDashboard() {
  const clients = DB.getClients();
  const rdvs = DB.getRdvs();
  const stocks = DB.getStocks();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const caMois = DB.getTotalCA
    ? DB.getTotalCA(now.getFullYear(), now.getMonth())
    : 0;

  const rdvsAujourdhui = rdvs.filter((r) => r.date === today);
  const rdvsAVenir = rdvs.filter(
    (r) => r.date > today && r.statut !== "annule",
  );
  const alertsStock = stocks.filter((s) => s.quantite <= s.seuil);

  // Next 5 upcoming rdv
  const prochains = [...rdvs]
    .filter((r) => r.date >= today && r.statut !== "annule")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  document.getElementById("page-dashboard").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">DASHBOARD</div>
        <div class="page-subtitle">BIENVENUE — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Clients</div>
        <div class="stat-value">${clients.length}</div>
        <div class="stat-sub">total enregistrés</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">RDV aujourd'hui</div>
        <div class="stat-value">${rdvsAujourdhui.length}</div>
        <div class="stat-sub">séances planifiées</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">CA ce mois</div>
        <div class="stat-value" style="font-size:28px;color:var(--accent)">${(caMois || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €</div>
        <div class="stat-sub">recettes encaissées</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alertes stock</div>
        <div class="stat-value" style="color:${alertsStock.length > 0 ? "var(--red)" : "var(--green)"}">${alertsStock.length}</div>
        <div class="stat-sub">produits à commander</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Prochains RDV -->
      <div>
        <div class="section-title">Prochains rendez-vous</div>
        <div class="card" style="padding:0">
          ${
            prochains.length === 0
              ? `
            <div class="empty-state">
              <div class="empty-icon">◷</div>
              <div class="empty-text">AUCUN RDV À VENIR</div>
            </div>
          `
              : prochains
                  .map(
                    (r) => `
            <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border)">
              <div style="text-align:center;min-width:48px">
                <div style="font-family:var(--font-display);font-size:22px;color:var(--accent);line-height:1">${new Date(r.date).getDate()}</div>
                <div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-muted);letter-spacing:1px">${new Date(r.date + "T12:00:00").toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}</div>
              </div>
              <div style="flex:1">
                <div style="font-weight:500;font-size:13px">${r.titre}</div>
                <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">${clientName(r.clientId)} · ${r.heure} · ${r.duree}min</div>
              </div>
              ${statutBadge(r.statut)}
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>

      <!-- Alertes stocks -->
      <div>
        <div class="section-title">Alertes stock</div>
        <div class="card" style="padding:0">
          ${
            alertsStock.length === 0
              ? `
            <div class="empty-state">
              <div class="empty-icon">◫</div>
              <div class="empty-text">STOCKS AU VERT</div>
            </div>
          `
              : alertsStock
                  .map(
                    (s) => `
            <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:13px;font-weight:500">${s.nom}</div>
                  <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">${s.categorie}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-family:var(--font-mono);font-size:13px;color:${s.quantite === 0 ? "var(--red)" : "#f39c12"}">${s.quantite} ${s.unite}</div>
                  <div style="font-size:10px;color:var(--ink-muted)">seuil: ${s.seuil}</div>
                </div>
              </div>
              <div class="stock-bar-wrap">
                <div class="stock-bar-track">
                  <div class="stock-bar-fill ${s.quantite === 0 ? "alert" : "warn"}" style="width:${Math.min(100, (s.quantite / s.seuil) * 100)}%"></div>
                </div>
              </div>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>
    </div>
  `;
}
