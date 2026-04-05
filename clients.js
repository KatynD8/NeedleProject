// === CLIENTS ===
let clientsSearch = "";
let clientsSort = "nom";

function renderClients() {
  const all = DB.getClients();
  let filtered = all.filter((c) =>
    `${c.prenom} ${c.nom} ${c.email} ${c.tel}`
      .toLowerCase()
      .includes(clientsSearch.toLowerCase()),
  );

  if (clientsSort === "nom")
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  else if (clientsSort === "recent")
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (clientsSort === "rdv")
    filtered.sort(
      (a, b) =>
        DB.getRdvsForClient(b.id).length - DB.getRdvsForClient(a.id).length,
    );

  document.getElementById("page-clients").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">CLIENTS</div>
        <div class="page-subtitle">${all.length} CLIENT${all.length > 1 ? "S" : ""} ENREGISTRÉ${all.length > 1 ? "S" : ""}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input type="text" placeholder="Rechercher..." id="client-search" value="${clientsSearch}"
            oninput="clientsSearch=this.value;renderClients()">
        </div>
        <select class="form-select" style="width:140px" onchange="clientsSort=this.value;renderClients()">
          <option value="nom" ${clientsSort === "nom" ? "selected" : ""}>Tri : Nom</option>
          <option value="recent" ${clientsSort === "recent" ? "selected" : ""}>Tri : Récent</option>
          <option value="rdv" ${clientsSort === "rdv" ? "selected" : ""}>Tri : RDV</option>
        </select>
        <button class="btn btn-primary" onclick="openAddClient()">+ NOUVEAU</button>
      </div>
    </div>

    ${
      filtered.length === 0
        ? `
      <div class="empty-state"><div class="empty-icon">◉</div><div class="empty-text">AUCUN CLIENT TROUVÉ</div></div>
    `
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CLIENT</th><th>CONTACT</th><th>NAISSANCE</th><th>ALLERGIES</th><th>RDV</th><th>CONTRATS</th><th>AJOUTÉ LE</th><th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map((c) => {
              const rdvCount = DB.getRdvsForClient(c.id).length;
              const ctCount = DB.getContratsForClient(c.id).length;
              const nextRdv = DB.getRdvsForClient(c.id)
                .filter(
                  (r) =>
                    r.date >= new Date().toISOString().split("T")[0] &&
                    r.statut !== "annule",
                )
                .sort((a, b) => a.date.localeCompare(b.date))[0];
              return `
            <tr onclick="openClientDetail(${c.id})" style="cursor:pointer">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--accent-dim);
                    display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;color:var(--accent);flex-shrink:0">
                    ${initials(c.nom, c.prenom)}
                  </div>
                  <div>
                    <div style="font-weight:500">${c.prenom} ${c.nom}</div>
                    ${c.notes ? `<div style="font-size:10px;color:var(--ink-muted)">${c.notes.substring(0, 36)}${c.notes.length > 36 ? "…" : ""}</div>` : ""}
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size:12px">${c.email || "—"}</div>
                <div style="font-size:11px;color:var(--ink-muted)">${c.tel || "—"}</div>
              </td>
              <td><span class="text-mono">${c.dateNaissance ? formatDate(c.dateNaissance) : "—"}</span></td>
              <td>${c.allergies ? `<span class="badge badge-red">⚠ ${c.allergies}</span>` : '<span style="color:var(--ink-muted)">—</span>'}</td>
              <td>
                <span class="badge badge-gold">${rdvCount}</span>
                ${nextRdv ? `<div style="font-size:10px;color:var(--ink-muted);margin-top:3px">prochain: ${formatDate(nextRdv.date)}</div>` : ""}
              </td>
              <td><span class="badge badge-blue">${ctCount}</span></td>
              <td><span class="text-mono text-muted">${formatDate(c.createdAt)}</span></td>
              <td onclick="event.stopPropagation()">
                <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm" onclick="openAddRdvForClient(${c.id})">+ RDV</button>
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
    </div>`
    }
  `;
}

function openAddClient() {
  openModal(`
    <div class="modal-title">NOUVEAU CLIENT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Prénom *</label>
        <input class="form-input" id="c-prenom" placeholder="Jean">
      </div>
      <div class="form-group">
        <label class="form-label">Nom *</label>
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
      <label class="form-label">Comment nous a-t-il/elle trouvé ?</label>
      <select class="form-select" id="c-source">
        <option value="">—</option>
        <option>Instagram</option>
        <option>Recommandation</option>
        <option>Google</option>
        <option>Passage</option>
        <option>Autre</option>
      </select>
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
    toast("Prénom et nom obligatoires", "error");
    return;
  }
  await DB.addClient({
    prenom,
    nom,
    email: document.getElementById("c-email").value.trim(),
    tel: document.getElementById("c-tel").value.trim(),
    dateNaissance: document.getElementById("c-dob").value,
    allergies: document.getElementById("c-allergies").value.trim(),
    source: document.getElementById("c-source").value,
    notes: document.getElementById("c-notes").value.trim(),
  });
  closeModal();
  renderClients();
  toast(`${prenom} ${nom} ajouté(e)`, "success");
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
  toast("Fiche mise à jour", "success");
}

async function deleteClient(id) {
  const c = DB.getClient(id);
  if (!c) return;
  if (
    !confirm(`Supprimer ${c.prenom} ${c.nom} ? Cette action est irréversible.`)
  )
    return;
  await DB.deleteClient(id);
  renderClients();
  toast("Client supprimé", "info");
}

function openClientDetail(id) {
  const c = DB.getClient(id);
  if (!c) return;
  const rdvs = DB.getRdvsForClient(id).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const contrats = DB.getContratsForClient(id);
  const today = new Date().toISOString().split("T")[0];
  const prochains = rdvs.filter(
    (r) => r.date >= today && r.statut !== "annule",
  );
  const historique = rdvs.filter(
    (r) => r.date < today || r.statut === "termine",
  );

  openModal(
    `
    <div class="modal-title">${c.prenom} ${c.nom}</div>
    <div class="client-detail-header">
      <div class="client-avatar-lg">${initials(c.nom, c.prenom)}</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:500">${c.prenom} ${c.nom}</div>
        <div style="font-size:12px;color:var(--ink-muted);margin-top:3px">${c.email || "—"} · ${c.tel || "—"}</div>
        <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">Né(e) le ${c.dateNaissance ? formatDate(c.dateNaissance) : "—"}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          ${c.allergies ? `<span class="badge badge-red">⚠ ${c.allergies}</span>` : ""}
          <span class="badge badge-gold">${rdvs.length} RDV total</span>
          <span class="badge badge-blue">${contrats.length} contrat${contrats.length > 1 ? "s" : ""}</span>
          ${c.source ? `<span class="badge badge-gray">${c.source}</span>` : ""}
        </div>
      </div>
    </div>

    ${c.notes ? `<div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-size:12px;color:var(--ink-muted);margin-bottom:16px;font-style:italic">${c.notes}</div>` : ""}

    ${
      prochains.length > 0
        ? `
      <div class="section-title">Prochains RDV</div>
      <div style="margin-bottom:14px">
        ${prochains
          .map(
            (r) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:12px;font-weight:500">${r.titre}</div>
              <div style="font-size:10px;color:var(--ink-muted)">${formatDate(r.date)} à ${r.heure} · ${r.duree}min</div>
            </div>
            ${statutBadge(r.statut)}
          </div>
        `,
          )
          .join("")}
      </div>`
        : ""
    }

    <div class="section-title">Historique</div>
    ${
      historique.length === 0
        ? '<div style="color:var(--ink-muted);font-size:12px;margin-bottom:14px">Aucun historique</div>'
        : `<div style="margin-bottom:14px">
          ${historique
            .slice(0, 6)
            .map(
              (r) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-size:12px">${r.titre}</div>
                <div style="font-size:10px;color:var(--ink-muted)">${formatDate(r.date)} · ${r.duree}min${r.tarif ? " · " + formatMoney(r.tarif) : ""}</div>
                ${
                  r.lotAiguille || (r.lotEncre && r.lotEncre.length > 0)
                    ? `
                  <div style="margin-top:3px;display:flex;gap:4px">
                    ${r.lotAiguille ? lotBadge(r.lotAiguille) : ""}
                    ${(r.lotEncre || []).map((id) => lotBadge(id)).join("")}
                  </div>`
                    : ""
                }
              </div>
              ${statutBadge(r.statut)}
            </div>
          `,
            )
            .join("")}
        </div>`
    }

    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-ghost" onclick="closeModal();openEditClient(${id})">MODIFIER</button>
      <button class="btn btn-primary" onclick="closeModal();openAddRdvForClient(${id})">+ RDV</button>
    </div>
  `,
    true,
  );
}
