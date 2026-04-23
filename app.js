// === APP ROUTER ===

function navigate(page) {
  const pageEl = document.getElementById("page-" + page);
  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (!pageEl || !navEl) return;
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  pageEl.classList.add("active");
  navEl.classList.add("active");
  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case "dashboard":
      renderDashboard();
      break;
    case "clients":
      renderClients();
      break;
    case "agenda":
      renderAgenda();
      break;
    case "stocks":
      renderStocks();
      break;
    case "contrats":
      renderContrats();
      break;
    case "finances":
      renderFinances();
      break;
  }
}

// --- MODAL ---
// wide=true → modal plus large pour les fiches détail
function openModal(html, wide = false) {
  document.getElementById("modal-content").innerHTML = html;
  const box = document.getElementById("modal-box");
  box.style.width = wide ? "720px" : "";
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal-content").innerHTML = "";
  document.getElementById("modal-box").style.width = "";
}

document
  .getElementById("modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

// --- NAV LISTENERS ---
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.page));
});

// --- HELPERS ---
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
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
    attente: '<span class="badge badge-yellow">EN ATTENTE</span>',
    annule: '<span class="badge badge-red">ANNULÉ</span>',
    termine: '<span class="badge badge-blue">TERMINÉ</span>',
  };
  return map[statut] || `<span class="badge">${statut}</span>`;
}

// Affiche un badge pour un lot stock (aiguille/encre lié à un RDV)
function lotBadge(lotId) {
  if (!lotId) return "";
  const s = DB.getStocks().find((x) => x.id === lotId);
  if (!s) return "";
  return `<span class="badge badge-gray" style="font-size:9px">${s.nom}</span>`;
}

// --- FORMAT MONEY ---
function formatMoney(val) {
  return (
    (val || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

// --- TOAST NOTIFICATIONS ---
function toast(msg, type = "info") {
  const colors = {
    success: "var(--green)",
    error: "var(--red)",
    info: "var(--accent)",
  };
  const t = document.createElement("div");
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--bg-panel); border:1px solid ${colors[type] || colors.info};
    color:var(--ink); font-family:var(--font-mono); font-size:11px; letter-spacing:1px;
    padding:10px 18px; border-radius:var(--radius);
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation: toastIn 0.2s ease;
    pointer-events:none;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
