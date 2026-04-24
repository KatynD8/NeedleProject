// === CONTRATS DE CONSENTEMENT ===

// ---------- Persistance paramètres studio ----------
function getStudioLogo() {
  return localStorage.getItem("inkmaster_studio_logo") || null;
}
function setStudioLogo(d) {
  localStorage.setItem("inkmaster_studio_logo", d);
}
function getStudioInfo() {
  try {
    return JSON.parse(localStorage.getItem("inkmaster_studio_info") || "{}");
  } catch {
    return {};
  }
}
function setStudioInfo(o) {
  localStorage.setItem("inkmaster_studio_info", JSON.stringify(o));
}

// ---------- RENDU LISTE ----------
function renderContrats() {
  const contrats = DB.getContrats().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const logo = getStudioLogo();
  const info = getStudioInfo();

  document.getElementById("page-contrats").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">CONTRATS</div>
        <div class="page-subtitle">${contrats.length} CONTRAT${contrats.length > 1 ? "S" : ""} GENERE${contrats.length > 1 ? "S" : ""}</div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost" onclick="openStudioSettings()">STUDIO</button>
        <button class="btn btn-primary" onclick="openNewContrat()">+ NOUVEAU CONTRAT</button>
      </div>
    </div>

    ${
      logo
        ? `<div class="card" style="display:flex;align-items:center;gap:16px;padding:12px 18px;margin-bottom:24px;border-color:var(--accent-dim)">
           <img src="${logo}" style="max-height:44px;max-width:140px;object-fit:contain">
           <div>
             <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:1px">${info.nom || "STUDIO"}</div>
             <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">${info.adresse || ""}</div>
           </div>
           <div style="margin-left:auto"><span class="badge badge-green">LOGO CONFIGURE</span></div>
         </div>`
        : `<div class="card" style="display:flex;align-items:center;gap:14px;padding:12px 18px;margin-bottom:24px;border-style:dashed">
           <div>
             <div style="font-size:13px;font-weight:500">Personnalisez vos contrats</div>
             <div style="font-size:11px;color:var(--ink-muted);margin-top:2px">Ajoutez le logo de votre studio pour des documents professionnels</div>
           </div>
           <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="openStudioSettings()">CONFIGURER</button>
         </div>`
    }

    ${
      contrats.length === 0
        ? `
      <div class="empty-state"><div class="empty-icon">◪</div><div class="empty-text">AUCUN CONTRAT GÉNÉRÉ</div></div>
    `
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>CLIENT</th><th>DESCRIPTION</th><th>ZONE</th><th>DATE</th><th>TRAÇABILITÉ</th><th>SIGNÉ</th><th>GÉNÉRÉ LE</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          ${contrats
            .map(
              (c) => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:26px;height:26px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--accent-dim);
                    display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--accent);font-family:var(--font-mono)">
                    ${
                      c.clientNom
                        ? c.clientNom
                            .split(" ")
                            .map((w) => w[0] || "")
                            .join("")
                        : "?"
                    }
                  </div>
                  <span style="font-size:12px">${c.clientNom || "—"}</span>
                </div>
              </td>
              <td style="font-size:12px;max-width:180px">${c.description || "—"}</td>
              <td><span class="badge badge-blue">${c.zone || "—"}</span></td>
              <td><span class="text-mono">${formatDate(c.date)}</span></td>
              <td>
                ${
                  c.tracabilite && c.tracabilite.length > 0
                    ? `<span class="badge badge-green" title="${c.tracabilite.map((l) => l.numeroLot).join(", ")}">✓ ${c.tracabilite.length} lot${c.tracabilite.length > 1 ? "s" : ""}</span>`
                    : `<span class="badge badge-gray" style="color:var(--ink-muted);border-color:var(--border)">—</span>`
                }
              </td>
              <td>${c.signe ? '<span class="badge badge-green">✓ SIGNÉ</span>' : '<span class="badge badge-yellow">EN ATTENTE</span>'}</td>
              <td><span class="text-mono text-muted">${formatDate(c.createdAt)}</span></td>
              <td>
                <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm" onclick="previewContrat(${c.id})">VOIR</button>
                  <button class="btn btn-primary btn-sm" onclick="printContrat(${c.id})">🖨 PDF</button>
                  ${!c.signe ? `<button class="btn btn-success btn-sm" onclick="markSigned(${c.id})">✓</button>` : ""}
                  <button class="btn btn-danger btn-sm" onclick="deleteContrat(${c.id})">✕</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    }
  `;
}

// ---------- PARAMETRES STUDIO ----------
function openStudioSettings() {
  const logo = getStudioLogo();
  const info = getStudioInfo();
  openModal(`
    <div class="modal-title">PARAMETRES STUDIO</div>
    <div class="section-title" style="margin-bottom:12px">Logo</div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div id="logo-preview" style="width:130px;height:64px;border:1px dashed var(--border);border-radius:var(--radius);
        display:flex;align-items:center;justify-content:center;background:var(--bg-base);overflow:hidden;flex-shrink:0">
        ${
          logo
            ? `<img src="${logo}" style="max-width:100%;max-height:100%;object-fit:contain">`
            : `<span style="font-size:10px;color:var(--ink-muted);font-family:var(--font-mono)">AUCUN LOGO</span>`
        }
      </div>
      <div>
        <label class="btn btn-ghost btn-sm" style="cursor:pointer;display:inline-flex">
          CHOISIR UN FICHIER
          <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="display:none" onchange="handleLogoUpload(event)">
        </label>
        ${logo ? `<button class="btn btn-danger btn-sm" style="margin-top:8px;display:block" onclick="removeStudioLogo()">SUPPRIMER</button>` : ""}
        <div style="font-size:10px;color:var(--ink-muted);margin-top:6px">PNG, JPG, SVG · max 2 Mo · Fond transparent recommande</div>
      </div>
    </div>
    <div class="section-title" style="margin-bottom:12px">Informations legales</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nom du studio</label>
        <input class="form-input" id="si-nom" value="${info.nom || ""}" placeholder="InkMaster Studio">
      </div>
      <div class="form-group">
        <label class="form-label">Telephone</label>
        <input class="form-input" id="si-tel" value="${info.tel || ""}" placeholder="01 23 45 67 89">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Adresse complete</label>
      <input class="form-input" id="si-adresse" value="${info.adresse || ""}" placeholder="123 Rue de l'Encre, 75000 Paris">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="si-email" value="${info.email || ""}" placeholder="contact@studio.fr">
      </div>
      <div class="form-group">
        <label class="form-label">Site web</label>
        <input class="form-input" id="si-web" value="${info.web || ""}" placeholder="www.studio.fr">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">SIRET</label>
        <input class="form-input" id="si-siret" value="${info.siret || ""}" placeholder="000 000 000 00000">
      </div>
      <div class="form-group">
        <label class="form-label">Declaration prefecture</label>
        <input class="form-input" id="si-decl" value="${info.decl || ""}" placeholder="N° de declaration d'activite">
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveStudioSettings()">ENREGISTRER</button>
    </div>
  `);
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert("Fichier trop volumineux (max 2 Mo).");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    setStudioLogo(e.target.result);
    const p = document.getElementById("logo-preview");
    if (p)
      p.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:100%;object-fit:contain">`;
  };
  reader.readAsDataURL(file);
}

