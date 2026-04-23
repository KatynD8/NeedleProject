// === CONTRATS DE CONSENTEMENT ===

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
          <tr><th>CLIENT</th><th>DESCRIPTION</th><th>ZONE</th><th>DATE</th><th>SIGNÉ</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          ${contrats
            .map(
              (c) => `
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
              <td>${c.signe ? '<span class="badge badge-green">✓ SIGNÉ</span>' : '<span class="badge badge-yellow">EN ATTENTE</span>'}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="previewContrat(${c.id})">VOIR</button>
                  <button class="btn btn-primary btn-sm" onclick="printContrat(${c.id})">🖨 PDF</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteContrat(${c.id})">✕</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
    }
  `;
}

function openNewContrat() {
  const clients = DB.getClients();
  const today = new Date().toISOString().split("T")[0];
  openModal(`
    <div class="modal-title">NOUVEAU CONTRAT</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client</label>
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
      <label class="form-label">Description du tatouage</label>
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
    <div class="form-group">
      <label class="form-label">Allergies (pré-remplies depuis la fiche client)</label>
      <input class="form-input" id="ct-allergies" placeholder="Aucune connue">
    </div>
    <div class="form-group">
      <label class="form-label">Notes médicales</label>
      <textarea class="form-textarea" id="ct-medical" placeholder="Problèmes de coagulation, diabète, traitements..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-ghost" onclick="previewNewContrat()">APERÇU</button>
      <button class="btn btn-primary" onclick="saveNewContrat()">GÉNÉRER</button>
    </div>
  `);
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
}

function generateContratHTML(contrat) {
  const signLine =
    '<div style="margin-top:8px;border-bottom:1px solid #333;height:40px"></div>';
  return `
    <div class="contrat-preview">
      <div class="studio-header">
        <h2>INKMASTER STUDIO</h2>
        <div style="font-size:12px;color:#555">123 Rue de l'Encre — 75000 Paris<br>Tél : 01 23 45 67 89 — contact@inkmaster.fr</div>
        <h2 style="margin-top:12px;font-size:16px;letter-spacing:2px">FORMULAIRE DE CONSENTEMENT ÉCLAIRÉ</h2>
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

      <h3>3. DÉCLARATIONS MÉDICALES</h3>
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

      <h3>4. CONSENTEMENT ÉCLAIRÉ</h3>
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

      <h3>5. SOINS POST-TATOUAGE</h3>
      <ul style="margin:8px 0 8px 20px;line-height:1.8">
        <li>Garder le film protecteur en place selon les indications</li>
        <li>Nettoyer délicatement à l'eau tiède et savon doux</li>
        <li>Appliquer une crème cicatrisante adaptée</li>
        <li>Éviter l'exposition au soleil et la baignade pendant la cicatrisation</li>
        <li>Ne pas gratter ou frotter la zone tatouée</li>
      </ul>

      <h3>6. AUTORISATION PHOTOGRAPHIQUE</h3>
      <p>J'autorise / Je n'autorise pas le studio à utiliser des photos à des fins promotionnelles (biffer la mention inutile).</p>

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
        Document établi le ${new Date().toLocaleDateString("fr-FR")} — InkMaster Studio — Conforme RGPD
      </div>
    </div>
  `;
}

function previewContrat(id) {
  const ct = DB.getContrats().find((c) => c.id === id);
  if (!ct) return;
  openModal(`
    <div class="modal-title">CONTRAT — ${ct.clientNom}</div>
    ${generateContratHTML(ct)}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-ghost" onclick="closeModal()">FERMER</button>
      <button class="btn btn-primary" onclick="printContrat(${id})">🖨 IMPRIMER / PDF</button>
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
  const win = window.open("", "_blank", "width=800,height=900");
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>Contrat — ${ct.clientNom || "Client"}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans',sans-serif;font-size:13px;color:#111;background:#fff;padding:20px}
      .contrat-preview{background:#fff;color:#111;padding:32px;max-height:none}
      .studio-header{text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:20px}
      h2{font-size:18px;font-weight:700}
      h3{font-size:12px;font-weight:700;margin:14px 0 5px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ddd;padding-bottom:3px}
      p,li{line-height:1.7;margin-bottom:4px}ul{margin:6px 0 6px 18px}
      .field-line{border-bottom:1px solid #999;display:inline-block;min-width:180px}
      @media print{button{display:none}}
    </style>
  </head><body>
    ${html}
    <div style="text-align:center;margin-top:20px">
      <button onclick="window.print()" style="padding:10px 24px;font-size:14px;cursor:pointer;background:#111;color:#fff;border:none;border-radius:4px">
        🖨 Imprimer / Enregistrer en PDF
      </button>
    </div>
  </body></html>`);
  win.document.close();
}

async function deleteContrat(id) {
  if (confirm("Supprimer ce contrat ?")) {
    await DB.deleteContrat(id);
    renderContrats();
  }
}

// === PRÉ-REMPLISSAGE DEPUIS UN RDV ===
function openNewContratPreFilled({ clientId, description, date, allergies }) {
  const clients = DB.getClients();
  openModal(`
    <div class="modal-title">NOUVEAU CONTRAT</div>
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(39,174,96,0.12);border:1px solid rgba(39,174,96,0.3);border-radius:4px;margin-bottom:16px">
      <span style="color:#2ecc71;font-size:11px;font-family:var(--font-mono)">✓ PRÉ-REMPLI DEPUIS LE RDV</span>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Client</label>
        <select class="form-select" id="ct-client" onchange="fillContratClient()">
          <option value="">Sélectionner...</option>
          ${clients.map((c) => `<option value="${c.id}" ${c.id == clientId ? "selected" : ""}>${c.prenom} ${c.nom}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="ct-date" type="date" value="${date || new Date().toISOString().split("T")[0]}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description du tatouage</label>
      <input class="form-input" id="ct-desc" value="${description || ""}" placeholder="Dragon avant-bras droit...">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Zone corporelle</label>
        <select class="form-select" id="ct-zone">
          <option>Bras droit</option><option>Bras gauche</option><option>Avant-bras droit</option><option>Avant-bras gauche</option>
          <option>Épaule droite</option><option>Épaule gauche</option><option>Dos</option><option>Poitrine</option><option>Ventre</option>
          <option>Cuisse droite</option><option>Cuisse gauche</option><option>Mollet droit</option><option>Mollet gauche</option>
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
    <div class="form-group">
      <label class="form-label">Allergies</label>
      <input class="form-input" id="ct-allergies" value="${allergies || ""}" placeholder="Aucune connue">
    </div>
    <div class="form-group">
      <label class="form-label">Notes médicales</label>
      <textarea class="form-textarea" id="ct-medical" placeholder="Problèmes de coagulation, diabète, traitements..."></textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
      <button class="btn btn-ghost" onclick="closeModal()">ANNULER</button>
      <button class="btn btn-ghost" onclick="previewNewContrat()">APERÇU</button>
      <button class="btn btn-primary" onclick="saveNewContrat()">GÉNÉRER</button>
    </div>
  `);
}
