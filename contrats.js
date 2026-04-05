// === CONTRATS ===

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

function openNewContrat() {
  const clients = DB.getClients();
  const today = new Date().toISOString().split("T")[0];
  const lots = DB.getActiveLots();
  const lotsEncre = lots.filter((l) => l.categorie === "Encres");
  const lotsAiguilles = lots.filter((l) => l.categorie === "Aiguilles");
  const lotsAutres = lots.filter(
    (l) => l.categorie !== "Encres" && l.categorie !== "Aiguilles",
  );

  openModal(
    `
    <div class="modal-title">NOUVEAU CONTRAT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client *</label>
        <select class="form-select" id="ct-client" onchange="fillContratClient()">
          <option value="">Sélectionner...</option>
          ${clients.map((c) => `<option value="${c.id}">${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
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
          <option>Épaule droite</option><option>Épaule gauche</option>
          <option>Dos</option><option>Poitrine</option><option>Ventre</option>
          <option>Cuisse droite</option><option>Cuisse gauche</option>
          <option>Mollet droit</option><option>Mollet gauche</option>
          <option>Cheville</option><option>Pied</option><option>Cou</option><option>Tête</option><option>Autre</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Signé ?</label>
        <select class="form-select" id="ct-signe">
          <option value="false">Non (à signer)</option>
          <option value="true">Oui (signé)</option>
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
      <button class="btn btn-ghost" onclick="previewNewContrat()">APERÇU</button>
      <button class="btn btn-primary" onclick="saveNewContrat()">GÉNÉRER</button>
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

function getContratFormData() {
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
  const data = getContratFormData();
  if (!data.clientId || !data.description) {
    toast("Client et description obligatoires", "error");
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
  `;
}

function previewContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (!ct) return;
  openModal(
    `
    <div class="modal-title">CONTRAT — ${ct.clientNom}</div>
    ${generateContratHTML(ct)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-primary" onclick="printContrat(${id})">🖨 IMPRIMER / PDF</button>
    </div>
  `,
    true,
  );
}

function previewNewContrat() {
  const data = getContratFormData();
  if (!data.description) {
    toast("Remplissez au moins la description", "error");
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
  `,
    true,
  );
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
    </div>
  </body></html>`);
  win.document.close();
}

async function deleteContrat(id) {
  if (!confirm("Supprimer ce contrat ?")) return;
  await DB.deleteContrat(id);
  renderContrats();
  toast("Contrat supprimé", "info");
}
