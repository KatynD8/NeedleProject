// === APP ROUTER — v1.1 ===

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

// --- TOAST ---
function toast(message, type = "success") {
  // Supprime un toast existant
  const existing = document.getElementById("toast-notification");
  if (existing) existing.remove();

  const colors = {
    success: { bg: "var(--green)", text: "#fff" },
    error: { bg: "var(--red)", text: "#fff" },
    info: { bg: "var(--accent)", text: "#0a0a0b" },
  };
  const { bg, text } = colors[type] || colors.success;

  const el = document.createElement("div");
  el.id = "toast-notification";
  el.textContent = message;
  Object.assign(el.style, {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: bg,
    color: text,
    padding: "12px 20px",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "1px",
    zIndex: "9999",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  });

  document.body.appendChild(el);

  // Apparition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  });

  // Disparition après 2.8s
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

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
