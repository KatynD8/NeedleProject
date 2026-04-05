// === AGENDA ===
let agendaYear = new Date().getFullYear();
let agendaMonth = new Date().getMonth();

// CRUCIAL : toISO en heure locale, pas UTC
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function renderAgenda() {
  const rdvs = DB.getRdvs();
  const today = new Date();
  const todayStr = toISO(today);
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

  const monthRdvs = rdvs.filter((r) => {
    const d = new Date(r.date + "T12:00:00");
    return d.getFullYear() === agendaYear && d.getMonth() === agendaMonth;
  });
  const monthCA = monthRdvs
    .filter((r) => r.statut === "termine")
    .reduce((s, r) => s + (r.tarif || 0), 0);

  document.getElementById("page-agenda").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">AGENDA</div>
        <div class="page-subtitle">${monthNames[agendaMonth].toUpperCase()} ${agendaYear} · ${monthRdvs.length} RDV · ${formatMoney(monthCA)} facturé</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-ghost" onclick="prevMonth()">◂ PRÉC.</button>
        <button class="btn btn-ghost" onclick="goToday()">AUJOURD'HUI</button>
        <button class="btn btn-ghost" onclick="nextMonth()">SUIV. ▸</button>
        <button class="btn btn-primary" onclick="openAddRdv()">+ NOUVEAU RDV</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 270px;gap:18px">
      <div>
        <div class="agenda-grid" style="margin-bottom:3px">
          ${dayNames.map((d) => `<div class="agenda-day-header">${d}</div>`).join("")}
        </div>
        <div class="agenda-grid">
          ${days
            .map(({ date, current }) => {
              const iso = toISO(date);
              const isToday = iso === todayStr;
              const dayRdvs = rdvs.filter((r) => r.date === iso);
              return `
              <div class="agenda-day ${isToday ? "today" : ""} ${!current ? "other-month" : ""}"
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
                ${dayRdvs.length > 3 ? `<div style="font-size:8px;color:var(--ink-muted);font-family:var(--font-mono)">+${dayRdvs.length - 3}</div>` : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>

      <div>
        <div class="section-title">Prochains RDV</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          ${
            upcoming.length === 0
              ? `<div class="empty-state"><div class="empty-icon">◷</div><div class="empty-text">AUCUN RDV</div></div>`
              : upcoming
                  .map(
                    (r) => `
              <div class="card" style="padding:11px;cursor:pointer" onclick="openRdvDetail(${r.id})">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div style="flex:1;min-width:0">
                    <div style="font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px">${r.titre}</div>
                    <div style="font-size:10px;color:var(--ink-muted)">${clientName(r.clientId)}</div>
                    <div style="font-size:10px;color:var(--accent);font-family:var(--font-mono);margin-top:3px">${formatDate(r.date)} · ${r.heure}</div>
                    ${r.tarif ? `<div style="font-size:10px;color:var(--ink-muted)">${formatMoney(r.tarif)}</div>` : ""}
                  </div>
                  <div style="text-align:right;flex-shrink:0;margin-left:8px">
                    <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted)">${r.duree}min</div>
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

function prevMonth() {
  agendaMonth--;
  if (agendaMonth < 0) {
    agendaMonth = 11;
    agendaYear--;
  }
  renderAgenda();
}
function nextMonth() {
  agendaMonth++;
  if (agendaMonth > 11) {
    agendaMonth = 0;
    agendaYear++;
  }
  renderAgenda();
}
function goToday() {
  agendaMonth = new Date().getMonth();
  agendaYear = new Date().getFullYear();
  renderAgenda();
}

function openAddRdvForClient(clientId) {
  navigate("agenda");
  setTimeout(() => openAddRdv(clientId), 100);
}

function openAddRdv(presetClientId) {
  const clients = DB.getClients();
  const lots = DB.getActiveLots();
  const lotOptions = (cat) =>
    lots
      .filter((l) => l.categorie === cat)
      .map(
        (l) => `
    <option value="${l.id}">${l.nom} — lot ${l.numeroLot} (${l.quantiteRestante} ${l.unite})</option>
  `,
      )
      .join("");

  openModal(
    `
    <div class="modal-title">NOUVEAU RENDEZ-VOUS</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client *</label>
        <select class="form-select" id="rdv-client">
          <option value="">Sélectionner...</option>
          ${clients.map((c) => `<option value="${c.id}" ${c.id == presetClientId ? "selected" : ""}>${c.prenom} ${c.nom}${c.allergies ? " ⚠" : ""}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tarif (€)</label>
        <input class="form-input" id="rdv-tarif" type="number" step="10" value="0" min="0">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Titre / Description *</label>
      <input class="form-input" id="rdv-titre" placeholder="Dragon avant-bras, Rose géométrique...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="rdv-date" type="date" value="${toISO(new Date())}">
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

    <div class="section-title" style="margin-top:4px">Traçabilité (optionnel)</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">🪡 Lot aiguilles utilisé</label>
        <select class="form-select" id="rdv-lot-aiguille">
          <option value="">— Aucun sélectionné</option>
          ${lotOptions("Aiguilles")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">🎨 Lot(s) encres utilisé(s)</label>
        <select class="form-select" id="rdv-lot-encre" multiple style="height:70px">
          ${lotOptions("Encres")}
        </select>
      </div>
    </div>
    <div class="info-box" style="margin-bottom:12px">
      <span class="info-box-icon">◈</span>
      <span>Sélectionner les lots permet de tracer quels matériaux ont été utilisés pour chaque client. Maintenir Ctrl/Cmd pour sélection multiple d'encres.</span>
    </div>

    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="rdv-notes" placeholder="Références, détails..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewRdv()">ENREGISTRER</button>
    </div>
  `,
    true,
  );
}

async function saveNewRdv() {
  const clientId = parseInt(document.getElementById("rdv-client").value);
  const titre = document.getElementById("rdv-titre").value.trim();
  if (!clientId || !titre) {
    toast("Client et titre obligatoires", "error");
    return;
  }

  const selEncres = Array.from(
    document.getElementById("rdv-lot-encre").selectedOptions,
  ).map((o) => parseInt(o.value));
  const lotAig =
    parseInt(document.getElementById("rdv-lot-aiguille").value) || null;

  await DB.addRdv({
    clientId,
    titre,
    date: document.getElementById("rdv-date").value,
    heure: document.getElementById("rdv-heure").value,
    duree: parseInt(document.getElementById("rdv-duree").value),
    statut: document.getElementById("rdv-statut").value,
    tarif: parseFloat(document.getElementById("rdv-tarif").value) || 0,
    notes: document.getElementById("rdv-notes").value.trim(),
    lotAiguille: lotAig,
    lotEncre: selEncres.length > 0 ? selEncres : [],
  });

  closeModal();
  renderAgenda();
  renderDashboard();
  toast("RDV ajouté", "success");
}

function openDayDetail(iso) {
  const rdvs = DB.getRdvs()
    .filter((r) => r.date === iso)
    .sort((a, b) => a.heure.localeCompare(b.heure));
  // Construire le label sans passer par new Date(iso) pour éviter le décalage UTC
  const [y, m, d] = iso.split("-").map(Number);
  const dateLocale = new Date(y, m - 1, d);
  const label = dateLocale.toLocaleDateString("fr-FR", {
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
      <div style="text-align:center;margin-top:14px">
        <button class="btn btn-primary" onclick="closeModal();openAddRdv()">+ AJOUTER UN RDV</button>
      </div>
    `
        : rdvs
            .map(
              (r) => `
      <div style="padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:500;font-size:13px;margin-bottom:3px">${r.titre}</div>
            <div style="font-size:11px;color:var(--ink-muted)">${clientName(r.clientId)}</div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-top:3px">${r.heure} · ${r.duree}min${r.tarif ? " · " + formatMoney(r.tarif) : ""}</div>
            ${
              r.lotAiguille || (r.lotEncre && r.lotEncre.length > 0)
                ? `
              <div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">
                ${r.lotAiguille ? `<span style="font-size:10px;color:var(--ink-muted)">🪡</span> ${lotBadge(r.lotAiguille)}` : ""}
                ${(r.lotEncre || []).map((id) => `<span style="font-size:10px;color:var(--ink-muted)">🎨</span> ${lotBadge(id)}`).join("")}
              </div>`
                : ""
            }
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            ${statutBadge(r.statut)}
            <div style="display:flex;gap:5px">
              <button class="btn btn-ghost btn-sm" onclick="closeModal();openEditRdv(${r.id})">EDIT</button>
              <button class="btn btn-danger btn-sm" onclick="deleteRdvFromDay(${r.id},'${iso}')">✕</button>
            </div>
          </div>
        </div>
        ${r.notes ? `<div style="margin-top:8px;font-size:11px;color:var(--ink-muted);font-style:italic;border-top:1px solid var(--border);padding-top:6px">${r.notes}</div>` : ""}
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

async function deleteRdvFromDay(id, iso) {
  if (!confirm("Supprimer ce RDV ?")) return;
  await DB.deleteRdv(id);
  closeModal();
  renderAgenda();
  toast("RDV supprimé", "info");
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
  const lots = DB.getLots();

  openModal(
    `
    <div class="modal-title">MODIFIER RDV</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="erdv-client">
          ${clients.map((c) => `<option value="${c.id}" ${c.id === r.clientId ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tarif (€)</label>
        <input class="form-input" id="erdv-tarif" type="number" step="10" value="${r.tarif || 0}">
      </div>
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
    <div class="section-title" style="margin-top:4px">Traçabilité lots</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Lot aiguilles</label>
        <select class="form-select" id="erdv-lot-aiguille">
          <option value="">— Aucun</option>
          ${lots
            .filter((l) => l.categorie === "Aiguilles")
            .map(
              (l) => `
            <option value="${l.id}" ${r.lotAiguille === l.id ? "selected" : ""}>${l.nom} — ${l.numeroLot}</option>
          `,
            )
            .join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Lots encres</label>
        <select class="form-select" id="erdv-lot-encre" multiple style="height:70px">
          ${lots
            .filter((l) => l.categorie === "Encres")
            .map(
              (l) => `
            <option value="${l.id}" ${(r.lotEncre || []).includes(l.id) ? "selected" : ""}>${l.nom} — ${l.numeroLot}</option>
          `,
            )
            .join("")}
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
  `,
    true,
  );
}

async function saveEditRdv(id) {
  const selEncres = Array.from(
    document.getElementById("erdv-lot-encre").selectedOptions,
  ).map((o) => parseInt(o.value));
  const lotAig =
    parseInt(document.getElementById("erdv-lot-aiguille").value) || null;
  await DB.updateRdv(id, {
    clientId: parseInt(document.getElementById("erdv-client").value),
    titre: document.getElementById("erdv-titre").value.trim(),
    date: document.getElementById("erdv-date").value,
    heure: document.getElementById("erdv-heure").value,
    duree: parseInt(document.getElementById("erdv-duree").value),
    statut: document.getElementById("erdv-statut").value,
    tarif: parseFloat(document.getElementById("erdv-tarif").value) || 0,
    notes: document.getElementById("erdv-notes").value.trim(),
    lotAiguille: lotAig,
    lotEncre: selEncres.length > 0 ? selEncres : [],
  });
  closeModal();
  renderAgenda();
  toast("RDV mis à jour", "success");
}
