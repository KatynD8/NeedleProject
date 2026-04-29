// === APP ROUTER — v1.2 ===

// ── Sécurité : échappement HTML ──────────────────────────────────────────────
// À utiliser sur TOUT champ libre avant injection dans innerHTML.
// Couvre les 5 caractères dangereux HTML sans regex complexe.
function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Router ───────────────────────────────────────────────────────────────────

function navigate(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelector(`[data-page="${page}"]`).classList.add("active");
  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case "dashboard": renderDashboard(); break;
    case "clients":   renderClients();   break;
    case "agenda":    renderAgenda();    break;
    case "stocks":    renderStocks();    break;
    case "contrats":  renderContrats();  break;
    case "finances":  renderFinances();  break;
    case "settings":  renderSettings();  break;
  }
}

// ── Modal ────────────────────────────────────────────────────────────────────

function openModal(html) {
  document.getElementById("modal-content").innerHTML = html;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal-content").innerHTML = "";
}

document.getElementById("modal-overlay").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// ── Nav listeners ────────────────────────────────────────────────────────────

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.page));
});

// ── Toast ────────────────────────────────────────────────────────────────────

function toast(message, type = "success") {
  const existing = document.getElementById("toast-notification");
  if (existing) existing.remove();

  const colors = {
    success: { bg: "var(--green)", text: "#fff" },
    error:   { bg: "var(--red)",   text: "#fff" },
    info:    { bg: "var(--accent)", text: "#0a0a0b" },
  };
  const { bg, text } = colors[type] || colors.success;

  const el = document.createElement("div");
  el.id = "toast-notification";
  el.textContent = message;
  Object.assign(el.style, {
    position: "fixed", bottom: "28px", right: "28px",
    background: bg, color: text,
    padding: "12px 20px", borderRadius: "var(--radius)",
    fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "1px",
    zIndex: "9999", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    opacity: "0", transform: "translateY(8px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }));
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function initials(nom, prenom) {
  return ((prenom || "")[0] || "") + ((nom || "")[0] || "");
}

function clientName(clientId) {
  const c = DB.getClient(clientId);
  return c ? `${c.prenom} ${c.nom}` : "Inconnu";
}

function statutBadge(statut) {
  const map = {
    confirme: '<span class="badge badge-green">CONFIRMÉ</span>',
    attente:  '<span class="badge badge-yellow">EN ATTENTE</span>',
    annule:   '<span class="badge badge-red">ANNULÉ</span>',
    termine:  '<span class="badge badge-blue">TERMINÉ</span>',
  };
  return map[statut] || statut;
}

// ── Recherche globale Ctrl+K ──────────────────────────────────────────────────
// Recherche cross-modules en temps réel : clients, RDVs, contrats.
// Résultat cliquable → navigation directe vers le module concerné.

function _buildSearchOverlay() {
  if (document.getElementById("search-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "search-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0",
    background: "rgba(0,0,0,0.7)",
    zIndex: "10000",
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "80px",
  });

  overlay.innerHTML = `
    <div style="
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 600px;
      max-height: 520px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    ">
      <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border)">
        <span style="font-size:16px;color:var(--ink-muted)">⌕</span>
        <input id="search-input" type="text" placeholder="Rechercher un client, RDV, contrat..."
          style="flex:1;background:transparent;border:none;outline:none;color:var(--ink);font-size:14px;font-family:var(--font-sans)">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-faint);
          border:1px solid var(--border);border-radius:4px;padding:2px 6px">ESC</span>
      </div>
      <div id="search-results" style="overflow-y:auto;flex:1;padding:8px 0"></div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });

  document.body.appendChild(overlay);

  document.getElementById("search-input").addEventListener("input", (e) => {
    _runSearch(e.target.value.trim());
  });
}

function openSearch() {
  _buildSearchOverlay();
  const overlay = document.getElementById("search-overlay");
  overlay.style.display = "flex";
  const input = document.getElementById("search-input");
  input.value = "";
  document.getElementById("search-results").innerHTML = `
    <div style="padding:24px;text-align:center;color:var(--ink-muted);font-size:12px;font-family:var(--font-mono)">
      TAPEZ POUR RECHERCHER
    </div>
  `;
  setTimeout(() => input.focus(), 50);
}

function closeSearch() {
  const overlay = document.getElementById("search-overlay");
  if (overlay) overlay.style.display = "none";
}

function _runSearch(query) {
  const results = document.getElementById("search-results");
  if (!query || query.length < 2) {
    results.innerHTML = `
      <div style="padding:24px;text-align:center;color:var(--ink-muted);font-size:12px;font-family:var(--font-mono)">
        TAPEZ POUR RECHERCHER
      </div>
    `;
    return;
  }

  const q = query.toLowerCase();
  const hits = [];

  // Clients
  DB.getClients().forEach((c) => {
    const haystack = `${c.prenom} ${c.nom} ${c.email} ${c.tel}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        type: "client", icon: "◉", label: `${c.prenom} ${c.nom}`,
        sub: c.email || c.tel || "",
        action: () => { closeSearch(); navigate("clients"); },
      });
    }
  });

  // RDVs
  DB.getRdvs().forEach((r) => {
    const cn = clientName(r.clientId);
    const haystack = `${r.titre} ${cn} ${r.date} ${r.notes || ""}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        type: "rdv", icon: "◷", label: r.titre,
        sub: `${cn} · ${formatDate(r.date)} ${r.heure}`,
        action: () => {
          closeSearch();
          // Navigue vers le mois du RDV puis ouvre le détail
          const d = new Date(r.date + "T12:00:00");
          agendaYear  = d.getFullYear();
          agendaMonth = d.getMonth();
          navigate("agenda");
          setTimeout(() => openRdvDetail(r.id), 150);
        },
      });
    }
  });

  // Contrats
  DB.getContrats().forEach((ct) => {
    const haystack = `${ct.clientNom} ${ct.description} ${ct.zone} ${ct.date}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        type: "contrat", icon: "◪", label: ct.description || ct.clientNom,
        sub: `${ct.clientNom} · ${formatDate(ct.date)}`,
        action: () => {
          closeSearch();
          navigate("contrats");
          setTimeout(() => previewContrat(ct.id), 150);
        },
      });
    }
  });

  if (hits.length === 0) {
    results.innerHTML = `
      <div style="padding:24px;text-align:center;color:var(--ink-muted);font-size:12px;font-family:var(--font-mono)">
        AUCUN RÉSULTAT POUR "${escapeHTML(query.toUpperCase())}"
      </div>
    `;
    return;
  }

  // Badges de type
  const typeMeta = {
    client:  { label: "CLIENT",  color: "var(--accent)" },
    rdv:     { label: "RDV",     color: "#2ecc71" },
    contrat: { label: "CONTRAT", color: "#3498db" },
  };

  results.innerHTML = hits.slice(0, 12).map((h, i) => {
    const meta = typeMeta[h.type];
    return `
      <div data-hit="${i}" style="
        display:flex;align-items:center;gap:12px;
        padding:11px 20px;cursor:pointer;
        border-bottom:1px solid var(--border);
        transition:background 0.1s;
      " onmouseenter="this.style.background='var(--bg-hover)'"
         onmouseleave="this.style.background='transparent'"
         onclick="window._searchHits[${i}].action()">
        <span style="font-size:14px;color:${meta.color};flex-shrink:0">${h.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHTML(h.label)}
          </div>
          <div style="font-size:11px;color:var(--ink-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHTML(h.sub)}
          </div>
        </div>
        <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:1px;
          color:${meta.color};opacity:0.7;flex-shrink:0">${meta.label}</span>
      </div>
    `;
  }).join("");

  // Stocke les callbacks pour les onclick
  window._searchHits = hits;

  if (hits.length > 12) {
    results.insertAdjacentHTML("beforeend", `
      <div style="padding:10px 20px;text-align:center;font-size:11px;color:var(--ink-muted);font-family:var(--font-mono)">
        +${hits.length - 12} résultats — affinez la recherche
      </div>
    `);
  }
}

// ── Raccourcis clavier ────────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  // Ctrl+K ou Cmd+K — ouvre la recherche
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const overlay = document.getElementById("search-overlay");
    if (overlay && overlay.style.display === "flex") {
      closeSearch();
    } else {
      openSearch();
    }
    return;
  }

  // Échap — ferme la recherche ou le modal
  if (e.key === "Escape") {
    const overlay = document.getElementById("search-overlay");
    if (overlay && overlay.style.display === "flex") {
      closeSearch();
    } else {
      closeModal();
    }
  }
});

// NB : data.js appelle renderDashboard() lui-même une fois les données chargées.