// === CONTRATS DE CONSENTEMENT — v1.2 ===

function renderContrats() {
  const contrats = DB.getContrats().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  document.getElementById("page-contrats").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">CONTRATS</div>
        <div class="page-subtitle">${contrats.length} CONTRAT${contrats.length > 1 ? "S" : ""} GÉNÉRÉ${contrats.length > 1 ? "S" : ""}</div>
      </div>
      <button class="btn btn-primary" onclick="openNewContrat()">+ NOUVEAU CONTRAT</button>
    </div>

    ${
      contrats.length === 0
        ? `
      <div class="empty-state"><div class="empty-icon">◪</div><div class="empty-text">AUCUN CONTRAT GÉNÉRÉ</div></div>
    `
        : `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CLIENT</th><th>DESCRIPTION</th><th>ZONE</th><th>DATE</th>
            <th>PRIX</th><th>SIGNÉ</th><th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${contrats
            .map((c) => {
              const solde = ((c.prixTotal || 0) - (c.acompte || 0)).toFixed(2);
              return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:28px;height:28px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--accent-dim);
                    display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--accent);font-family:var(--font-mono)">
                    ${
                      c.clientNom
                        ? c.clientNom
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                        : "?"
                    }
                  </div>
                  ${c.clientNom || "—"}
                </div>
              </td>
              <td>${c.description || "—"}</td>
              <td><span class="badge badge-blue">${c.zone || "—"}</span></td>
              <td><span class="text-mono">${formatDate(c.date)}</span></td>
              <td>
                ${
                  c.prixTotal
                    ? `
                  <div style="font-family:var(--font-mono);font-size:12px">
                    <div style="color:var(--ink)">${parseFloat(c.prixTotal).toFixed(2)} €</div>
                    ${c.acompte ? `<div style="color:var(--ink-muted);font-size:10px">Solde : ${solde} €</div>` : ""}
                  </div>
                `
                    : '<span style="color:var(--ink-muted)">—</span>'
                }
              </td>
              <td>${c.signe ? '<span class="badge badge-green">✓ SIGNÉ</span>' : '<span class="badge badge-yellow">EN ATTENTE</span>'}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="previewContrat(${c.id})">VOIR</button>
                  <button class="btn btn-ghost btn-sm" onclick="openEditContrat(${c.id})">EDIT</button>
                  <button class="btn btn-primary btn-sm" onclick="printContrat(${c.id})">⬇ PDF</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteContrat(${c.id})">✕</button>
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

// ── Helpers lots ─────────────────────────────────────────────────────────────

// Retourne les stocks d'une catégorie avec au moins 1 unité disponible
function _stocksDispos(categorie) {
  return DB.getStocks().filter(
    (s) => s.categorie === categorie && s.quantite > 0,
  );
}

// Construit une ligne "produit + lot" pour le formulaire.
// prefix   : "aig" | "enc"
// index    : identifiant unique de la ligne (0, Date.now(), …)
// stockId  : id du stock pré-sélectionné (ou "manuel"), null si vide
// lotValue : valeur pré-remplie du champ numLot
function _buildLotRow(prefix, index, stockId, lotValue) {
  // Résout la catégorie de stock selon le préfixe
  const categorie = prefix === "aig" ? "Aiguilles" : "Encres";
  const stocks = _stocksDispos(categorie);

  const selectOptions = stocks
    .map(
      (s) =>
        `<option value="${s.id}" ${s.id == stockId ? "selected" : ""}>${s.nom}</option>`,
    )
    .join("");

  const isManuel = stockId === "manuel";

  return `
    <div id="${prefix}-row-${index}" style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px">
      <div class="form-group" style="flex:2;margin-bottom:0">
        <label class="form-label">${index === 0 ? (prefix === "aig" ? "Aiguille" : "Encre") : ""}</label>
        <select class="form-select" id="${prefix}-stock-${index}" onchange="_onLotStockChange('${prefix}',${index})">
          <option value="">— Sélectionner dans le stock —</option>
          ${selectOptions}
          <option value="manuel" ${isManuel ? "selected" : ""}>✎ Saisie manuelle</option>
        </select>
      </div>
      <div class="form-group" style="flex:1;margin-bottom:0">
        <label class="form-label">${index === 0 ? "N° de lot" : ""}</label>
        <input class="form-input" id="${prefix}-lot-${index}"
          placeholder="Lot / Ref..."
          value="${lotValue || ""}"
          style="font-family:var(--font-mono);font-size:12px">
      </div>
      <button class="btn btn-danger btn-sm" style="flex-shrink:0;margin-bottom:0"
        onclick="_removeLotRow('${prefix}',${index})">✕</button>
    </div>
  `;
}

function _onLotStockChange(prefix, index) {
  const sel = document.getElementById(`${prefix}-stock-${index}`);
  const lotInput = document.getElementById(`${prefix}-lot-${index}`);
  if (!sel || !lotInput) return;

  if (sel.value && sel.value !== "manuel") {
    const stock = DB.getStocks().find((s) => s.id == sel.value);
    // Clé canonique : numLot
    lotInput.value = stock?.numLot || "";
    lotInput.placeholder = stock?.numLot ? "" : "Lot non renseigné — saisir";
  } else {
    lotInput.value = "";
    lotInput.placeholder = "Lot / Ref...";
    lotInput.focus();
  }
}

function _removeLotRow(prefix, index) {
  const row = document.getElementById(`${prefix}-row-${index}`);
  if (row) row.remove();
}

function _addLotRow(prefix) {
  const container = document.getElementById(`${prefix}-rows`);
  if (!container) return;
  const index = Date.now();
  const div = document.createElement("div");
  div.innerHTML = _buildLotRow(prefix, index, null, "");
  container.appendChild(div.firstElementChild);
}

// Collecte toutes les lignes lot d'un prefix
function _collectLots(prefix) {
  const container = document.getElementById(`${prefix}-rows`);
  if (!container) return [];
  const rows = container.querySelectorAll(`[id^="${prefix}-row-"]`);
  const result = [];
  rows.forEach((row) => {
    const idAttr = row.id.replace(`${prefix}-row-`, "");
    const sel = document.getElementById(`${prefix}-stock-${idAttr}`);
    const lot = document.getElementById(`${prefix}-lot-${idAttr}`);
    if (!sel) return;
    const stockId = sel.value;
    if (!stockId) return; // ligne vide ignorée
    const stock =
      stockId !== "manuel" ? DB.getStocks().find((s) => s.id == stockId) : null;
    result.push({
      stockId,
      nomProduit: stock ? stock.nom : lot?.value?.trim() || "—",
      numLot: lot?.value?.trim() || "",
    });
  });
  return result;
}

// ── Formulaire contrat — HTML partagé création / édition ─────────────────────

const ZONES_CORPORELLES = [
  "Bras droit",
  "Bras gauche",
  "Avant-bras droit",
  "Avant-bras gauche",
  "Épaule droite",
  "Épaule gauche",
  "Dos",
  "Poitrine",
  "Ventre",
  "Cuisse droite",
  "Cuisse gauche",
  "Mollet droit",
  "Mollet gauche",
  "Cheville",
  "Pied",
  "Cou",
  "Tête",
  "Autre",
];

function _buildContratForm({ title, data, onSave, onPreview }) {
  const clients = DB.getClients();
  const today = new Date().toISOString().split("T")[0];
  const d = data || {};

  // Reconstruit les lignes lots existantes (édition) ou une ligne vide (création)
  const aigRows =
    d.lotsAiguilles && d.lotsAiguilles.length > 0
      ? d.lotsAiguilles
          .map((l, i) => _buildLotRow("aig", i, l.stockId, l.numLot))
          .join("")
      : _buildLotRow("aig", 0, null, "");

  const encRows =
    d.lotsEncres && d.lotsEncres.length > 0
      ? d.lotsEncres
          .map((l, i) => _buildLotRow("enc", i, l.stockId, l.numLot))
          .join("")
      : _buildLotRow("enc", 0, null, "");

  return `
    <div class="modal-title">${title}</div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="ct-client" onchange="fillContratClient()">
          <option value="">Sélectionner...</option>
          ${clients.map((c) => `<option value="${c.id}" ${c.id === d.clientId ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="ct-date" type="date" value="${d.date || today}">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Description du tatouage</label>
      <input class="form-input" id="ct-desc" placeholder="Dragon avant-bras droit, mandala épaule..." value="${d.description || ""}">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Zone corporelle</label>
        <select class="form-select" id="ct-zone">
          ${ZONES_CORPORELLES.map((z) => `<option ${z === d.zone ? "selected" : ""}>${z}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Signé ?</label>
        <select class="form-select" id="ct-signe">
          <option value="false" ${!d.signe ? "selected" : ""}>Non (à signer)</option>
          <option value="true"  ${d.signe ? "selected" : ""}>Oui (signé)</option>
        </select>
      </div>
    </div>

    <!-- PRODUITS UTILISÉS -->
    <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--accent);margin-bottom:14px">
        PRODUITS UTILISÉS & N° DE LOT
        <span style="color:var(--ink-muted);font-size:9px;margin-left:8px;letter-spacing:1px">(traçabilité réglementaire)</span>
      </div>

      <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:1px;margin-bottom:6px">AIGUILLES</div>
      <div id="aig-rows">${aigRows}</div>
      <button class="btn btn-ghost btn-sm" style="margin-bottom:14px" onclick="_addLotRow('aig')">+ Ajouter une aiguille</button>

      <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:1px;margin-bottom:6px">ENCRES</div>
      <div id="enc-rows">${encRows}</div>
      <button class="btn btn-ghost btn-sm" onclick="_addLotRow('enc')">+ Ajouter une encre</button>
    </div>

    <!-- CONDITIONS FINANCIÈRES -->
    <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--accent);margin-bottom:12px">CONDITIONS FINANCIÈRES</div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Prix total (€)</label>
          <input class="form-input" id="ct-prix" type="number" step="0.01" min="0" placeholder="0.00"
            value="${d.prixTotal || ""}" oninput="updateSoldePreview()">
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Acompte versé (€)</label>
          <input class="form-input" id="ct-acompte" type="number" step="0.01" min="0" placeholder="0.00"
            value="${d.acompte || ""}" oninput="updateSoldePreview()">
        </div>
      </div>
      <div id="solde-preview" style="margin-top:10px;font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);text-align:right"></div>
    </div>

    <div class="form-group">
      <label class="form-label">Allergies (pré-remplies depuis la fiche client)</label>
      <input class="form-input" id="ct-allergies" placeholder="Aucune connue" value="${d.allergies || ""}">
    </div>
    <div class="form-group">
      <label class="form-label">Notes médicales</label>
      <textarea class="form-textarea" id="ct-medical" placeholder="Problèmes de coagulation, diabète, traitements...">${d.medical || ""}</textarea>
    </div>

    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-ghost" onclick="${onPreview}">APERÇU</button>
      <button class="btn btn-primary" onclick="${onSave}">ENREGISTRER</button>
    </div>
  `;
}

// ── Formulaire nouveau contrat ────────────────────────────────────────────────

function openNewContrat() {
  openModal(
    _buildContratForm({
      title: "NOUVEAU CONTRAT",
      data: null,
      onSave: "saveNewContrat()",
      onPreview: "previewNewContrat()",
    }),
  );
}

function updateSoldePreview() {
  const total = parseFloat(document.getElementById("ct-prix")?.value) || 0;
  const acompte = parseFloat(document.getElementById("ct-acompte")?.value) || 0;
  const el = document.getElementById("solde-preview");
  if (!el) return;
  if (total > 0) {
    const solde = total - acompte;
    const color = solde <= 0 ? "var(--green)" : "var(--accent)";
    el.innerHTML = `Solde à régler le jour J : <span style="color:${color};font-weight:700">${solde.toFixed(2)} €</span>`;
  } else {
    el.innerHTML = "";
  }
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
  const prixTotal = parseFloat(document.getElementById("ct-prix")?.value) || 0;
  const acompte = parseFloat(document.getElementById("ct-acompte")?.value) || 0;

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
    prixTotal,
    acompte,
    lotsAiguilles: _collectLots("aig"),
    lotsEncres: _collectLots("enc"),
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
  toast("Contrat généré ✓", "success");
}

// ── Édition d'un contrat existant ────────────────────────────────────────────

function openEditContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (!ct) return;

  openModal(
    _buildContratForm({
      title: "MODIFIER CONTRAT",
      data: ct,
      onSave: `saveEditContrat(${id})`,
      onPreview: `previewEditContrat(${id})`,
    }),
  );

  // Déclenche le preview du solde si prix déjà renseigné
  updateSoldePreview();
}

async function saveEditContrat(id) {
  const data = getContratData();
  if (!data.clientId || !data.description) {
    alert("Client et description obligatoires.");
    return;
  }
  await DB.updateContrat(id, data);
  closeModal();
  renderContrats();
  toast("Contrat mis à jour ✓", "success");
}

function previewEditContrat(id) {
  const liveData = getContratData();
  if (!liveData.description) {
    alert("Remplissez au moins la description.");
    return;
  }
  // Fusionne avec l'id/createdAt existants pour que le PDF soit cohérent
  const ct = DB.getContrats().find((c) => c.id === id);
  const merged = { ...ct, ...liveData };
  window._pendingContratData = merged;
  openModal(`
    <div class="modal-title">APERÇU CONTRAT</div>
    ${generateContratHTML(merged)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal();openEditContrat(${id})">← RETOUR</button>
      <button class="btn btn-primary" onclick="printContratData(window._pendingContratData)">⬇ EXPORTER PDF</button>
    </div>
  `);
}

// ── Génération HTML du contrat ────────────────────────────────────────────────

function _getStudioSettings() {
  if (typeof _cache !== "undefined" && _cache.settings) return _cache.settings;
  try {
    return JSON.parse(localStorage.getItem("inkmaster_settings") || "{}");
  } catch (e) {
    return {};
  }
}

function generateContratHTML(contrat) {
  const signLine =
    '<div style="margin-top:8px;border-bottom:1px solid #333;height:40px"></div>';
  const s = _getStudioSettings();

  const studioNom = s.studioNom || "Plan'Ink Studio";
  const studioAdresse =
    [s.studioAdresse, s.studioVille].filter(Boolean).join(" — ") ||
    "123 Rue de l'Encre — 75000 Paris";
  const studioTel = s.studioTel || "";
  const studioEmail = s.studioEmail || "";
  const studioSite = s.studioSite || "";
  const studioSiret = s.studioSiret || "";
  const studioMention = s.studioMention || "";

  const headerLogoHtml = s.logoBase64
    ? `<img src="${s.logoBase64}" alt="Logo studio" style="max-height:70px;max-width:220px;object-fit:contain;margin:0 auto 10px;display:block">`
    : `<h2 style="font-size:22px;font-weight:700;letter-spacing:2px">${studioNom}</h2>`;

  const prixTotal = parseFloat(contrat.prixTotal) || 0;
  const acompte = parseFloat(contrat.acompte) || 0;
  const solde = prixTotal - acompte;

  const aiguilles = contrat.lotsAiguilles || [];
  const encres = contrat.lotsEncres || [];

  function buildLotsTable(items, label) {
    if (!items || items.length === 0) {
      return `<tr>
        <td style="padding:6px 10px;border:1px solid #ddd;color:#888;font-style:italic">${label} utilisé(e)</td>
        <td style="padding:6px 10px;border:1px solid #ddd;border-bottom:1px solid #aaa;min-width:160px">&nbsp;</td>
      </tr>`;
    }
    return items
      .map(
        (item) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd">${item.nomProduit || "—"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-family:monospace;font-size:12px">
          ${item.numLot || '<span style="color:#aaa;font-style:italic">—</span>'}
        </td>
      </tr>
    `,
      )
      .join("");
  }

  return `
    <div class="contrat-preview">
      <div class="studio-header">
        ${headerLogoHtml}
        <div style="font-size:12px;color:#555;margin-top:4px">
          ${studioAdresse}
          ${studioTel ? `<br>Tél : ${studioTel}` : ""}
          ${studioEmail ? ` — ${studioEmail}` : ""}
          ${studioSite ? `<br>${studioSite}` : ""}
          ${studioSiret ? `<br>SIRET : ${studioSiret}` : ""}
          ${studioMention ? `<br><em>${studioMention}</em>` : ""}
        </div>
        <h2 style="margin-top:14px;font-size:16px;letter-spacing:2px">FORMULAIRE DE CONSENTEMENT ÉCLAIRÉ</h2>
        <div style="font-size:11px;color:#777;margin-top:4px">Document légal — à conserver</div>
      </div>

      <h3>1. INFORMATIONS CLIENT</h3>
      <p><strong>Nom complet :</strong> <span class="field-line">${contrat.clientNom || ""}</span></p>
      <p><strong>Date de naissance :</strong> <span class="field-line">${contrat.clientDob ? new Date(contrat.clientDob).toLocaleDateString("fr-FR") : ""}</span></p>
      <p><strong>Téléphone :</strong> <span class="field-line">${contrat.clientTel || ""}</span></p>
      <p><strong>Email :</strong> <span class="field-line">${contrat.clientEmail || ""}</span></p>

      <h3>2. DESCRIPTION DE LA PRESTATION</h3>
      <p><strong>Tatouage :</strong> ${contrat.description || ""}</p>
      <p><strong>Zone corporelle :</strong> ${contrat.zone || ""}</p>
      <p><strong>Date de la séance :</strong> ${contrat.date ? new Date(contrat.date).toLocaleDateString("fr-FR") : ""}</p>

      <h3>3. PRODUITS UTILISÉS</h3>
      <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:12px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:7px 10px;text-align:left;border:1px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:1px;width:60%">Produit</th>
            <th style="padding:7px 10px;text-align:left;border:1px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:1px">N° de lot</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fafafa">
            <td colspan="2" style="padding:5px 10px;border:1px solid #ddd;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555">Aiguilles</td>
          </tr>
          ${buildLotsTable(aiguilles, "Aiguille")}
          <tr style="background:#fafafa">
            <td colspan="2" style="padding:5px 10px;border:1px solid #ddd;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555">Encres</td>
          </tr>
          ${buildLotsTable(encres, "Encre")}
        </tbody>
      </table>
      <p style="font-size:11px;color:#777;margin-top:4px">
        Ces informations sont enregistrées à des fins de traçabilité conformément à la réglementation en vigueur.
      </p>

      <h3>4. DÉCLARATIONS MÉDICALES</h3>
      <p>Je déclare ne pas être dans l'une des situations suivantes susceptibles de contre-indiquer la réalisation d'un tatouage :</p>
      <ul style="margin:8px 0 8px 20px;line-height:2">
        <li>Grossesse ou allaitement</li>
        <li>Maladie auto-immune ou immunodépression</li>
        <li>Troubles de la coagulation sanguine</li>
        <li>Diabète non contrôlé</li>
        <li>Infection cutanée active sur la zone</li>
        <li>Traitement anticoagulant en cours</li>
        <li>Allergie aux colorants ou produits d'hygiène</li>
      </ul>
      <p><strong>Allergies connues :</strong> ${contrat.allergies || "Aucune connue"}</p>
      ${contrat.medical ? `<p><strong>Informations médicales complémentaires :</strong> ${contrat.medical}</p>` : ""}

      <h3>5. CONSENTEMENT ÉCLAIRÉ</h3>
      <p>Je reconnais avoir été informé(e) des éléments suivants :</p>
      <ul style="margin:8px 0 8px 20px;line-height:1.8">
        <li>Le tatouage est un acte permanent et irréversible</li>
        <li>Des rougeurs, gonflements et démangeaisons temporaires sont normaux durant la cicatrisation</li>
        <li>Le résultat final dépend notamment de la qualité de ma cicatrisation et du respect des soins post-séance</li>
        <li>En cas d'antécédents médicaux, une consultation médicale préalable est recommandée</li>
        <li>Le tatoueur se réserve le droit de refuser la prestation s'il l'estime contre-indiquée</li>
      </ul>
      <p>Je confirme être majeur(e), en bonne santé, et ne pas être sous l'influence d'alcool ou de substances.</p>
      <p>J'ai lu et compris les informations ci-dessus. Je consens librement à la réalisation de ce tatouage.</p>

      <h3>6. SOINS POST-TATOUAGE</h3>
      <ul style="margin:8px 0 8px 20px;line-height:1.8">
        <li>Garder le film protecteur en place selon les indications</li>
        <li>Nettoyer délicatement à l'eau tiède et savon doux</li>
        <li>Appliquer une crème cicatrisante adaptée</li>
        <li>Éviter l'exposition au soleil et la baignade pendant la cicatrisation</li>
        <li>Ne pas gratter ou frotter la zone tatouée</li>
      </ul>

      <h3>7. AUTORISATION PHOTOGRAPHIQUE</h3>
      <p>J'autorise / Je n'autorise pas le studio à utiliser des photos à des fins promotionnelles (biffer la mention inutile).</p>

      ${
        prixTotal > 0
          ? `
      <h3>8. CONDITIONS FINANCIÈRES</h3>
      <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left;border:1px solid #ddd;font-size:11px;letter-spacing:1px;text-transform:uppercase">Désignation</th>
            <th style="padding:8px 12px;text-align:right;border:1px solid #ddd;font-size:11px;letter-spacing:1px;text-transform:uppercase">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd">Prix total de la prestation</td>
            <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;font-weight:600">${prixTotal.toFixed(2)} €</td>
          </tr>
          ${
            acompte > 0
              ? `
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;color:#555">Acompte déjà versé</td>
            <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;color:#555">− ${acompte.toFixed(2)} €</td>
          </tr>
          <tr style="background:#fffbe6">
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:700">Solde à régler le jour de la séance</td>
            <td style="padding:10px 12px;border:1px solid #ddd;text-align:right;font-weight:700;font-size:15px">${solde.toFixed(2)} €</td>
          </tr>
          `
              : ""
          }
        </tbody>
      </table>
      <p style="font-size:11px;color:#777;margin-top:6px">
        Le paiement du solde est dû le jour de la séance, avant le début de la prestation.
        En cas d'annulation moins de 48h avant la séance, l'acompte reste acquis au studio.
      </p>
      `
          : ""
      }

      <div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
        <div>
          <div style="font-size:11px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Signature du client</div>
          <div style="font-size:10px;color:#777;margin-bottom:4px">Précédée de "Lu et approuvé"</div>
          ${signLine}${signLine}
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Signature du tatoueur</div>
          <div style="font-size:10px;color:#777;margin-bottom:4px">Cachet du studio</div>
          ${signLine}${signLine}
        </div>
      </div>
      <div style="margin-top:20px;font-size:10px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:12px">
        Document établi le ${new Date().toLocaleDateString("fr-FR")} — ${studioNom} — Conforme RGPD
      </div>
    </div>
  `;
}

