// === CLIENTS ===
let clientsSearch = "";

function renderClients() {
  const all = DB.getClients();
  const filtered = all.filter((c) =>
    `${c.prenom} ${c.nom} ${c.email}`
      .toLowerCase()
      .includes(clientsSearch.toLowerCase()),
  );

  document.getElementById("page-clients").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">CLIENTS</div>
        <div class="page-subtitle">${all.length} CLIENT${all.length > 1 ? "S" : ""} ENREGISTRÉ${all.length > 1 ? "S" : ""}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Rechercher un client..." id="client-search" value="${clientsSearch}"
            oninput="clientsSearch=this.value;renderClients()">
        </div>
        <button class="btn btn-primary" onclick="openAddClient()">+ AJOUTER</button>
      </div>
    </div>

    ${
      filtered.length === 0
        ? `
      <div class="empty-state">
        <div class="empty-icon">◉</div>
        <div class="empty-text">AUCUN CLIENT TROUVÉ</div>
      </div>
    `
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CLIENT</th>
            <th>CONTACT</th>
            <th>DATE DE NAISSANCE</th>
            <th>ALLERGIES</th>
            <th>RDV</th>
            <th>AJOUTÉ LE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map((c) => {
              const rdvCount = DB.getRdvs().filter(
                (r) => r.clientId === c.id,
              ).length;
              return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:34px;height:34px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--accent-dim);
                    display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;color:var(--accent);flex-shrink:0">
                    ${initials(c.nom, c.prenom)}
                  </div>
                  <div>
                    <div style="font-weight:500">${c.prenom} ${c.nom}</div>
                    ${c.notes ? `<div style="font-size:11px;color:var(--ink-muted)">${c.notes.substring(0, 40)}${c.notes.length > 40 ? "…" : ""}</div>` : ""}
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size:12px">${c.email || "—"}</div>
                <div style="font-size:12px;color:var(--ink-muted)">${c.tel || "—"}</div>
              </td>
              <td><span class="text-mono">${c.dateNaissance ? formatDate(c.dateNaissance) : "—"}</span></td>
              <td>${c.allergies ? `<span class="badge badge-red">${c.allergies}</span>` : '<span style="color:var(--ink-muted)">—</span>'}</td>
              <td><span class="badge badge-gold">${rdvCount} RDV</span></td>
              <td><span class="text-mono text-muted">${formatDate(c.createdAt)}</span></td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="openClientDetail(${c.id})">VOIR</button>
                  <button class="btn btn-ghost btn-sm" onclick="openEditClient(${c.id})">EDIT</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">✕</button>
                </div>
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    `
    }
  `;
}

function openAddClient() {
  openModal(`
    <div class="modal-title">NOUVEAU CLIENT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Prénom</label>
        <input class="form-input" id="c-prenom" placeholder="Jean">
      </div>
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input class="form-input" id="c-nom" placeholder="Dupont">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="c-email" type="email" placeholder="jean@email.fr">
      </div>
      <div class="form-group">
        <label class="form-label">Téléphone</label>
        <input class="form-input" id="c-tel" placeholder="06 00 00 00 00">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de naissance</label>
        <input class="form-input" id="c-dob" type="date">
      </div>
      <div class="form-group">
        <label class="form-label">Allergies connues</label>
        <input class="form-input" id="c-allergies" placeholder="Latex, Nickel...">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="c-notes" placeholder="Style préféré, remarques..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveNewClient()">ENREGISTRER</button>
    </div>
  `);
}

async function saveNewClient() {
  const prenom = document.getElementById("c-prenom").value.trim();
  const nom = document.getElementById("c-nom").value.trim();
  if (!prenom || !nom) {
    alert("Prénom et nom obligatoires.");
    return;
  }
  await DB.addClient({
    prenom,
    nom,
    email: document.getElementById("c-email").value.trim(),
    tel: document.getElementById("c-tel").value.trim(),
    dateNaissance: document.getElementById("c-dob").value,
    allergies: document.getElementById("c-allergies").value.trim(),
    notes: document.getElementById("c-notes").value.trim(),
  });
  closeModal();
  renderClients();
}

function openEditClient(id) {
  const c = DB.getClient(id);
  if (!c) return;
  openModal(`
    <div class="modal-title">MODIFIER CLIENT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Prénom</label>
        <input class="form-input" id="ec-prenom" value="${c.prenom || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input class="form-input" id="ec-nom" value="${c.nom || ""}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="ec-email" type="email" value="${c.email || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Téléphone</label>
        <input class="form-input" id="ec-tel" value="${c.tel || ""}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date de naissance</label>
        <input class="form-input" id="ec-dob" type="date" value="${c.dateNaissance || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Allergies</label>
        <input class="form-input" id="ec-allergies" value="${c.allergies || ""}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="ec-notes">${c.notes || ""}</textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveEditClient(${id})">SAUVEGARDER</button>
    </div>
  `);
}

async function saveEditClient(id) {
  await DB.updateClient(id, {
    prenom: document.getElementById("ec-prenom").value.trim(),
    nom: document.getElementById("ec-nom").value.trim(),
    email: document.getElementById("ec-email").value.trim(),
    tel: document.getElementById("ec-tel").value.trim(),
    dateNaissance: document.getElementById("ec-dob").value,
    allergies: document.getElementById("ec-allergies").value.trim(),
    notes: document.getElementById("ec-notes").value.trim(),
  });
  closeModal();
  renderClients();
}

async function deleteClient(id) {
  if (confirm("Supprimer ce client ? Cette action est irréversible.")) {
    await DB.deleteClient(id);
    renderClients();
  }
}

function openClientDetail(id) {
  const c = DB.getClient(id);
  if (!c) return;
  const rdvs = DB.getRdvs()
    .filter((r) => r.clientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const contrats = DB.getContrats().filter((ct) => ct.clientId === id);

  openModal(`
    <div class="modal-title">${c.prenom} ${c.nom}</div>
    <div class="client-detail-header">
      <div class="client-avatar-lg">${initials(c.nom, c.prenom)}</div>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:500">${c.prenom} ${c.nom}</div>
        <div style="font-size:12px;color:var(--ink-muted);margin-top:4px">${c.email || "—"} · ${c.tel || "—"}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          ${c.allergies ? `<span class="badge badge-red">⚠ ${c.allergies}</span>` : ""}
          <span class="badge badge-gold">${rdvs.length} RDV</span>
          <span class="badge badge-blue">${contrats.length} CONTRAT${contrats.length > 1 ? "S" : ""}</span>
        </div>
      </div>
    </div>
    ${c.notes ? `<div style="padding:12px 14px;background:var(--bg-base);border-radius:var(--radius);border:1px solid var(--border);font-size:12px;color:var(--ink-muted);margin-bottom:16px">${c.notes}</div>` : ""}
    <div class="section-title">Historique des RDV</div>
    ${
      rdvs.length === 0
        ? '<div style="color:var(--ink-muted);font-size:12px;margin-bottom:16px">Aucun rendez-vous</div>'
        : `
      <div style="margin-bottom:16px">
        ${rdvs
          .map(
            (r) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:13px">${r.titre}</div>
              <div style="font-size:11px;color:var(--ink-muted)">${formatDate(r.date)} à ${r.heure} · ${r.duree}min</div>
            </div>
            ${statutBadge(r.statut)}
          </div>
        `,
          )
          .join("")}
      </div>
    `
    }
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-primary" onclick="closeModal();openAddRdvForClient(${id})">+ RDV</button>
    </div>
  `);
}
