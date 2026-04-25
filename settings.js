// === PARAMÈTRES ===

function renderSettings() {
  const s = DB.getSettings();

  document.getElementById("page-settings").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">PARAMÈTRES</div>
        <div class="page-subtitle">PROFIL ARTISTE & INFORMATIONS STUDIO</div>
      </div>
    </div>

    <div class="grid-2" style="gap:24px;align-items:start">

      <!-- Profil artiste -->
      <div>
        <div class="section-title">Profil artiste</div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
            <div id="settings-avatar" style="width:64px;height:64px;border-radius:50%;background:var(--accent-glow);border:2px solid var(--accent-dim);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:24px;color:var(--accent);flex-shrink:0">
              ${s.artisteInitiales || "?"}
            </div>
            <div>
              <div style="font-size:15px;font-weight:500">${s.artisteNom || "The Artist"}</div>
              <div style="font-size:11px;color:var(--ink-muted);margin-top:3px">${s.studioNom || ""}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom d'artiste / Prénom</label>
              <input class="form-input" id="set-artiste-nom" value="${s.artisteNom || ""}" placeholder="Ex: Nico Tattoo">
            </div>
            <div class="form-group">
              <label class="form-label">Initiales (avatar)</label>
              <input class="form-input" id="set-artiste-ini" value="${s.artisteInitiales || ""}" placeholder="NT" maxlength="3" style="text-transform:uppercase">
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top:24px">Logo du studio</div>
        <div class="card">
          <div style="margin-bottom:12px">
            ${s.logoUrl
              ? `<img src="${s.logoUrl}" style="max-height:80px;max-width:220px;border-radius:var(--radius);border:1px solid var(--border);padding:8px;background:#fff">`
              : `<div style="width:220px;height:80px;border:2px dashed var(--border);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);font-family:var(--font-mono);font-size:11px">AUCUN LOGO</div>`
            }
          </div>
          <div class="form-group">
            <label class="form-label">URL du logo (https://...)</label>
            <input class="form-input" id="set-logo-url" value="${s.logoUrl || ""}" placeholder="https://monsite.fr/logo.png">
          </div>
          <div style="font-size:11px;color:var(--ink-muted)">Le logo apparaîtra en en-tête des contrats imprimés. Format PNG ou SVG recommandé.</div>
        </div>
      </div>

      <!-- Informations studio -->
      <div>
        <div class="section-title">Informations studio</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Nom du studio *</label>
            <input class="form-input" id="set-studio-nom" value="${s.studioNom || ""}" placeholder="Plan'Ink Studio">
          </div>
          <div class="form-group">
            <label class="form-label">Adresse</label>
            <input class="form-input" id="set-studio-adresse" value="${s.studioAdresse || ""}" placeholder="12 Rue des Artistes">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Code postal & Ville</label>
              <input class="form-input" id="set-studio-ville" value="${s.studioVille || ""}" placeholder="76000 Rouen">
            </div>
            <div class="form-group">
              <label class="form-label">Téléphone</label>
              <input class="form-input" id="set-studio-tel" value="${s.studioTel || ""}" placeholder="02 35 00 00 00">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="set-studio-email" value="${s.studioEmail || ""}" placeholder="contact@monstudio.fr">
            </div>
            <div class="form-group">
              <label class="form-label">Site web</label>
              <input class="form-input" id="set-studio-site" value="${s.studioSite || ""}" placeholder="www.monstudio.fr">
            </div>
          </div>

          <div style="padding-top:16px;margin-top:8px;border-top:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink-muted);text-transform:uppercase;margin-bottom:12px">Informations légales</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">SIRET</label>
                <input class="form-input" id="set-studio-siret" value="${s.studioSiret || ""}" placeholder="123 456 789 00010">
              </div>
              <div class="form-group">
                <label class="form-label">N° TVA intracommunautaire</label>
                <input class="form-input" id="set-studio-tva" value="${s.studioTva || ""}" placeholder="FR12 345678900">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Mention légale contrats</label>
              <textarea class="form-textarea" id="set-studio-mention" placeholder="Auto-entrepreneur — RCS Rouen..." style="min-height:60px">${s.studioMention || ""}</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aperçu en-tête contrat -->
    <div class="section-title" style="margin-top:28px">Aperçu en-tête de contrat</div>
    <div id="settings-preview" style="background:#fff;color:#111;border-radius:var(--radius);padding:20px 28px;border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:13px">
      ${_buildHeaderPreview(s)}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
      <button class="btn btn-ghost" onclick="renderSettings()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveSettings()">ENREGISTRER</button>
    </div>
  `;

  // Mise à jour live de l'aperçu et de l'avatar
  ["set-artiste-nom","set-artiste-ini","set-logo-url","set-studio-nom","set-studio-adresse",
   "set-studio-ville","set-studio-tel","set-studio-email","set-studio-site","set-studio-siret",
   "set-studio-tva","set-studio-mention"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", _updateSettingsPreview);
  });
}

function _buildHeaderPreview(s) {
  const logoHtml = s.logoUrl
    ? `<img src="${s.logoUrl}" style="max-height:60px;max-width:160px;display:block;margin:0 auto 8px">`
    : "";
  return `
    <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:14px">
      ${logoHtml}
      <div style="font-size:18px;font-weight:700">${s.studioNom || "Nom du studio"}</div>
      <div style="font-size:12px;color:#555;margin-top:4px">
        ${[s.studioAdresse, s.studioVille].filter(Boolean).join(" — ")}
        ${s.studioTel ? "<br>Tél : " + s.studioTel : ""}
        ${s.studioEmail ? " — " + s.studioEmail : ""}
        ${s.studioSite ? "<br>" + s.studioSite : ""}
        ${s.studioSiret ? "<br>SIRET : " + s.studioSiret : ""}
        ${s.studioMention ? "<br><em>" + s.studioMention + "</em>" : ""}
      </div>
    </div>
  `;
}

function _updateSettingsPreview() {
  const draft = {
    artisteNom:      document.getElementById("set-artiste-nom")?.value || "",
    artisteInitiales:document.getElementById("set-artiste-ini")?.value.toUpperCase() || "",
    studioNom:       document.getElementById("set-studio-nom")?.value || "",
    studioAdresse:   document.getElementById("set-studio-adresse")?.value || "",
    studioVille:     document.getElementById("set-studio-ville")?.value || "",
    studioTel:       document.getElementById("set-studio-tel")?.value || "",
    studioEmail:     document.getElementById("set-studio-email")?.value || "",
    studioSite:      document.getElementById("set-studio-site")?.value || "",
    studioSiret:     document.getElementById("set-studio-siret")?.value || "",
    studioTva:       document.getElementById("set-studio-tva")?.value || "",
    studioMention:   document.getElementById("set-studio-mention")?.value || "",
    logoUrl:         document.getElementById("set-logo-url")?.value || "",
  };
  const preview = document.getElementById("settings-preview");
  if (preview) preview.innerHTML = _buildHeaderPreview(draft);

  // Mettre à jour avatar live
  const avatar = document.getElementById("settings-avatar");
  if (avatar) avatar.textContent = draft.artisteInitiales || "?";
}

async function saveSettings() {
  const updates = {
    artisteNom:      document.getElementById("set-artiste-nom").value.trim(),
    artisteInitiales:document.getElementById("set-artiste-ini").value.trim().toUpperCase(),
    studioNom:       document.getElementById("set-studio-nom").value.trim(),
    studioAdresse:   document.getElementById("set-studio-adresse").value.trim(),
    studioVille:     document.getElementById("set-studio-ville").value.trim(),
    studioTel:       document.getElementById("set-studio-tel").value.trim(),
    studioEmail:     document.getElementById("set-studio-email").value.trim(),
    studioSite:      document.getElementById("set-studio-site").value.trim(),
    studioSiret:     document.getElementById("set-studio-siret").value.trim(),
    studioTva:       document.getElementById("set-studio-tva").value.trim(),
    studioMention:   document.getElementById("set-studio-mention").value.trim(),
    logoUrl:         document.getElementById("set-logo-url").value.trim(),
  };

  await DB.saveSettings(updates);

  // Mettre à jour la sidebar dynamiquement
  _applySidebarSettings(updates);

  toast("Paramètres enregistrés ✓", "success");
  renderSettings();
}

function _applySidebarSettings(s) {
  const nameEl = document.querySelector(".artist-name");
  const avatarEl = document.querySelector(".artist-avatar");
  if (nameEl) nameEl.textContent = s.artisteNom || "The Artist";
  if (avatarEl) avatarEl.textContent = s.artisteInitiales || "TA";
}