function removeStudioLogo() {
  localStorage.removeItem("inkmaster_studio_logo");
  openStudioSettings();
}

function saveStudioSettings() {
  setStudioInfo({
    nom: document.getElementById("si-nom").value.trim(),
    tel: document.getElementById("si-tel").value.trim(),
    adresse: document.getElementById("si-adresse").value.trim(),
    email: document.getElementById("si-email").value.trim(),
    web: document.getElementById("si-web").value.trim(),
    siret: document.getElementById("si-siret").value.trim(),
    decl: document.getElementById("si-decl").value.trim(),
  });
  closeModal();
  renderContrats();
}

// ---------- FORMULAIRE NOUVEAU CONTRAT ----------
let _lotsTemp = [];

function renderLotsRows() {
  const stocks = DB.getStocks();
  const tbody = document.getElementById("lots-tbody");
  if (!tbody) return;
  tbody.innerHTML = _lotsTemp
    .map(
      (lot, i) => `
    <tr>
      <td style="padding:4px 0">
        <select class="form-select" style="font-size:12px;padding:6px 10px"
          onchange="onLotProductChange(${i}, this.value)">
          <option value="">— Choisir —</option>
          ${stocks
            .map(
              (s) => `
            <option value="${s.id}"
              data-nom="${s.nom}" data-lot="${s.numLot || ""}" data-perem="${s.datePeremption || ""}"
              ${lot.produitId == s.id ? "selected" : ""}>
              ${s.categorie} · ${s.nom}${s.numLot ? " (" + s.numLot + ")" : ""}
            </option>
          `,
            )
            .join("")}
        </select>
      </td>
      <td style="padding:4px 6px">
        <input class="form-input" style="font-size:12px;padding:6px 10px" placeholder="N° de lot"
          id="lot-num-${i}" value="${lot.numLot || ""}"
          oninput="_lotsTemp[${i}].numLot=this.value">
      </td>
      <td style="padding:4px 0">
        <input class="form-input" style="font-size:12px;padding:6px 10px" type="date"
          id="lot-perem-${i}" value="${lot.datePeremption || ""}"
          oninput="_lotsTemp[${i}].datePeremption=this.value">
      </td>
      <td style="padding:4px 0 4px 6px">
        <button class="btn btn-danger btn-sm" onclick="removeLotRow(${i})">X</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function onLotProductChange(i, produitId) {
  const s = DB.getStocks().find((x) => x.id == produitId);
  if (!s) return;
  _lotsTemp[i].produitId = s.id;
  _lotsTemp[i].produitNom = s.nom;
  _lotsTemp[i].numLot = s.numLot || "";
  _lotsTemp[i].datePeremption = s.datePeremption || "";
  renderLotsRows();
}

function addLotRow() {
  _lotsTemp.push({
    produitId: "",
    produitNom: "",
    numLot: "",
    datePeremption: "",
  });
  renderLotsRows();
}

function removeLotRow(i) {
  _lotsTemp.splice(i, 1);
  renderLotsRows();
}

function openNewContrat() {
  _lotsTemp = [];
  const clients = DB.getClients();
  const today = new Date().toISOString().split("T")[0];
  openModal(`
    <div class="modal-title">NOUVEAU CONTRAT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="ct-client" onchange="fillContratClient()">
          <option value="">Selectionner...</option>
          ${clients.map((c) => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date de seance</label>
        <input class="form-input" id="ct-date" type="date" value="${today}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description du tatouage *</label>
      <input class="form-input" id="ct-desc" placeholder="Dragon avant-bras droit, mandala épaule...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Zone corporelle</label>
        <select class="form-select" id="ct-zone">
          <option>Bras droit</option><option>Bras gauche</option>
          <option>Avant-bras droit</option><option>Avant-bras gauche</option>
          <option>Epaule droite</option><option>Epaule gauche</option>
          <option>Dos</option><option>Poitrine</option><option>Ventre</option>
          <option>Cuisse droite</option><option>Cuisse gauche</option>
          <option>Mollet droit</option><option>Mollet gauche</option>
          <option>Cheville</option><option>Pied</option><option>Cou</option><option>Tete</option><option>Autre</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Statut signature</label>
        <select class="form-select" id="ct-signe">
          <option value="false">Non signe</option>
          <option value="true">Signe sur place</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Allergies (auto depuis fiche client)</label>
        <input class="form-input" id="ct-allergies" placeholder="Aucune connue">
      </div>
      <div class="form-group">
        <label class="form-label">Prix séance (€)</label>
        <input class="form-input" id="ct-prix" type="number" step="10" value="0">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes médicales</label>
      <textarea class="form-textarea" id="ct-medical" placeholder="Problèmes de coagulation, diabète, traitements..." style="min-height:55px"></textarea>
    </div>

    <div style="border-top:1px solid var(--border);margin:16px 0 14px;padding-top:14px">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--accent);margin-bottom:12px">◈ TRAÇABILITÉ DES LOTS UTILISÉS</div>

      <div class="form-group">
        <label class="form-label">Lot(s) d'encres utilisés</label>
        ${
          lotsEncre.length === 0
            ? `<div style="font-size:11px;color:var(--ink-muted);padding:8px 0">Aucun lot d'encre actif enregistré</div>`
            : `<div id="ct-lots-encre" style="display:flex;flex-direction:column;gap:6px;max-height:130px;overflow-y:auto;padding:4px 0">
              ${lotsEncre
                .map(
                  (l) => `
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px">
                  <input type="checkbox" value="${l.id}" name="lot-encre" style="accent-color:var(--accent)">
                  <span style="font-family:var(--font-mono);font-size:10px;color:var(--accent)">${l.numeroLot}</span>
                  <span style="color:var(--ink-muted)">${l.nom}</span>
                  ${l.datePeremption ? `<span style="font-size:10px;color:var(--ink-muted);margin-left:auto">exp. ${l.datePeremption}</span>` : ""}
                </label>
              `,
                )
                .join("")}
            </div>`
        }
      </div>

      <div class="form-group">
        <label class="form-label">Lot d'aiguilles utilisé</label>
        ${
          lotsAiguilles.length === 0
            ? `<div style="font-size:11px;color:var(--ink-muted);padding:8px 0">Aucun lot d'aiguilles actif enregistré</div>`
            : `<select class="form-select" id="ct-lot-aiguille">
              <option value="">— Aucun / non sélectionné</option>
              ${lotsAiguilles.map((l) => `<option value="${l.id}">${l.numeroLot} — ${l.nom} (exp. ${l.datePeremption || "N/A"})</option>`).join("")}
            </select>`
        }
      </div>

      ${
        lotsAutres.length > 0
          ? `
      <div class="form-group">
        <label class="form-label">Autres lots (films, soins...)</label>
        <div id="ct-lots-autres" style="display:flex;flex-direction:column;gap:6px;max-height:100px;overflow-y:auto;padding:4px 0">
          ${lotsAutres
            .map(
              (l) => `
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px">
              <input type="checkbox" value="${l.id}" name="lot-autre" style="accent-color:var(--accent)">
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--accent)">${l.numeroLot}</span>
              <span style="color:var(--ink-muted)">${l.nom} (${l.categorie})</span>
            </label>
          `,
            )
            .join("")}
        </div>
      </div>`
          : ""
      }
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-ghost" onclick="previewNewContrat()">APERCU</button>
      <button class="btn btn-primary" onclick="saveNewContrat()">GENERER</button>
    </div>
  `,
    true,
  );
}

function fillContratClient() {
  const id = parseInt(document.getElementById("ct-client").value);
  const c = DB.getClient(id);
  if (c && c.allergies)
    document.getElementById("ct-allergies").value = c.allergies;
}

function getContratData() {
  const clientId = parseInt(document.getElementById("ct-client").value);
  const c = DB.getClient(clientId);

  // Collect selected lot IDs for encres
  const lotsEncreIds = [
    ...document.querySelectorAll('input[name="lot-encre"]:checked'),
  ].map((el) => parseInt(el.value));

  // Aiguilles select
  const lotAiguilleEl = document.getElementById("ct-lot-aiguille");
  const lotAiguilleId =
    lotAiguilleEl && lotAiguilleEl.value ? parseInt(lotAiguilleEl.value) : null;

  // Autres lots
  const lotsAutresIds = [
    ...document.querySelectorAll('input[name="lot-autre"]:checked'),
  ].map((el) => parseInt(el.value));

  // Build tracabilite array with full lot info snapshot
  const tracabilite = [];
  lotsEncreIds.forEach((id) => {
    const l = DB.getLot(id);
    if (l) tracabilite.push({ categorie: "Encre", ...l });
  });
  if (lotAiguilleId) {
    const l = DB.getLot(lotAiguilleId);
    if (l) tracabilite.push({ categorie: "Aiguilles", ...l });
  }
  lotsAutresIds.forEach((id) => {
    const l = DB.getLot(id);
    if (l) tracabilite.push({ categorie: l.categorie, ...l });
  });

  return {
    clientId,
    clientNom: c ? `${c.prenom} ${c.nom}` : "",
    clientDob: c ? c.dateNaissance : "",
    clientEmail: c ? c.email : "",
    clientTel: c ? c.tel : "",
    description: document.getElementById("ct-desc").value.trim(),
    zone: document.getElementById("ct-zone").value,
    date: document.getElementById("ct-date").value,
    signe: document.getElementById("ct-signe").value === "true",
    allergies: document.getElementById("ct-allergies").value.trim(),
    medical: document.getElementById("ct-medical").value.trim(),
    prix: parseFloat(document.getElementById("ct-prix").value) || 0,
    tracabilite,
  };
}

async function saveNewContrat() {
  const data = getContratData();
  if (!data.clientId || !data.description) {
    alert("Client et description obligatoires.");
    return;
  }
  await DB.addContrat(data);
  closeModal();
  renderContrats();
  toast("Contrat généré", "success");
}

async function markSigned(id) {
  await DB.updateContrat(id, { signe: true });
  renderContrats();
  toast("Contrat marqué comme signé", "success");
}

function generateContratHTML(ct) {
  const s = DB.getSettings();
  const signLine =
    '<div style="margin-top:6px;border-bottom:1px solid #333;height:36px"></div>';
  return `
    <div class="contrat-preview">
      <div class="studio-header">
        <h2>${s.studioNom || "Plan'ink Studio"}</h2>
        <div style="font-size:11px;color:#555;margin-top:4px">${s.studioAdresse || ""} — Tél : ${s.studioTel || ""} — ${s.studioEmail || ""}</div>
        <h2 style="margin-top:10px;font-size:14px;letter-spacing:2px">FORMULAIRE DE CONSENTEMENT ÉCLAIRÉ</h2>
        <div style="font-size:10px;color:#777;margin-top:3px">Document légal — à conserver</div>
      </div>

      <h3>1. INFORMATIONS CLIENT</h3>
      <p><strong>Nom complet :</strong> <span class="field-line">${ct.clientNom || ""}</span></p>
      <p><strong>Date de naissance :</strong> <span class="field-line">${ct.clientDob ? new Date(ct.clientDob + "T12:00:00").toLocaleDateString("fr-FR") : ""}</span></p>
      <p><strong>Téléphone :</strong> <span class="field-line">${ct.clientTel || ""}</span></p>
      <p><strong>Email :</strong> <span class="field-line">${ct.clientEmail || ""}</span></p>

      <h3>2. DESCRIPTION DE LA PRESTATION</h3>
      <p><strong>Tatouage :</strong> ${ct.description || ""}</p>
      <p><strong>Zone corporelle :</strong> ${ct.zone || ""}</p>
      <p><strong>Date de la séance :</strong> ${ct.date ? new Date(ct.date + "T12:00:00").toLocaleDateString("fr-FR") : ""}</p>
      ${ct.prix ? `<p><strong>Prix convenu :</strong> ${ct.prix.toFixed(2).replace(".", ",")} €</p>` : ""}

      <h3>3. DÉCLARATIONS MÉDICALES</h3>
      <p>Je déclare ne pas être dans l'une des situations suivantes susceptibles de contre-indiquer la réalisation d'un tatouage :</p>
      <ul style="margin:6px 0 6px 18px;line-height:2">
        <li>Grossesse ou allaitement</li>
        <li>Maladie auto-immune ou immunodépression</li>
        <li>Troubles de la coagulation sanguine</li>
        <li>Diabète non contrôlé</li>
        <li>Infection cutanée active sur la zone</li>
        <li>Traitement anticoagulant en cours</li>
        <li>Allergie aux colorants ou produits d'hygiène</li>
      </ul>
      <p><strong>Allergies connues :</strong> ${ct.allergies || "Aucune connue"}</p>
      ${ct.medical ? `<p><strong>Informations complémentaires :</strong> ${ct.medical}</p>` : ""}

      <h3>4. CONSENTEMENT ÉCLAIRÉ</h3>
      <p>Je reconnais avoir été informé(e) des éléments suivants :</p>
      <ul style="margin:6px 0 6px 18px;line-height:1.8">
        <li>Le tatouage est un acte permanent et irréversible</li>
        <li>Des rougeurs, gonflements et démangeaisons temporaires sont normaux durant la cicatrisation</li>
        <li>Le résultat final dépend notamment de la qualité de ma cicatrisation et du respect des soins post-séance</li>
        <li>En cas d'antécédents médicaux, une consultation médicale préalable est recommandée</li>
        <li>Le tatoueur se réserve le droit de refuser la prestation s'il l'estime contre-indiquée</li>
      </ul>
      <p>Je confirme être majeur(e), en bonne santé, et ne pas être sous l'influence d'alcool ou de substances.</p>
      <p>J'ai lu et compris les informations ci-dessus. Je consens librement à la réalisation de ce tatouage.</p>

      <h3>5. SOINS POST-TATOUAGE</h3>
      <ul style="margin:6px 0 6px 18px;line-height:1.8">
        <li>Garder le film protecteur en place selon les indications (minimum 3h, idéalement 24h pour Saniderm)</li>
        <li>Nettoyer délicatement à l'eau tiède et savon doux 2 fois par jour</li>
        <li>Appliquer une crème cicatrisante adaptée (Bepanthen ou équivalent)</li>
        <li>Éviter l'exposition au soleil et la baignade pendant la cicatrisation (3 semaines minimum)</li>
        <li>Ne pas gratter ou frotter la zone tatouée</li>
        <li>En cas de réaction anormale, contacter un médecin et informer le studio</li>
      </ul>

      <h3>6. AUTORISATION PHOTOGRAPHIQUE</h3>
      <p>J'autorise ☐ / Je n'autorise pas ☐ le studio à utiliser des photos à des fins promotionnelles (réseaux sociaux, portfolio).</p>

      ${
        ct.tracabilite && ct.tracabilite.length > 0
          ? `
      <h3>7. TRAÇABILITÉ DU MATÉRIEL UTILISÉ</h3>
      <p style="font-size:11px;color:#555;margin-bottom:8px">Conformément à la réglementation en vigueur (arrêté du 12 décembre 2008 relatif à la pratique du tatouage), les informations suivantes concernant le matériel utilisé sont consignées :</p>
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:6px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Type</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Produit</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">N° de lot</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Fabricant</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Date fab.</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Péremption</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #ddd;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Stérilisation</th>
          </tr>
        </thead>
        <tbody>
          ${ct.tracabilite
            .map(
              (l) => `
            <tr>
              <td style="padding:5px 8px;border:1px solid #ddd">${l.categorie || "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd;font-weight:500">${l.nom || "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd;font-family:monospace;font-size:10px">${l.numeroLot || "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd">${l.fabricant || "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd">${l.dateFabrication ? new Date(l.dateFabrication + "T12:00:00").toLocaleDateString("fr-FR") : "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd">${l.datePeremption ? new Date(l.datePeremption + "T12:00:00").toLocaleDateString("fr-FR") : "—"}</td>
              <td style="padding:5px 8px;border:1px solid #ddd">${l.certificationSterilisation || "—"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      `
          : ""
      }

      <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div>
          <div style="font-size:10px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Signature du client</div>
          <div style="font-size:9px;color:#777;margin-bottom:3px">Précédée de "Lu et approuvé"</div>
          ${signLine}${signLine}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Signature du tatoueur</div>
          <div style="font-size:9px;color:#777;margin-bottom:3px">Cachet du studio</div>
          ${signLine}${signLine}
        </div>
      </div>
      <div style="margin-top:16px;font-size:9px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:10px">
        Document établi le ${new Date().toLocaleDateString("fr-FR")} — ${s.studioNom || "Plan'ink Studio"} — Conforme RGPD
      </div>
    </div>
  </div>
</div>

<div class="sig-section">
  <div class="sig-box">
    <div class="sig-title">Signature du client</div>
    <div class="sig-hint">Precede de la mention manuscrite "Lu et approuve"</div>
    <div class="sig-line"></div>
    <div class="sig-line"></div>
    <div class="sig-meta">Nom : ${contrat.clientNom || "________________________________"}</div>
    <div class="sig-meta">Date : ${dateDoc}</div>
  </div>
  <div class="sig-box">
    <div class="sig-title">Cachet et signature du praticien</div>
    <div class="sig-hint">Cachet du studio si applicable</div>
    <div class="sig-line"></div>
    <div class="sig-line"></div>
    <div class="sig-meta">Studio : ${studioNom}</div>
    <div class="sig-meta">Date : ${dateDoc}</div>
  </div>
</div>

<div class="footer">
  <div class="footer-l">${studioNom} &bull; ${studioAdr}${studioSiret ? ` &bull; SIRET ${studioSiret}` : ""}</div>
  <div class="footer-r">Ref. ${refNum} &bull; Document conforme RGPD<br>Etabli le ${new Date().toLocaleDateString("fr-FR")} &bull; A conserver 10 ans</div>
</div>

</div>
</body>
</html>`;
}

// ---------- APERCU ET IMPRESSION ----------
function previewContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (!ct) return;
  openModal(
    `
    <div class="modal-title">CONTRAT — ${ct.clientNom}</div>
    ${generateContratHTML(ct)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-primary" onclick="printContrat(${id})">PDF / IMPRIMER</button>
    </div>
  `);
}

function previewNewContrat() {
  const data = getContratData();
  if (!data.description) {
    alert("Remplissez au moins la description.");
    return;
  }
  window._pendingContratData = data;
  openModal(
    `
    <div class="modal-title">APERÇU CONTRAT</div>
    ${generateContratHTML(data)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
      <button class="btn btn-ghost" onclick="closeModal();openNewContrat()">← RETOUR</button>
      <button class="btn btn-primary" onclick="printContratData(window._pendingContratData)">🖨 IMPRIMER</button>
    </div>
  `);
}

function printContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (ct) printContratData(ct);
}

function printContratData(ct) {
  const html = generateContratHTML(ct);
  const win = window.open("", "_blank", "width=820,height=920");
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>Contrat — ${ct.clientNom || "Client"}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans',sans-serif;font-size:12px;color:#111;background:#fff;padding:20px}
      .contrat-preview{background:#fff;color:#111;padding:28px;max-height:none}
      .studio-header{text-align:center;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:16px}
      h2{font-size:16px;font-weight:700}
      h3{font-size:11px;font-weight:700;margin:12px 0 4px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ddd;padding-bottom:2px}
      p,li{line-height:1.6;margin-bottom:3px}ul{margin:5px 0 5px 16px}
      .field-line{border-bottom:1px solid #999;display:inline-block;min-width:160px}
      @media print{button{display:none}body{padding:0}}
    </style>
  </head><body>
    ${html}
    <div style="text-align:center;margin-top:16px">
      <button onclick="window.print()" style="padding:9px 22px;font-size:13px;cursor:pointer;background:#111;color:#fff;border:none;border-radius:4px">
        🖨 Imprimer / Enregistrer en PDF
      </button>
      <div style="margin-top:8px;font-size:10px;color:#bbb">Selectionner "Enregistrer en PDF" comme destination d'impression</div>
    </div>`;
  win.document.write(
    html.replace("</div>\n</body>", `</div>${printBtn}</body>`),
  );
  win.document.close();
}

async function deleteContrat(id) {
  if (!confirm("Supprimer ce contrat ?")) return;
  await DB.deleteContrat(id);
  renderContrats();
  toast("Contrat supprimé", "info");
}