// ── Preview & impression ──────────────────────────────────────────────────────

function previewContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (!ct) return;
  openModal(`
    <div class="modal-title">CONTRAT — ${ct.clientNom}</div>
    ${generateContratHTML(ct)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-ghost" onclick="closeModal();openEditContrat(${id})">EDIT</button>
      <button class="btn btn-primary" onclick="printContrat(${id})">⬇ EXPORTER PDF</button>
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
  openModal(`
    <div class="modal-title">APERÇU CONTRAT</div>
    ${generateContratHTML(data)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal();openNewContrat()">← RETOUR</button>
      <button class="btn btn-primary" onclick="printContratData(window._pendingContratData)">⬇ EXPORTER PDF</button>
    </div>
  `);
}

function printContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (ct) printContratData(ct);
}

function printContratData(ct) {
  const html = generateContratHTML(ct);

  if (
    typeof window.electronAPI !== "undefined" &&
    typeof window.electronAPI.printToPDF === "function"
  ) {
    const filename = `contrat_${(ct.clientNom || "client").replace(/\s+/g, "_").toLowerCase()}_${ct.date || "date"}.pdf`;
    window.electronAPI
      .printToPDF({ html: _buildPrintHTML(html, ct), filename })
      .catch(() => _fallbackPrint(html, ct));
    return;
  }

  _fallbackPrint(html, ct);
}

function _buildPrintHTML(html, ct) {
  return `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>Contrat — ${ct.clientNom || "Client"}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${_getPrintCSS()}
  </head><body>${html}</body></html>`;
}

function _fallbackPrint(html, ct) {
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) {
    alert("Autorisez les popups pour exporter le PDF.");
    return;
  }
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>Contrat — ${ct.clientNom || "Client"}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${_getPrintCSS()}
  </head><body>
    ${html}
    <div class="print-actions">
      <button class="print-btn" onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
      <p class="print-hint">Dans la boîte de dialogue, choisissez <strong>« Enregistrer en PDF »</strong> comme imprimante.</p>
    </div>
  </body></html>`);
  win.document.close();
  win.addEventListener("load", () => setTimeout(() => win.print(), 400));
}

