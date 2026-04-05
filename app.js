// === APP.JS — Router & Helpers v1.0 ===

function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelector(`[data-page="${page}"]`).classList.add("active");
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

// === MODAL ===
let _modalStack = [];

function openModal(html, wide = false) {
  document.getElementById("modal-content").innerHTML = html;
  const box = document.getElementById("modal-box");
  box.className = "modal-box" + (wide ? " modal-box-wide" : "");
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal-content").innerHTML = "";
}

document
  .getElementById("modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

// === NAV ===
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.page));
});

// === TOAST ===
function toast(msg, type = "info", duration = 3000) {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "◈";
  t.innerHTML = `<span style="color:${type === "success" ? "var(--green)" : type === "error" ? "var(--red)" : "var(--accent)"}">${icon}</span> ${msg}`;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => {
    t.style.animation = "toastOut 0.2s ease forwards";
    setTimeout(() => t.remove(), 200);
  }, duration);
}

// === HELPERS ===
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(
    iso + (iso.length === 10 ? "T12:00:00" : ""),
  ).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLong(iso) {
  if (!iso) return "—";
  return new Date(
    iso + (iso.length === 10 ? "T12:00:00" : ""),
  ).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

function formatMoney(n) {
  return (n || 0).toFixed(2).replace(".", ",") + " €";
}

function initials(nom, prenom) {
  return (
    ((prenom || "")[0] || "").toUpperCase() +
    ((nom || "")[0] || "").toUpperCase()
  );
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
  return map[statut] || `<span class="badge badge-gray">${statut}</span>`;
}

function lotBadge(lotId) {
  if (!lotId) return "";
  const lot = DB.getLot(lotId);
  if (!lot) return "";
  return `<span class="lot-tag" onclick="openLotDetail(${lot.id})" title="Voir le lot">◉ ${lot.numeroLot}</span>`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr + "T12:00:00") - new Date();
  return Math.ceil(diff / 86400000);
}

function updateSidebarArtist() {
  const s = DB.getSettings();
  if (s.artisteInitiales)
    document.getElementById("sidebar-avatar").textContent = s.artisteInitiales;
  if (s.artisteNom)
    document.getElementById("sidebar-name").textContent = s.artisteNom;
}

// === KEYBOARD ===
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
