// === APP ROUTER ===

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
  return map[statut] || statut;
}

// NB : data.js appelle renderDashboard() lui-même une fois les données chargées.
// Ce fichier n'a donc pas besoin de DOMContentLoaded ici.

// --- EXPORT UTILITIES ---
function exportToJSON() {
  const data = {
    version: "1.1",
    exportDate: new Date().toISOString(),
    clients: DB.getClients(),
    rdvs: DB.getRdvs(),
    stocks: DB.getStocks(),
    contrats: DB.getContrats(),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planink-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportClientsCSV() {
  const clients = DB.getClients();
  const headers = ["Nom", "Prénom", "Email", "Téléphone", "Allergies"];
  const rows = clients.map((c) => [
    c.nom,
    c.prenom,
    c.email,
    c.tel,
    c.allergies,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((cell) => `"${cell || ""}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planink-clients-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- STATS DASHBOARD ---
function getStats() {
  const clients = DB.getClients();
  const rdvs = DB.getRdvs();
  const stocks = DB.getStocks();
  const contrats = DB.getContrats();

  const today = new Date().toISOString().split("T")[0];
  const rdvsToday = rdvs.filter((r) => r.date === today).length;
  const rdvsThisMonth = rdvs.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const stockAlerts = stocks.filter((s) => s.quantite <= s.seuil).length;
  const contratsSigned = contrats.filter((c) => c.signe).length;

  return {
    clientsTotal: clients.length,
    rdvsToday,
    rdvsThisMonth,
    stockAlerts,
    contratsSigned,
    contratsTotal: contrats.length,
    stockValue: stocks.reduce((sum, s) => sum + s.quantite * s.prix, 0),
  };
}
