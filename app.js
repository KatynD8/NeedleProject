// === APP ROUTER ===

function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add("active");
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
    case "settings":
      renderSettings();
      break;
  }
}

// --- MODAL ---
function openModal(html) {
  document.getElementById("modal-content").innerHTML = html;
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

// --- NAV LISTENERS ---
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.page));
});
document
  .getElementById("btn-settings")
  .addEventListener("click", () => navigate("settings"));

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

function formatMoney(val) {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(val);
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
  return map[statut] || statut;
}

// --- TOAST ---
function toast(msg, type = "info") {
  const colors = {
    success: "var(--green)",
    error: "var(--red)",
    info: "var(--accent)",
  };
  const t = document.createElement("div");
  t.className = "toast";
  t.style.cssText = `border-left:3px solid ${colors[type] || colors.info}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("toast-show"));
  setTimeout(() => {
    t.classList.remove("toast-show");
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// NB : data.js appelle renderDashboard() lui-même une fois les données chargées.
