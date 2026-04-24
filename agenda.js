// === AGENDA ===
let agendaYear = new Date().getFullYear();
let agendaMonth = new Date().getMonth();

function renderAgenda() {
  const rdvs = DB.getRdvs();
  const today = new Date();
  const monthNames = [
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
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const firstDay = new Date(agendaYear, agendaMonth, 1);
  const lastDay = new Date(agendaYear, agendaMonth + 1, 0);
  let startOffset = (firstDay.getDay() + 6) % 7;

  const days = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(agendaYear, agendaMonth, -i), current: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(agendaYear, agendaMonth, d), current: true });
  }
  let fill = 7 - (days.length % 7);
  if (fill === 7) fill = 0;
  for (let d = 1; d <= fill; d++) {
    days.push({
      date: new Date(agendaYear, agendaMonth + 1, d),
      current: false,
    });
  }

  const upcoming = rdvs
    .filter((r) => r.date >= todayStr && r.statut !== "annule")
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure),
    )
    .slice(0, 8);

  document.getElementById("page-agenda").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">AGENDA</div>
        <div class="page-subtitle">${monthNames[agendaMonth].toUpperCase()} ${agendaYear}</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn btn-ghost" onclick="agendaMonth--;if(agendaMonth<0){agendaMonth=11;agendaYear--;}renderAgenda()">◂ PRÉC.</button>
        <button class="btn btn-ghost" onclick="agendaMonth=new Date().getMonth();agendaYear=new Date().getFullYear();renderAgenda()">AUJOURD'HUI</button>
        <button class="btn btn-ghost" onclick="agendaMonth++;if(agendaMonth>11){agendaMonth=0;agendaYear++;}renderAgenda()">SUIV. ▸</button>
        <button class="btn btn-primary" onclick="openAddRdv()">+ NOUVEAU RDV</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:20px">
      <div>
        <div class="agenda-grid" style="margin-bottom:4px">
          ${dayNames.map((d) => `<div class="agenda-day-header">${d}</div>`).join("")}
        </div>
        <div class="agenda-grid">
          ${days
            .map(({ date, current }) => {
              const iso = toISO(date);
              const dayRdvs = rdvs.filter((r) => r.date === iso);
              return `
              <div class="agenda-day ${isToday(date) ? "today" : ""} ${!current ? "other-month" : ""}"
                   onclick="openDayDetail('${iso}')">
                <div class="agenda-day-num">${date.getDate()}</div>
                ${dayRdvs
                  .slice(0, 3)
                  .map(
                    (r) => `
                  <div class="rdv-chip" title="${r.titre} — ${clientName(r.clientId)}">${r.heure} ${r.titre}</div>
                `,
                  )
                  .join("")}
                ${dayRdvs.length > 3 ? `<div style="font-size:9px;color:var(--ink-muted);font-family:var(--font-mono)">+${dayRdvs.length - 3} autres</div>` : ""}
              </div>
            `;
            })
            .join("")}
        </div>
      </div>

      <div>
        <div class="section-title">Prochains RDV</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${
            upcoming.length === 0
              ? `<div class="empty-state"><div class="empty-icon">◷</div><div class="empty-text">AUCUN RDV</div></div>`
              : upcoming
                  .map(
                    (r) => `
            <div class="card" style="padding:12px;cursor:pointer" onclick="openRdvDetail(${r.id})">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-size:12px;font-weight:500;margin-bottom:4px">${r.titre}</div>
                  <div style="font-size:11px;color:var(--ink-muted)">${clientName(r.clientId)}</div>
                  <div style="font-size:11px;color:var(--accent);font-family:var(--font-mono);margin-top:4px">${formatDate(r.date)} · ${r.heure}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-muted)">${r.duree}min</div>
                  <div style="margin-top:4px">${statutBadge(r.statut)}</div>
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

function openAddRdvForClient(clientId) {
  navigate("agenda");
  setTimeout(() => openAddRdv(clientId), 100);
}

function openAddRdv(presetClientId) {
  const clients = DB.getClients();
  openModal(`
    <div class="modal-title">NOUVEAU RENDEZ-VOUS</div>
    <div class="form-group">
      <label class="form-label">Client</label>
      <select class="form-select" id="rdv-client">
        <option value="">Sélectionner...</option>
        ${clients.map((c) => `<option value="${c.id}" ${c.id == presetClientId ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Titre / Description</label>
      <input class="form-input" id="rdv-titre" placeholder="Dragon avant-bras, Rose géométrique...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="rdv-date" type="date" value="${new Date().toISOString().split("T")[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Heure</label>
        <input class="form-input" id="rdv-heure" type="time" value="10:00">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Durée (min)</label>
        <input class="form-input" id="rdv-duree" type="number" value="120" min="15" step="15">
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-select" id="rdv-statut">
          <option value="confirme">Confirmé</option>
          <option value="attente">En attente</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="rdv-notes" placeholder="Références, détails..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewRdv()">ENREGISTRER</button>
    </div>
  `);
}

async function saveNewRdv() {
  const clientId = parseInt(document.getElementById("rdv-client").value);
  const titre = document.getElementById("rdv-titre").value.trim();
  if (!clientId || !titre) {
    alert("Client et titre obligatoires.");
    return;
  }
  await DB.addRdv({
    clientId,
    titre,
    date: document.getElementById("rdv-date").value,
    heure: document.getElementById("rdv-heure").value,
    duree: parseInt(document.getElementById("rdv-duree").value),
    statut: document.getElementById("rdv-statut").value,
    notes: document.getElementById("rdv-notes").value.trim(),
  });
  closeModal();
  renderAgenda();
  renderDashboard();
}

function openDayDetail(iso) {
  const rdvs = DB.getRdvs()
    .filter((r) => r.date === iso)
    .sort((a, b) => a.heure.localeCompare(b.heure));
  const label = new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  openModal(`
    <div class="modal-title">${label.toUpperCase()}</div>
    ${
      rdvs.length === 0
        ? `
      <div class="empty-state">
        <div class="empty-icon">◷</div>
        <div class="empty-text">AUCUN RDV CE JOUR</div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-primary" onclick="closeModal();openAddRdv()">+ AJOUTER UN RDV</button>
      </div>
    `
        : rdvs
            .map(
              (r) => `
      <div style="padding:14px;background:var(--bg-base);border-radius:var(--radius);border:1px solid var(--border);margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:500;font-size:14px;margin-bottom:4px">${r.titre}</div>
            <div style="font-size:12px;color:var(--ink-muted)">${clientName(r.clientId)}</div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-top:4px">${r.heure} · ${r.duree}min</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            ${statutBadge(r.statut)}
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" onclick="closeModal();openEditRdv(${r.id})">EDIT</button>
              <button class="btn btn-danger btn-sm" onclick="deleteRdvFromDay(${r.id},'${iso}')">✕</button>
            </div>
          </div>
        </div>
        ${r.notes ? `<div style="margin-top:8px;font-size:11px;color:var(--ink-muted);font-style:italic">${r.notes}</div>` : ""}
      </div>
    `,
            )
            .join("")
    }
    <div style="text-align:right;margin-top:8px">
      <button class="btn btn-primary" onclick="closeModal();openAddRdv()">+ AJOUTER</button>
    </div>
  `);
}

async function deleteRdv(id, iso) {
  if (confirm("Supprimer ce RDV ?")) {
    await DB.deleteRdv(id);
    closeModal();
    renderAgenda();
  }
}

function openRdvDetail(id) {
  const r = DB.getRdvs().find((x) => x.id === id);
  if (!r) return;
  openDayDetail(r.date);
}

function openEditRdv(id) {
  const r = DB.getRdvs().find((x) => x.id === id);
  if (!r) return;
  const clients = DB.getClients();
  openModal(`
    <div class="modal-title">MODIFIER RDV</div>
    <div class="form-group">
      <label class="form-label">Client</label>
      <select class="form-select" id="erdv-client">
        ${clients.map((c) => `<option value="${c.id}" ${c.id === r.clientId ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Titre</label>
      <input class="form-input" id="erdv-titre" value="${r.titre}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="erdv-date" type="date" value="${r.date}">
      </div>
      <div class="form-group">
        <label class="form-label">Heure</label>
        <input class="form-input" id="erdv-heure" type="time" value="${r.heure}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Durée (min)</label>
        <input class="form-input" id="erdv-duree" type="number" value="${r.duree}" step="15">
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-select" id="erdv-statut">
          <option value="confirme" ${r.statut === "confirme" ? "selected" : ""}>Confirmé</option>
          <option value="attente"  ${r.statut === "attente" ? "selected" : ""}>En attente</option>
          <option value="termine"  ${r.statut === "termine" ? "selected" : ""}>Terminé</option>
          <option value="annule"   ${r.statut === "annule" ? "selected" : ""}>Annulé</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="erdv-notes">${r.notes || ""}</textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveEditRdv(${id})">SAUVEGARDER</button>
    </div>
  `);
}

async function saveEditRdv(id) {
  await DB.updateRdv(id, {
    clientId: parseInt(document.getElementById("erdv-client").value),
    titre: document.getElementById("erdv-titre").value.trim(),
    date: document.getElementById("erdv-date").value,
    heure: document.getElementById("erdv-heure").value,
    duree: parseInt(document.getElementById("erdv-duree").value),
    statut: document.getElementById("erdv-statut").value,
    notes: document.getElementById("erdv-notes").value.trim(),
  });
  closeModal();
  renderAgenda();
  toast("RDV mis à jour", "success");
}