function _getPrintCSS() {
  return `<style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; font-size:13px; color:#111; background:#fff; }
    .contrat-preview { background:#fff; color:#111; padding:32px 40px; max-width:800px; margin:0 auto; }
    .studio-header { text-align:center; border-bottom:2px solid #111; padding-bottom:16px; margin-bottom:20px; }
    h2 { font-size:18px; font-weight:700; }
    h3 { font-size:11px; font-weight:700; margin:16px 0 6px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #ddd; padding-bottom:4px; color:#333; }
    p  { line-height:1.7; margin-bottom:5px; }
    li { line-height:1.8; }
    ul { margin:6px 0 6px 20px; }
    table { border-collapse:collapse; }
    .field-line { border-bottom:1px solid #999; display:inline-block; min-width:200px; }
    .print-actions { text-align:center; padding:24px; border-top:1px solid #eee; margin-top:16px; }
    .print-btn { padding:12px 32px; font-size:14px; font-family:'DM Sans',sans-serif; cursor:pointer; background:#111; color:#fff; border:none; border-radius:6px; }
    .print-hint { margin-top:10px; font-size:12px; color:#777; }
    @page { margin:12mm 14mm; size:A4; }
    @media print { .print-actions { display:none; } body { padding:0; } .contrat-preview { padding:0; } }
  </style>`;
}

async function deleteContrat(id) {
  if (confirm("Supprimer ce contrat ?")) {
    await DB.deleteContrat(id);
    renderContrats();
    toast("Contrat supprimé", "info");
  }
}

// ── Pré-remplissage depuis un RDV (appelé depuis agenda.js) ──────────────────
function openNewContratFromRdv(rdv) {
  const c = DB.getClient(rdv.clientId);
  openModal(
    _buildContratForm({
      title: "NOUVEAU CONTRAT",
      data: {
        clientId: rdv.clientId,
        date: rdv.date,
        description: rdv.titre,
        allergies: c ? c.allergies || "" : "",
      },
      onSave: "saveNewContrat()",
      onPreview: "previewNewContrat()",
    }),
  );
}
